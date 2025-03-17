import { format, parseISO, startOfWeek } from "date-fns";

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

export const formatDateString = (date: Date) => {
  return format(date, "yyyyMMdd");
};

export const parseDateString = (dateStr: string): Date => {
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  return parseISO(`${year}-${month}-${day}`);
};

export function getWeekStartDateString(date: Date) {
  return formatDateString(startOfWeek(date, { weekStartsOn: 1 }));
}

export function convertMonthStrToShortName(monthStr: string) {
  const monthNumber = monthStr.slice(4);
  const monthIndex = Number(monthNumber) - 1;

  return shortMonthNames[monthIndex];
}
