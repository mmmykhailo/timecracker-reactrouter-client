import { utc } from "@date-fns/utc";
import {
  format,
  endOfDay as originalEndOfDay,
  endOfMonth as originalEndOfMonth,
  parseISO as originalParseISO,
  startOfDay as originalStartOfDay,
  startOfMonth as originalStartOfMonth,
  startOfWeek as originalStartOfWeek,
} from "date-fns";

export const shortMonthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const startOfDay = (date: Date) => {
  return originalStartOfDay(date, {
    in: utc,
  });
};

export const endOfDay = (date: Date) => {
  return originalEndOfDay(date, {
    in: utc,
  });
};

export const startOfWeek = (date: Date) => {
  return originalStartOfWeek(date, {
    in: utc,
    weekStartsOn: 1,
  });
};

export const startOfMonth = (date: Date) => {
  return originalStartOfMonth(date, {
    in: utc,
  });
};

export const endOfMonth = (date: Date) => {
  return originalEndOfMonth(date, {
    in: utc,
  });
};

export const parseISO = (isoStr: string) => {
  return originalParseISO(isoStr, {
    in: utc,
  });
};

export const formatDateString = (date: Date) => {
  return format(date, "yyyyMMdd", {
    in: utc,
  });
};

export const parseDateString = (dateStr: string): Date => {
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  return parseISO(`${year}-${month}-${day}`);
};

export function getWeekStartDateString(date: Date) {
  return formatDateString(startOfWeek(date));
}

export function convertMonthStrToShortName(monthStr: string) {
  const monthNumber = monthStr.slice(4);
  const monthIndex = Number(monthNumber) - 1;

  return shortMonthNames[monthIndex];
}
