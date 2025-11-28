export const requireUserConsent = async (action: string): Promise<boolean> => {
  const message = `Toron requests consent for ${action}. Continue?`;
  // In production, replace confirm with a richer consent surface.
  // eslint-disable-next-line no-alert
  return Promise.resolve(typeof window !== "undefined" ? window.confirm(message) : true);
};
