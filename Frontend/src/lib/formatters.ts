import { useMemo } from "react";

type RelativeInput = string | number | Date | null | undefined;

type Division = {
  amount: number;
  unit: Intl.RelativeTimeFormatUnit;
};

const DIVISIONS: Division[] = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
];

const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function coerceDate(value: RelativeInput): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatRelativeTime(value: RelativeInput): string {
  const date = coerceDate(value);
  if (!date) return "just now";

  let duration = (date.getTime() - Date.now()) / 1000;

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }

  return formatter.format(Math.round(duration), "year");
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!Number.isFinite(bytes ?? Number.NaN)) {
    return "0 B";
  }
  let value = bytes ?? 0;
  const units = ["B", "KB", "MB", "GB", "TB"] as const;
  let index = 0;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }

  const display = index === 0 ? Math.round(value).toString() : value.toFixed(1);
  return `${display} ${units[index]}`;
}

export function useRelativeTime(value: RelativeInput) {
  return useMemo(() => formatRelativeTime(value), [value]);
}
