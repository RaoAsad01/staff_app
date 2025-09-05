// Generic function to safely parse a date
const parseDate = (dateString) => {
  if (!dateString) return null;
  const d = new Date(dateString);
  return isNaN(d) ? null : d;
};

// 🔹 Format: DD-MM-YYYY HH:mm AM/PM
export const formatDateTime = (dateString) => {
  const d = parseDate(dateString);
  if (!d) return '';

  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0'); // 0-indexed
  const year = d.getUTCFullYear();

  const hours = d.getUTCHours();
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  const isPM = hours >= 12;
  const formattedHours = hours % 12 || 12;
  const ampm = isPM ? 'PM' : 'AM';

  return `${day}-${month}-${year} ${formattedHours}:${minutes} ${ampm}`;
};

// 🔹 Format: DD-MM-YYYY (only date)
export const formatDateOnly = (dateString) => {
  const d = parseDate(dateString);
  if (!d) return '';

  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();

  return `${day}-${month}-${year}`;
};

// 🔹 Format: YYYY-MM-DD (ISO style)
export const formatISODate = (dateString) => {
  const d = parseDate(dateString);
  if (!d) return '';

  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();

  return `${year}-${month}-${day}`;
};

// 🔹 Format: HH:mm AM/PM (only time)
export const formatTimeOnly = (dateString) => {
  const d = parseDate(dateString);
  if (!d) return '';

  const hours = d.getUTCHours();
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  const isPM = hours >= 12;
  const formattedHours = hours % 12 || 12;
  const ampm = isPM ? 'PM' : 'AM';

  return `${formattedHours}:${minutes} ${ampm}`;
};
