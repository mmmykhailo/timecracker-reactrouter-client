import { cn } from "~/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Fragment, useMemo, useState } from "react";
import type {
  DailyDurations,
  GroupedDuration,
  MonthlyDurations,
  QuarterlyDurations,
  WeeklyDurations,
  YearlyDurations,
} from "~/lib/reports";
import { DatePicker } from "../ui/date-picker";
import { format, getISOWeek, getYear } from "date-fns";
import { getWeekStartDateString } from "~/lib/date-strings";
import { formatDuration } from "~/lib/time-strings";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

type DetailedTotalsProps = {
  dailyDurations: DailyDurations;
  weeklyDurations: WeeklyDurations;
  monthlyDurations: MonthlyDurations;
  quarterlyDurations: QuarterlyDurations;
  yearlyDurations: YearlyDurations;
  className?: string;
};

type PeriodType = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
type GroupType = "project" | "activity" | "description";

export function DetailedTotals({
  dailyDurations,
  weeklyDurations,
  monthlyDurations,
  quarterlyDurations,
  yearlyDurations,
  className,
}: DetailedTotalsProps) {
  const [selectedPeriodType, setSelectedPeriodType] =
    useState<PeriodType>("monthly");
  const [selectedGroupType, setSelectedGroupType] =
    useState<GroupType>("project");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const datePickerLabel = useMemo(() => {
    if (selectedPeriodType === "weekly") {
      return `W${getISOWeek(selectedDate)} ${getYear(selectedDate)}`;
    }
    if (selectedPeriodType === "monthly") {
      return format(selectedDate, "MMM yyyy");
    }
    if (selectedPeriodType === "quarterly") {
      return format(selectedDate, "yyyy 'Q'Q");
    }
    if (selectedPeriodType === "yearly") {
      return format(selectedDate, "yyyy");
    }
    return format(selectedDate, "PP");
  }, [selectedPeriodType, selectedDate]);

  console.log({ yearlyDurations });
  const data = useMemo(() => {
    switch (selectedPeriodType) {
      case "daily": {
        const dailyDuration = dailyDurations[format(selectedDate, "yyyyMMdd")];

        if (selectedGroupType === "project") {
          return dailyDuration?.byProject || {};
        }
        if (selectedGroupType === "activity") {
          return dailyDuration?.byProjectActivity || {};
        }
        return dailyDuration?.byProjectDescription || {};
      }
      case "weekly": {
        const weeklyDuration =
          weeklyDurations[getWeekStartDateString(selectedDate)];

        if (selectedGroupType === "project") {
          return weeklyDuration?.byProject || {};
        }
        if (selectedGroupType === "activity") {
          return weeklyDuration?.byProjectActivity || {};
        }
        return weeklyDuration?.byProjectDescription || {};
      }
      case "monthly": {
        const monthlyDuration =
          monthlyDurations[format(selectedDate, "yyyyMM")];

        if (selectedGroupType === "project") {
          return monthlyDuration?.byProject || {};
        }
        if (selectedGroupType === "activity") {
          return monthlyDuration?.byProjectActivity || {};
        }
        return monthlyDuration?.byProjectDescription || {};
      }
      case "quarterly": {
        const quarterlyDuration =
          quarterlyDurations[format(selectedDate, "yyyyQ")];

        if (selectedGroupType === "project") {
          return quarterlyDuration?.byProject || {};
        }
        if (selectedGroupType === "activity") {
          return quarterlyDuration?.byProjectActivity || {};
        }
        return quarterlyDuration?.byProjectDescription || {};
      }
      case "yearly": {
        const yearlyDuration = yearlyDurations[format(selectedDate, "yyyy")];

        if (selectedGroupType === "project") {
          return yearlyDuration?.byProject || {};
        }
        if (selectedGroupType === "activity") {
          return yearlyDuration?.byProjectActivity || {};
        }
        return yearlyDuration?.byProjectDescription || {};
      }
    }
  }, [
    selectedPeriodType,
    selectedGroupType,
    selectedDate,
    dailyDurations,
    weeklyDurations,
    monthlyDurations,
    quarterlyDurations,
    yearlyDurations,
  ]);

  const dataEntries = useMemo(() => {
    return Object.entries<GroupedDuration>(data).sort(
      (a, b) =>
        a[1].project.localeCompare(b[1].project) ||
        b[1].duration - a[1].duration,
    );
  }, [data]);

  return (
    <div className={cn("flex flex-col gap-4 rounded-xl border p-4", className)}>
      <div className="flex flex-col gap-1.5">
        <div className="font-semibold leading-none tracking-tight">
          Detailed totals
        </div>
        <div className="text-muted-foreground text-sm">
          Data for {datePickerLabel} grouped by {selectedGroupType}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col gap-2">
          <Label>Period</Label>
          <Select
            value={selectedPeriodType}
            onValueChange={(value) =>
              setSelectedPeriodType(value as PeriodType)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Group by</Label>
          <Select
            value={selectedGroupType}
            onValueChange={(value) => setSelectedGroupType(value as GroupType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="project">Project</SelectItem>
              <SelectItem value="activity">Activity</SelectItem>
              <SelectItem value="description">Description</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          {selectedPeriodType === "daily" && <Label>Date</Label>}
          {selectedPeriodType === "weekly" && <Label>Week</Label>}
          {selectedPeriodType === "monthly" && <Label>Month</Label>}
          {selectedPeriodType === "quarterly" && <Label>Quarter</Label>}
          {selectedPeriodType === "yearly" && <Label>Year</Label>}
          <DatePicker
            selectedLabel={datePickerLabel}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        </div>
      </div>

      {dataEntries.length ? (
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                {selectedGroupType === "activity" && (
                  <TableHead>Activity</TableHead>
                )}
                {selectedGroupType === "description" && (
                  <TableHead>Description</TableHead>
                )}
                <TableHead className="text-right">Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataEntries.map(([key, value]) => (
                <Fragment key={key}>
                  {value.type === "byProject" && (
                    <TableRow>
                      <TableCell className="font-medium">
                        {value.project}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatDuration(value.duration)}
                      </TableCell>
                    </TableRow>
                  )}
                  {value.type === "byProjectActivity" && (
                    <TableRow>
                      <TableCell className="font-medium">
                        {value.project}
                      </TableCell>
                      <TableCell>{value.activity}</TableCell>
                      <TableCell className="text-right">
                        {formatDuration(value.duration)}
                      </TableCell>
                    </TableRow>
                  )}
                  {value.type === "byProjectDescription" && (
                    <TableRow>
                      <TableCell className="font-medium">
                        {value.project}
                      </TableCell>
                      <TableCell>{value.description}</TableCell>
                      <TableCell className="text-right">
                        {formatDuration(value.duration)}
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-muted-foreground text-sm">No entries found</div>
      )}
    </div>
  );
}
