const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Env vars required:
// MPESA_ENV=sandbox|production
// MPESA_CONSUMER_KEY
// MPESA_CONSUMER_SECRET
// MPESA_SHORT_CODE (BusinessShortCode)
// MPESA_PASSKEY
// MPESA_CALLBACK_URL (publicly accessible https endpoint)

const isSandbox = (process.env.MPESA_ENV || 'sandbox') === 'sandbox';
const baseUrl = isSandbox
  ? 'https://sandbox.safaricom.co.ke'
  : 'https://api.safaricom.co.ke';

async function getAccessToken() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  if (!consumerKey || !consumerSecret) {
    throw new Error('M-Pesa consumer key/secret not configured');
  }
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const resp = await axios.get(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` }
  });
  return resp.data.access_token;
}

function generatePassword(shortCode, passkey, timestamp) {
  return Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
}

function formatPhoneTo254(msisdn) {
  const digits = (msisdn || '').replace(/\D/g, '');
  if (digits.startsWith('254')) return digits;
  if (digits.startsWith('0')) return `254${digits.substring(1)}`;
  if (digits.startsWith('7')) return `254${digits}`;
  if (digits.startsWith('+254')) return digits.replace('+', '');
  return digits;
}

router.post('/mpesa/stkpush', [
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('phone').isString().withMessage('Phone is required'),
  body('accountReference').optional().isString().isLength({ max: 12 }),
  body('description').optional().isString().isLength({ max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const shortCode = process.env.MPESA_SHORT_CODE;
    const passkey = process.env.MPESA_PASSKEY;
    const callbackUrl = process.env.MPESA_CALLBACK_URL;
    if (!shortCode || !passkey || !callbackUrl) {
      return res.status(500).json({ message: 'M-Pesa configuration missing' });
    }

    const { amount, phone, accountReference = 'ORDER', description = 'Payment' } = req.body;
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
    const password = generatePassword(shortCode, passkey, timestamp);
    const accessToken = await getAccessToken();
    const partyA = formatPhoneTo254(phone);

    const payload = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(Number(amount)),
      PartyA: partyA,
      PartyB: shortCode,
      PhoneNumber: partyA,
      CallBackURL: callbackUrl,
      AccountReference: accountReference,
      TransactionDesc: description
    };

    const resp = await axios.post(`${baseUrl}/mpesa/stkpush/v1/processrequest`, payload, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    return res.json({
      message: 'STK Push initiated',
      data: resp.data
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: error.message };
    const detail = data?.errorMessage || data?.ResponseDescription || data?.message || data;
    console.error('STK Push error:', {
      status,
      detail,
      data
    });
    return res.status(status).json({ message: 'Failed to initiate STK Push', details: detail, error: data });
  }
});

// Safaricom will POST to this callback URL
router.post('/mpesa/callback', express.json(), async (req, res) => {
  try {
    // Always respond 200 immediately
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Callback received successfully' });

    // Process asynchronously: update your order/payment records here if needed
    const body = req.body;
    console.log('M-Pesa Callback:', JSON.stringify(body));

    const stkCallback = body?.Body?.stkCallback;
    if (stkCallback) {
      const { ResultCode, ResultDesc, CheckoutRequestID } = stkCallback;
      if (ResultCode === 0) {
        try {
          const items = stkCallback?.CallbackMetadata?.Item || [];
          const get = (name) => {
            const found = items.find(i => i.Name === name);
            return found ? found.Value : undefined;
          };
          const amount = get('Amount');
          const receipt = get('MpesaReceiptNumber');
          const phone = get('PhoneNumber');

          // Update the order matching this CheckoutRequestID
          const Order = require('../models/Order');
          const order = await Order.findOne({ 'paymentMethod.details.transactionId': CheckoutRequestID });
          if (order) {
            order.status = 'confirmed';
            order.paymentMethod.details.receipt = receipt;
            order.paymentMethod.details.phone = String(phone || '');
            await order.save();
            console.log(`Order ${order.orderNumber} marked as confirmed. Amount ${amount}, receipt ${receipt}`);
          } else {
            console.warn('No order found for CheckoutRequestID:', CheckoutRequestID);
          }
        } catch (dbErr) {
          console.error('Error updating order from callback:', dbErr);
        }
      } else {
        console.warn('STK Push failed:', ResultDesc, 'CheckoutRequestID:', CheckoutRequestID);
      }
    }
  } catch (err) {
    console.error('Callback processing error:', err);
  }
});

module.exports = router;
