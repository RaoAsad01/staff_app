export const formatValue = (value) => {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`; // Billions
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`; // Millions
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`; // Thousands
    return value.toLocaleString(); // Default number formatting
};