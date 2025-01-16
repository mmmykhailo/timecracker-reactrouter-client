import { useMemo, type Dispatch, type SetStateAction } from "react";
import {
  format,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameMonth,
  parseISO,
} from "date-fns";
import { Button } from "./ui/button";
import { cn } from "~/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "./ui/badge";
import {
  DATE_FORMAT,
  type DailyDurations,
  type DailyDurationsItem,
} from "~/lib/reports";
import { formatDuration } from "~/lib/time-strings";

type HoursCalendarProps = {
  isCompact?: boolean;
  dailyDurations: DailyDurations;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  selectedMonth: Date;
  setSelectedMonth: Dispatch<SetStateAction<Date>>;
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
        isSameMonth(parseISO(date), targetMonth),
    )
    .reduce((total, [, durationItem]) => total + durationItem.duration, 0);
}

function getHoursBadgeVariant(
  durationItem: DailyDurationsItem,
  isSelected?: boolean,
) {
  if (durationItem.hasNegativeDuration) {
    return "destructive";
  }
  if (durationItem.duration === 0 || isSelected) {
    return "secondary";
  }

  return "default";
}

const HoursCalendar = ({
  isCompact,
  dailyDurations,
  selectedDate,
  setSelectedDate,
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
      duration: 0,
    };

    const isToday = isSameDay(cellDate, new Date());
    const isSelected = !!selectedDate && isSameDay(cellDate, selectedDate);
    const isSelectedMonth = isSameMonth(selectedMonth, cellDate);

    return (
      <button
        onClick={() => setSelectedDate(cellDate)}
        key={`${formattedDate}-${formattedMonth}`}
        type="button"
        className={cn(
          "p-2 flex flex-wrap gap-2 hover:bg-black/30 transition-colors cursor-pointer",
          "border-b focus-visible:z-10 outline-offset-2",
          {
            "flex-col min-h-20 justify-between": !isCompact,
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
        <div className="text-sm font-bold">{format(cellDate, "d")}</div>
        <div className="flex justify-end">
          <Badge
            className={cn("pointer-events-none opacity-90 whitespace-nowrap", {
              "opacity-50": !isSelectedMonth,
            })}
            variant={getHoursBadgeVariant(durationItem, isSelected)}
          >
            {durationItem.hasNegativeDuration
              ? "err"
              : formatDuration(durationItem.duration)}
          </Badge>
        </div>
      </button>
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
    setSelectedMonth((prev) => addDays(startOfMonth(prev), -1));
  };

  const handleNextMonth = () => {
    setSelectedMonth((prev) => addDays(endOfMonth(prev), 1));
  };

  const monthlyTotalDuration = useMemo(
    () => calculateMonthlyTotal(dailyDurations, selectedMonth),
    [dailyDurations, selectedMonth],
  );

  return (
    <div className="p-4 mx-auto">
      <div className="flex justify-between">
        <div className="flex flex-col space-y-1.5 mb-6">
          <div className="font-semibold leading-none tracking-tight">
            {format(selectedMonth, "MMMM yyyy")}
          </div>
          <div className="text-sm text-muted-foreground">
            You tracked {formatDuration(monthlyTotalDuration)} this month.
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
      <div className="border rounded-xl">
        <div className="grid grid-cols-7">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className={cn("font-semibold text-center border-b", {
                "py-1": !isCompact,
                "text-sm py-0.5": isCompact,
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
