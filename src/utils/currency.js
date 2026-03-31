export const formatCurrency = (amount, condense = true) => {
  if (!condense) {
    return '₹' + Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (absAmount >= 10000000) return sign + '₹' + (absAmount / 10000000).toFixed(2) + 'Cr';
  if (absAmount >= 100000) return sign + '₹' + (absAmount / 100000).toFixed(2) + 'L';
  if (absAmount >= 1000) return sign + '₹' + (absAmount / 1000).toFixed(1) + 'k';

  return sign + '₹' + absAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
};
