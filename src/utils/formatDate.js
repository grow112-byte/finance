export const formatDateTime = (dateStr, createdAtStr) => {
  if (!dateStr) return '';
  const dateOnly = dateStr.split('T')[0];
  const [year, month, day] = dateOnly.split('-');
  const formattedDate = `${day}/${month}/${year}`;
  
  if (createdAtStr) {
    const dateObj = new Date(createdAtStr);
    let hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${formattedDate} ${hours}:${minutes} ${ampm}`;
  }
  return formattedDate;
};
