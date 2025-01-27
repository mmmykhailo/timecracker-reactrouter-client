import type * as RechartsPrimitive from "recharts";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  useMemo,
  useState,
  type ComponentProps,
  type CSSProperties,
} from "react";
import {
  ChartContainer,
  ChartTooltip,
} from "~/components/ui/chart";
import { formatDuration } from "~/lib/time-strings";
import {
  calculateDailyDurations,
  calculateMonthlyDurations,
  type Reports,
} from "~/lib/reports";
import { convertMonthStrToShortName } from "~/lib/date-strings";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const colors = [
  "#003f5c",
  "#2f4b7c",
  "#665191",
  "#a05195",
  "#d45087",
  "#f95d6a",
  "#ff7c43",
  "#ffa600",
];

const CustomTooltip = ({
  active,
  payload,
  label,
  names,
}: ComponentProps<typeof RechartsPrimitive.Tooltip> & {
  names: Array<string>;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="flex flex-col gap-2 rounded border bg-background p-2">
        <div className="font-medium">{label}</div>
        <div className="flex flex-col-reverse">
          {payload.map(({ name, value }) => {
            if (typeof value !== "number" || typeof name !== "string") {
              return;
            }
            return (
              <div key={name} className="flex w-full justify-between gap-3">
                <div className="flex items-center gap-1">
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-(--color-bg)"
                    style={
                      {
                        "--color-bg":
                          colors[
                            names.findIndex((n) => n === name) % colors.length
                          ],
                      } as CSSProperties
                    }
                  />
                  {name}
                </div>
                {formatDuration(value)}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};

type YearlyProjectHoursChartProps = {
  reports: Reports;
};

export function YearlyProjectHoursChart({
  reports,
}: YearlyProjectHoursChartProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { chartData, yearNumberStr, projectNames } = useMemo(() => {
    const monthlyDurations = calculateMonthlyDurations(
      calculateDailyDurations(reports),
    );

    const projectNames = new Set<string>([]);

    const yearNumberStr = selectedYear.toString();
    const chartData = Array.from({ length: 12 }, (_, index) => {
      const monthNumberStr = String(index + 1).padStart(2, "0");
      const yearMonth = `${yearNumberStr}${monthNumberStr}`;
      const monthData = monthlyDurations[yearMonth];

      if (monthData) {
        for (const projectName of Object.keys(monthData.byProject)) {
          projectNames.add(projectName);
        }
      }

      return {
        yearMonth: yearMonth,
        shortMonthName: convertMonthStrToShortName(yearMonth),
        ...monthData?.byProject,
      };
    });

    return {
      chartData,
      yearNumberStr,
      projectNames: Array.from(projectNames),
    };
  }, [reports, selectedYear]);

  return (
    <div className="col-span-6 flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="font-semibold leading-none tracking-tight">
            Yearly project hours
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

      <ChartContainer config={{}} className="min-h-[160px] w-full">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="shortMonthName"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <ChartTooltip content={<CustomTooltip names={projectNames} />} />

          {projectNames.map((projectName, i) => (
            <Bar
              key={projectName}
              dataKey={projectName}
              stackId="a"
              fill={colors[i % colors.length]}
            />
          ))}
        </BarChart>
      </ChartContainer>
    </div>
  );
}
