import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { useMemo, useState } from "react";
import { ChartContainer, ChartTooltip } from "~/components/ui/chart";
import type { WeeklyDurations } from "~/lib/reports";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "~/lib/utils";
import { chartColors } from "~/lib/colors";
import { HoursChartTooltip } from "./hours-chart-tooltip";
import {
  addMonths,
  eachWeekOfInterval,
  endOfQuarter,
  formatDate,
  getISOWeek,
  getQuarter,
  getYear,
  startOfQuarter,
} from "date-fns";

type WeeklyProjectHoursChartProps = {
  weeklyDurations: WeeklyDurations;
  className?: string;
};

export function WeeklyProjectHoursChart({
  weeklyDurations,
  className,
}: WeeklyProjectHoursChartProps) {
  const [selectedQuarterStartDate, setSelectedQuarterStartDate] = useState(
    startOfQuarter(new Date()),
  );

  const { chartData, projectNames } = useMemo(() => {
    const projectNames = new Set<string>([]);

    const chartData = eachWeekOfInterval(
      {
        start: selectedQuarterStartDate,
        end: endOfQuarter(selectedQuarterStartDate),
      },
      { weekStartsOn: 1 },
    ).map((weekStartDate) => {
      const weekStartDateStr = formatDate(weekStartDate, "yyyyMMdd");

      const weekData = weeklyDurations[weekStartDateStr];

      const chartData: Record<string, number> = {};

      if (weekData?.byProject) {
        for (const { project, duration } of Object.values(weekData.byProject)) {
          projectNames.add(project);
          chartData[project] = duration;
        }
      }

      return {
        weekStartDateStr: weekStartDateStr,
        shortWeekName: `Week ${getISOWeek(weekStartDate)}`,
        ...chartData,
      };
    });

    return {
      chartData,
      projectNames: Array.from(projectNames),
    };
  }, [selectedQuarterStartDate, weeklyDurations]);

  return (
    <div className={cn("flex flex-col gap-4 rounded-xl border p-4", className)}>
      <div className="flex justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="font-semibold leading-none tracking-tight">
            Weekly project hours
          </div>
          <div className="text-muted-foreground text-sm">
            Data for{" "}
            {`Q${getQuarter(selectedQuarterStartDate)} ${getYear(selectedQuarterStartDate)}`}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setSelectedQuarterStartDate((prev) => addMonths(prev, -3))
            }
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setSelectedQuarterStartDate((prev) => addMonths(prev, 3))
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
            dataKey="shortWeekName"
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
