export const detectDate = (
  text: string
): { title: string; date: string }[] => {
  const matches = [...text.matchAll(/(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi)];
  return matches.map((match) => ({
    title: `Date: ${match[0]}`,
    date: new Date().toISOString(),
  }));
};
