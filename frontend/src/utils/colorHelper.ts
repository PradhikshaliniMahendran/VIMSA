/**
 * Parses a color string stored in the database.
 * Supports "Name:Hex" (e.g. "Navy Blue:#000080"), raw Hex (e.g. "#000080"), and raw names.
 */
export const parseColor = (colorStr: string): { name: string; hex: string } => {
  if (!colorStr) return { name: '', hex: '' };
  
  if (colorStr.includes(':')) {
    const [name, hex] = colorStr.split(':');
    return { name: name.trim(), hex: hex.trim() };
  }
  
  // If it starts with '#', it's a raw hex code
  if (colorStr.startsWith('#')) {
    return { name: colorStr, hex: colorStr };
  }
  
  // Otherwise, treat it as a raw name
  return { name: colorStr, hex: colorStr };
};

/**
 * Returns just the readable name of the color.
 */
export const formatColorName = (colorStr: string): string => {
  return parseColor(colorStr).name;
};
