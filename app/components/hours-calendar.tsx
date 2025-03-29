import {
  addDays,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { Link, href } from "react-router";
import { cn } from "~/lib/classNames";
import { formatDateString, parseDateString } from "~/lib/date-utils";
import { DATE_FORMAT } from "~/lib/reports";
import { formatDuration } from "~/lib/time-strings";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import CopyableText from "./ui/copyable-text";

type DailyDurations = Record<
  string,
  {
    totalDuration: number;
    hasNegativeDuration?: boolean;
  }
>;

type HoursCalendarProps = {
  isCompact?: boolean;
  dailyDurations: DailyDurations;
  selectedDate: Date;
  selectedMonth: Date;
  setSelectedMonth: (date: Date) => void;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function calculateMonthlyTotal(
  dailyDurations: DailyDurations,
  targetMonth: Date,
): number {
  return Object.entries(dailyDurations)
    .filter(
      ([date, dailyDuration]) =>
        !dailyDuration.hasNegativeDuration &&
        isSameMonth(parseDateString(date), targetMonth),
    )
    .reduce((total, [, durationItem]) => total + durationItem.totalDuration, 0);
}

function getHoursBadgeVariant(
  durationItem: {
    totalDuration: number;
    hasNegativeDuration?: boolean;
  },
  isSelected?: boolean,
) {
  if (durationItem.hasNegativeDuration) {
    return "destructive";
  }
  if (durationItem.totalDuration === 0 || isSelected) {
    return "secondary";
  }

  return "default";
}

const HoursCalendar = ({
  isCompact,
  dailyDurations,
  selectedDate,
  selectedMonth,
  setSelectedMonth,
}: HoursCalendarProps) => {
  const getDaysInMonth = (date: Date) => {
    const startDate = startOfMonth(date);
    const endDate = endOfMonth(date);
    const days = [];
    let current = startDate;
    while (current <= endDate) {
      days.push(current);
      current = addDays(current, 1);
    }
    return days;
  };

  const renderDayCell = (cellDate: Date) => {
    const formattedMonth = format(selectedMonth, "yyyyMM");
    const formattedDate = format(cellDate, DATE_FORMAT);
    const durationItem = dailyDurations[formattedDate] || {
      totalDuration: 0,
    };

    const isToday = isSameDay(cellDate, new Date());
    const isSelected = !!selectedDate && isSameDay(cellDate, selectedDate);
    const isSelectedMonth = isSameMonth(selectedMonth, cellDate);

    return (
      <Link
        to={href("/o/:date", {
          date: formatDateString(cellDate),
        })}
        key={`${formattedDate}-${formattedMonth}`}
        className={cn(
          "flex cursor-pointer flex-wrap gap-2 p-2 transition-colors hover:bg-black/30",
          "border-b outline-offset-2 focus-visible:z-10",
          {
            "min-h-20 flex-col justify-between": !isCompact,
            "justify-center": isCompact,
            "bg-black/15": isToday,
            "text-foreground": !isSelected && isSelectedMonth,
            "text-foreground/40": !isSelected && !isSelectedMonth,
            "text-primary-foreground hover:bg-primary/80": isSelected,
            "bg-primary/30": isSelected && !isSelectedMonth,
            "bg-primary": isSelected && isSelectedMonth,
          },
        )}
      >
        <div className="font-bold text-sm">{format(cellDate, "d")}</div>
        <div className="flex justify-end">
          <Badge
            className={cn("pointer-events-none whitespace-nowrap opacity-90", {
              "opacity-50": !isSelectedMonth,
            })}
            variant={getHoursBadgeVariant(durationItem, isSelected)}
          >
            {durationItem.hasNegativeDuration
              ? "err"
              : formatDuration(durationItem.totalDuration)}
          </Badge>
        </div>
      </Link>
    );
  };

  const renderWeekRow = (startDate: Date) => {
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

    // const weekHours = weekDays.reduce((total, day) => {
    //   const formattedDate = format(day, "yyyy-MM-dd");
    //   return total + (hoursData[formattedDate] || 0);
    // }, 0);

    return (
      <div
        key={startDate.toISOString()}
        className={cn(
          "grid grid-cols-7",
          "[&:last-child>*:first-child]:rounded-bl [&:last-child>*:last-child]:rounded-br",
          "[&:last-child>*]:border-b-0",
        )}
      >
        {weekDays.map((day) => renderDayCell(day))}
      </div>
    );
  };

  const renderCalendar = () => {
    const days = getDaysInMonth(selectedMonth);
    const weeks = [];
    let weekStart = startOfWeek(days[0]);
    while (weekStart <= days[days.length - 1]) {
      weeks.push(weekStart);
      weekStart = addDays(weekStart, 7);
    }

    return weeks.map((weekStart) => renderWeekRow(weekStart));
  };

  const handlePrevMonth = () => {
    setSelectedMonth(addDays(startOfMonth(selectedMonth), -1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(addDays(endOfMonth(selectedMonth), 1));
  };

  const monthlyTotalDuration = useMemo(
    () => calculateMonthlyTotal(dailyDurations, selectedMonth),
    [dailyDurations, selectedMonth],
  );

  return (
    <div>
      <div className="flex justify-between">
        <div className="mb-6 flex flex-col space-y-1.5">
          <div className="font-semibold leading-none tracking-tight">
            {format(selectedMonth, "MMMM yyyy")}
          </div>
          <div className="text-muted-foreground text-sm">
            You tracked{" "}
            <CopyableText>{formatDuration(monthlyTotalDuration)}</CopyableText>{" "}
            this month.
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight />
          </Button>
        </div>
      </div>
      <div className="rounded-xl border">
        <div className="grid grid-cols-7">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className={cn("border-b text-center font-semibold", {
                "py-1": !isCompact,
                "py-0.5 text-sm": isCompact,
              })}
            >
              {day}
            </div>
          ))}
        </div>
        <div>{renderCalendar()}</div>
      </div>
    </div>
  );
};

export default HoursCalendar;
