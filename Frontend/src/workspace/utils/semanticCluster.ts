export const semanticCluster = (text: string): string[] => {
  if (!text.trim()) return [];
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  const unique = Array.from(new Set(words));
  return unique.slice(0, 3);
};
