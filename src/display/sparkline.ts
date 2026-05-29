/**
 * Mini sparkline for terminal trend display.
 * Renders a tiny bar chart using Unicode block characters.
 */
export function sparkline(values: number[], width: number = 8): string {
  if (values.length === 0) return "";

  const max = Math.max(...values);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const chars = "▁▂▃▄▅▆▇█";
  const step = range / (chars.length - 1);

  return values
    .slice(-width)
    .map((v) => {
      const idx = Math.min(Math.floor((v - min) / step), chars.length - 1);
      return chars[idx];
    })
    .join("");
}
