import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

const initialState = {
  items: JSON.parse(localStorage.getItem('cartItems')) || [],
  total: 0,
  itemCount: 0
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
        return { ...state, items: updatedItems };
      } else {
        return { ...state, items: [...state.items, action.payload] };
      }
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    
    case 'CLEAR_CART':
      return { ...state, items: [] };
    
    case 'CALCULATE_TOTALS':
      const total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
      return { ...state, total, itemCount };
    
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Calculate totals whenever items change
  useEffect(() => {
    dispatch({ type: 'CALCULATE_TOTALS' });
    localStorage.setItem('cartItems', JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = (product, quantity = 1) => {
    const cartItem = {
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url || '',
      quantity,
      stock: product.stockQuantity
    };

    dispatch({ type: 'ADD_ITEM', payload: cartItem });
    toast.success(`${product.name} added to cart!`);
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
    toast.success('Item removed from cart');
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    toast.success('Cart cleared');
  };

  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const isInCart = (productId) => {
    return state.items.some(item => item.id === productId);
  };

  const value = {
    ...state,
    cartItems: state.items, // Add cartItems alias for compatibility
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    isInCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
