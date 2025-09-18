export const formatKES = (value) => {
  try {
    const num = Number(value || 0);
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 2 }).format(num);
  } catch {
    return `KES ${value}`;
  }
};


