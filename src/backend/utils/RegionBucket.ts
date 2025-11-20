export const toRegionBucket = (ip?: string): string => {
  if (!ip) return 'unknown';
  const parts = ip.split('.');
  if (parts.length !== 4) return 'unknown';
  const first = parseInt(parts[0], 10);
  if (first < 64) return 'na';
  if (first < 128) return 'eu';
  if (first < 192) return 'apac';
  return 'latam';
};
