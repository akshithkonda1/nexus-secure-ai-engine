export const toHourlyBucket = (timestamp: number | Date): string => {
  const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
  date.setMinutes(0, 0, 0);
  return date.toISOString();
};
