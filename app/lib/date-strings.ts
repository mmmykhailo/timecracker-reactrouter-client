import { endOfWeek, format, parseISO, startOfWeek } from "date-fns";

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

export const parseDateString = (dateStr: string): Date => {
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  return parseISO(`${year}-${month}-${day}`);
};

export function getWeekStartDateString(dateStr: string) {
  const date = parseDateString(dateStr);
  return format(startOfWeek(date, { weekStartsOn: 1 }), "yyyyMMdd");
}

export function getWeekEndDateString(dateStr: string) {
  const date = parseDateString(dateStr);
  return format(endOfWeek(date, { weekStartsOn: 1 }), "yyyyMMdd");
}

export function convertMonthStrToShortName(monthStr: string) {
  const monthNumber = monthStr.slice(4);
  const monthIndex = Number(monthNumber) - 1;

  return shortMonthNames[monthIndex];
}
