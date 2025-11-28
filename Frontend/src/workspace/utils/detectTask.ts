export const detectTask = (text: string): string[] => {
  if (!text.trim()) return [];
  const lines = text.split(/\n|\./).map((line) => line.trim());
  return lines.filter((line) => /\b(todo|task|action|remember)\b/i.test(line));
};
