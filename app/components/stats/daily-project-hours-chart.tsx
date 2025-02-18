import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { useMemo, useState } from "react";
import { ChartContainer, ChartTooltip } from "~/components/ui/chart";
import type { DailyDurations } from "~/lib/reports";
import { shortMonthNames } from "~/lib/date-strings";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "~/lib/utils";
import { chartColors } from "~/lib/colors";
import { HoursChartTooltip } from "./hours-chart-tooltip";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  formatDate,
  getDate,
  getMonth,
  getYear,
  startOfMonth,
} from "date-fns";

type DailyProjectHoursChartProps = {
  dailyDurations: DailyDurations;
  className?: string;
};

export function DailyProjectHoursChart({
  dailyDurations,
  className,
}: DailyProjectHoursChartProps) {
  const [selectedMonthStartDate, setSelectedMonthStartDate] = useState(
    startOfMonth(new Date()),
  );

  const { chartData, projectNames } = useMemo(() => {
    const projectNames = new Set<string>([]);

    const chartData = eachDayOfInterval({
      start: selectedMonthStartDate,
      end: endOfMonth(selectedMonthStartDate),
    }).map((date) => {
      const dateStr = formatDate(date, "yyyyMMdd");

      const weekData = dailyDurations[dateStr];

      if (weekData) {
        for (const projectName of Object.keys(weekData.byProject)) {
          projectNames.add(projectName);
        }
      }

      return {
        dateStr: dateStr,
        shortDayName: getDate(date),
        ...weekData?.byProject,
      };
    });

    return {
      chartData,
      projectNames: Array.from(projectNames),
    };
  }, [selectedMonthStartDate, dailyDurations]);

  return (
    <div className={cn("flex flex-col gap-4 rounded-xl border p-4", className)}>
      <div className="flex justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="font-semibold leading-none tracking-tight">
            Daily project hours
          </div>
          <div className="text-muted-foreground text-sm">
            Data for{" "}
            {`${shortMonthNames[getMonth(selectedMonthStartDate)]} ${getYear(selectedMonthStartDate)}`}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setSelectedMonthStartDate((prev) => addMonths(prev, -1))
            }
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setSelectedMonthStartDate((prev) => addMonths(prev, 1))
            }
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <ChartContainer config={{}} className="min-h-[160px] w-full">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="shortDayName"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <ChartTooltip content={<HoursChartTooltip names={projectNames} />} />

          {projectNames.map((projectName, i) => (
            <Bar
              key={projectName}
              dataKey={projectName}
              stackId="a"
              fill={chartColors[i % chartColors.length]}
            />
          ))}
        </BarChart>
      </ChartContainer>
    </div>
  );
}
