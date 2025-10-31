import { PRICING_LOCK } from "@/config/pricing";

const MS_PER_DAY = 86_400_000;

type Params = {
  firstInstallISO: string;
  lockedUntilISO?: string;
};

const parseISO = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const computeLockedUntil = ({ firstInstallISO, lockedUntilISO }: Params) => {
  const installDate = parseISO(firstInstallISO) ?? new Date();
  const minimum = new Date(installDate.getTime() + PRICING_LOCK.durationDays * MS_PER_DAY);
  const configured = parseISO(PRICING_LOCK.anchorISO);
  const existing = parseISO(lockedUntilISO);

  const candidates = [minimum, configured, existing].filter(Boolean) as Date[];
  if (candidates.length === 0) {
    return minimum.toISOString();
  }

  const target = candidates.reduce((acc, current) => (current.getTime() > acc.getTime() ? current : acc));
  return target.toISOString();
};

export const isLocked = (lockedUntilISO: string, now: Date = new Date()) => {
  const target = parseISO(lockedUntilISO);
  if (!target) return false;
  return now.getTime() < target.getTime();
};
