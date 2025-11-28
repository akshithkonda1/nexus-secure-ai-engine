export const autoTitle = (content: string): string => {
  const firstLine = content.trim().split("\n")[0];
  if (!firstLine) return "Untitled";
  return firstLine.slice(0, 60);
};
