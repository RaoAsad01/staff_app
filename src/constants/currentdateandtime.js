export const getFormatDate = () => {
    const currentDate = new Date();
  
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
    const year = currentDate.getFullYear();
  
    const hours = currentDate.getHours();
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const isPM = hours >= 12;
    const formattedHours = hours % 12 || 12; // Convert 24-hour time to 12-hour format
    const ampm = isPM ? 'PM' : 'AM';
  
    // Combine the parts to match the desired format
    return `${day}-${month}-${year} ${formattedHours}:${minutes} ${ampm}`;
  };
  