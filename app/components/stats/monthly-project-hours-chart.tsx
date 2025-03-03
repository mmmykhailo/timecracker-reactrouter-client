import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { useMemo, useState } from "react";
import { ChartContainer, ChartTooltip } from "~/components/ui/chart";
import type { MonthlyDurations } from "~/lib/reports";
import { convertMonthStrToShortName } from "~/lib/date-strings";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "~/lib/classNames";
import { chartColors } from "~/lib/colors";
import { HoursChartTooltip } from "./hours-chart-tooltip";

type MonthlyProjectHoursChartProps = {
  monthlyDurations: MonthlyDurations;
  className?: string;
};

export function MonthlyProjectHoursChart({
  monthlyDurations,
  className,
}: MonthlyProjectHoursChartProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { chartData, yearNumberStr, projectNames } = useMemo(() => {
    const projectNames = new Set<string>([]);

    const yearNumberStr = selectedYear.toString();
    const chartData = Array.from({ length: 12 }, (_, index) => {
      const monthNumberStr = String(index + 1).padStart(2, "0");
      const yearMonth = `${yearNumberStr}${monthNumberStr}`;
      const monthData = monthlyDurations[yearMonth];

      const chartData: Record<string, number> = {};

      if (monthData?.byProject) {
        for (const { project, duration } of Object.values(
          monthData.byProject,
        )) {
          projectNames.add(project);
          chartData[project] = duration;
        }
      }

      return {
        yearMonth: yearMonth,
        shortMonthName: convertMonthStrToShortName(yearMonth),
        ...chartData,
      };
    });

    return {
      chartData,
      yearNumberStr,
      projectNames: Array.from(projectNames),
    };
  }, [selectedYear, monthlyDurations]);

  return (
    <div className={cn("flex flex-col gap-4 rounded-xl border p-4", className)}>
      <div className="flex justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="font-semibold leading-none tracking-tight">
            Monthly project hours
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

      <ChartContainer
        config={{}}
        className="min-h-[160px] w-full overflow-hidden"
      >
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="shortMonthName"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
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
