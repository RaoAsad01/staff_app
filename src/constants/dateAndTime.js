export const getFormattedDate = (dateString) => {
  if (!dateString) return ''; // Check if the date is null or undefined

  const backendDate = new Date(dateString);

  if (isNaN(backendDate)) return ''; // Return empty if the date is invalid

  // To display it in UTC without converting to local timezone:
  const day = String(backendDate.getUTCDate()).padStart(2, '0');
  const month = String(backendDate.getUTCMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const year = backendDate.getUTCFullYear();

  const hours = backendDate.getUTCHours();
  const minutes = String(backendDate.getUTCMinutes()).padStart(2, '0');
  const isPM = hours >= 12;
  const formattedHours = hours % 12 || 12;
  const ampm = isPM ? 'PM' : 'AM';

  return `${day}-${month}-${year} ${formattedHours}:${minutes} ${ampm}`;
};
