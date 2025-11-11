export const formatValue = (value) => {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`; // Billions
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`; // Millions
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`; // Thousands
    return value.toLocaleString(); // Default number formatting
};

export const formatValueWithPad = (value) => {
    const numericValue = Number(value ?? 0);
    const safeValue = Number.isFinite(numericValue) ? numericValue : 0;
  
    if (safeValue >= 0 && safeValue < 10) {
      return String(Math.trunc(safeValue)).padStart(2, "0");
    }
  
    return formatValue(safeValue);
  };