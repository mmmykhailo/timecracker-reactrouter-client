import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DailyDurations } from "~/lib/reports";
import { useCallback, useMemo, useState } from "react";
import { eachDayOfInterval, endOfYear, format, startOfYear } from "date-fns";
import { cn } from "~/lib/utils";
import { formatDuration } from "~/lib/time-strings";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

type YearlyActivityGraphProps = {
  dailyDurations: DailyDurations;
  className?: string;
};

const regularDurationPerDay = 8 * 60;
const colorThresholds = [
  regularDurationPerDay,
  regularDurationPerDay * 0.75,
  regularDurationPerDay * 0.5,
  0,
]; // durations
const colorClassNames = [
  "bg-emerald-500",
  "bg-emerald-400 dark:bg-emerald-500/80",
  "bg-emerald-300 dark:bg-emerald-500/50",
  "bg-emerald-200 dark:bg-emerald-700/50",
  "bg-accent",
];

const getContributionColorClassName = (duration: number): string => {
  if (duration <= 0) {
    return colorClassNames[colorClassNames.length - 1];
  }
  for (let i = 0; i < colorThresholds.length; i++) {
    if (duration >= colorThresholds[i]) {
      return colorClassNames[i];
    }
  }

  return colorClassNames[0];
};

export function YearlyActivityGraph({
  dailyDurations,
  className,
}: YearlyActivityGraphProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { weeks, yearNumberStr } = useMemo(() => {
    const yearStart = startOfYear(new Date(selectedYear, 0));
    const yearEnd = endOfYear(new Date(selectedYear, 0));

    const allDays = eachDayOfInterval({
      start: yearStart,
      end: yearEnd,
    });

    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];

    for (const day of allDays) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    const yearNumberStr = selectedYear.toString();

    return { weeks, yearNumberStr };
  }, [selectedYear]);

  const getDailyProjectsDurations = useCallback(
    (dateKey: string): string => {
      if (!dailyDurations[dateKey]) {
        return "No activity";
      }

      const projects = Object.entries(dailyDurations[dateKey].byProject)
        .map(([project, duration]) => `${project}: ${formatDuration(duration)}`)
        .join("\n");

      return projects || "No project details";
    },
    [dailyDurations],
  );

  return (
    <div className={cn("flex flex-col gap-4 rounded-xl border p-4", className)}>
      <div className="flex justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="font-semibold leading-none tracking-tight">
            Yearly activity graph
          </div>
          <div className="text-muted-foreground text-sm">
            Data for the year {yearNumberStr}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedYear((prev) => prev - 1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSelectedYear((prev) => prev + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
      <div>
        <TooltipProvider disableHoverableContent skipDelayDuration={0}>
          <ScrollArea className="-m-1 -mb-3 max-w-full">
            <div className="flex gap-1 p-1 pb-3">
              {weeks.map((week) => (
                <div key={week[0].toString()} className="flex flex-col gap-1">
                  {week.map((day) => {
                    const dateKey = format(day, "yyyyMMdd");
                    const dailyDuration = dailyDurations[dateKey] || {
                      duration: 0,
                      byProject: {},
                    };

                    return (
                      <Tooltip key={dateKey}>
                        <TooltipTrigger>
                          <div
                            className={cn(
                              "h-3 w-3 rounded-sm hover:ring-2 hover:ring-ring",
                              getContributionColorClassName(
                                dailyDuration.duration,
                              ),
                            )}
                            data-date={dateKey}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="pointer-events-none">
                          <div className="text-sm">
                            <p className="font-semibold">
                              {format(day, "MMM d, yyyy")}
                            </p>
                            <p>{formatDuration(dailyDuration.duration)}</p>
                            <div className="mt-1 text-xs">
                              {getDailyProjectsDurations(dateKey)
                                .split("\n")
                                .map((line) => (
                                  <p key={line}>{line}</p>
                                ))}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </TooltipProvider>

        <TooltipProvider disableHoverableContent skipDelayDuration={0}>
          <div className="mt-4 flex items-center gap-2 text-muted-foreground text-sm">
            <span>Less</span>
            <div className="flex flex-row-reverse gap-1">
              {colorClassNames.map((className, i) => (
                <Tooltip key={className}>
                  <TooltipTrigger>
                    <div
                      className={cn(
                        "h-3 w-3 rounded-sm hover:ring-2 hover:ring-ring",
                        className,
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="pointer-events-none">
                    {colorThresholds[i] !== undefined ? (
                      <div className="text-sm">
                        More than {formatDuration(colorThresholds[i])}
                      </div>
                    ) : (
                      <div className="text-sm">No work this day</div>
                    )}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
            <span>More</span>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}
