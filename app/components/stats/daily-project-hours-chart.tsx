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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartTooltip } from "~/components/ui/chart";
import { cn } from "~/lib/classNames";
import { chartColors } from "~/lib/colors";
import { shortMonthNames } from "~/lib/date-utils";
import type { DailyDurations } from "~/lib/reports";
import { Button } from "../ui/button";
import { HoursChartTooltip } from "./hours-chart-tooltip";

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

      const chartData: Record<string, number> = {};

      if (weekData?.byProject) {
        for (const { project, duration } of Object.values(weekData.byProject)) {
          projectNames.add(project);
          chartData[project] = duration;
        }
      }

      return {
        dateStr: dateStr,
        shortDayName: getDate(date),
        ...chartData,
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

      <ChartContainer
        config={{}}
        className="min-h-[160px] w-full overflow-hidden"
      >
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
