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

// Month abbreviations mapping
const monthAbbreviations = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// 🔹 Format: DD MMM YYYY (e.g., "30 Oct 2025")
export const formatDateWithMonthName = (dateString) => {
  if (!dateString) return '';
  
  // Try to parse the date string first to handle ISO format (2025-10-30T20:05:00Z or 2025-10-30)
  let d;
  
  // Handle ISO format with time
  if (dateString.includes('T')) {
    d = new Date(dateString);
  }
  // Handle DD-MM-YYYY format (e.g., "11-09-2025")
  else if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split('-').map(Number);
    d = new Date(year, month - 1, day); // Month is 0-indexed, creates local date
  }
  // Handle YYYY-MM-DD format
  else if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number);
    d = new Date(year, month - 1, day); // Month is 0-indexed, creates local date
  }
  else {
    d = new Date(dateString);
  }
  
  if (!isNaN(d.getTime())) {
    // Valid date parsed successfully
    // Use UTC methods for ISO format with timezone, local methods for other formats
    let day, month, year;
    if (dateString.includes('T')) {
      // ISO format with timezone - use UTC
      day = d.getUTCDate();
      month = monthAbbreviations[d.getUTCMonth()];
      year = d.getUTCFullYear();
    } else {
      // Local date formats - use local time
      day = d.getDate();
      month = monthAbbreviations[d.getMonth()];
      year = d.getFullYear();
    }
    
      
    const formattedDate = `${day} ${month} ${year}`;
    return formattedDate;
  }
  
  
  // Fallback: Try to parse DD-MM-YYYY format manually
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in Date
    const year = parseInt(parts[2], 10);
    
    // Validate the parsed values
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return dateString; // Return original if parsing fails
    }
    
    const d = new Date(year, month, day);
    
    // Check if the date is valid
    if (isNaN(d.getTime())) {
      return dateString; // Return original if invalid
    }
    
    const formattedDay = d.getDate();
    const formattedMonth = monthAbbreviations[d.getMonth()];
    const formattedYear = d.getFullYear();
    
    return `${formattedDay} ${formattedMonth} ${formattedYear}`;
  }
  
  // If all parsing fails, return original string
  return dateString;
};
