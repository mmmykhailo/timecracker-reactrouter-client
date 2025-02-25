import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  isSameMonth,
} from "date-fns";
import { useHotkeys } from "react-hotkeys-hook";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { get as idbGet, del as idbDel } from "idb-keyval";
import { Button } from "~/components/ui/button";
import { AppHeader } from "~/components/app-header";
import HoursCalendar from "~/components/hours-calendar";
import {
  calculateDailyDurations,
  DATE_FORMAT,
  getProjectsBetweenDates,
  readReport,
  readReports,
  writeReport,
  type Report,
  type ReportEntry,
  type Reports,
} from "~/lib/reports";
import EntryForm from "~/components/entry-form";
import ReportEntryCard from "~/components/report-entry-card";
import DateControls from "~/components/date-controls";
import {
  redirect,
  useActionData,
  useLoaderData,
  useFetcher,
  type ClientActionFunctionArgs,
} from "react-router";
import { flatten, getDotPath, safeParse } from "valibot";
import { EntryFormSchema } from "~/lib/schema";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { calculateDuration, formatDuration } from "~/lib/time-strings";
import { cn } from "~/lib/utils";
import { RefreshPageButton } from "~/components/refresh-page-button";

export function meta() {
  return [
    { title: "Timecracker" },
    { name: "description", content: "Stupidly simple timetracker" },
  ];
}

export async function clientLoader() {
  try {
    const rootHandle: FileSystemDirectoryHandle | undefined =
      await idbGet("rootHandle");

    if (!rootHandle) {
      return redirect("/welcome");
    }

    const currentDate = new Date();
    const currentMonth = format(currentDate, "yyyy-MM");

    const reports = await readReports(
      rootHandle,
      addMonths(startOfMonth(currentDate), -1),
      endOfMonth(currentDate),
    );

    const recentProjects = getProjectsBetweenDates(
      reports,
      addMonths(currentDate, -1),
      currentDate,
    );

    return {
      reports,
      currentMonth,
      recentProjects,
    };
  } catch (e) {
    console.error(e);
    await idbDel("rootHandle");
    return redirect("/welcome");
  }
}

export async function clientAction({ request }: ClientActionFunctionArgs) {
  const body = await request.formData();
  const intent = body.get("intent")?.toString();

  const rootHandle: FileSystemDirectoryHandle | undefined =
    await idbGet("rootHandle");

  if (!rootHandle) {
    return redirect("/welcome");
  }

  switch (intent) {
    case "load-month": {
      const monthDate = new Date(body.get("month")?.toString() || "");
      const start = body.get("loadPrevious")?.toString()
        ? addMonths(startOfMonth(monthDate), -1)
        : startOfMonth(monthDate);
      const end = endOfMonth(monthDate);

      const monthReports = await readReports(rootHandle, start, end);

      return {
        type: "month-data",
        reports: monthReports,
      };
    }
    case "edit-entry": {
      const entryFormData = {
        time: {
          start: body.get("start")?.toString(),
          end: body.get("end")?.toString(),
        },
        project: body.get("project")?.toString(),
        activity: body.get("activity")?.toString(),
        description: body.get("description")?.toString(),
        date: body.get("date")?.toString(),
        entryIndex: body.get("entryIndex")?.toString(),
      };

      const parsedEntryFormData = safeParse(EntryFormSchema, entryFormData);

      if (!parsedEntryFormData.success) {
        return {
          type: "entry-form-error",
          entryFormErrors: flatten(parsedEntryFormData.issues),
        };
      }

      const dateString = parsedEntryFormData.output.date;
      const entryIndex = parsedEntryFormData.output.entryIndex;

      const entry: ReportEntry = {
        time: {
          start: parsedEntryFormData.output.time.start,
          end: parsedEntryFormData.output.time.end,
        },
        duration: 0,
        project: parsedEntryFormData.output.project,
        activity: parsedEntryFormData.output.activity || null,
        description: parsedEntryFormData.output.description,
      };

      if (entryIndex === null || Number.isNaN(entryIndex)) {
        console.error("Invalid entry index:", entryIndex);
        return;
      }

      const report = await readReport(rootHandle, dateString);
      const entries = report?.entries || [];
      entries[entryIndex] = entry;

      await writeReport(rootHandle, dateString, entries);
      const updatedReport = await readReport(rootHandle, dateString);

      if (!updatedReport) {
        return null;
      }

      return {
        type: "update-report",
        updatedReports: {
          [dateString]: updatedReport,
        },
      };
    }
    case "delete-entry": {
      const dateString = body.get("date")?.toString();
      const entryIndexString = body.get("entryIndex")?.toString();
      const entryIndex = entryIndexString
        ? Number.parseInt(entryIndexString, 10)
        : null;

      if (!dateString || entryIndex === null || Number.isNaN(entryIndex)) {
        console.error("Invalid delete parameters:", { dateString, entryIndex });
        return;
      }

      const report = await readReport(rootHandle, dateString);
      if (!report?.entries) {
        console.error("Could not parse report");
        return;
      }

      const entries = report.entries;
      entries.splice(entryIndex, 1);

      await writeReport(rootHandle, dateString, entries);
      const updatedReport = await readReport(rootHandle, dateString);

      return {
        type: "update-report",
        updatedReports: {
          [dateString]: updatedReport || { entries: [] },
        },
      };
    }
    case "close-directory": {
      await idbDel("rootHandle");
      return redirect("/welcome");
    }
  }
}

export default function Home() {
  const {
    reports: initialReports,
    currentMonth,
    recentProjects,
  } = useLoaderData<typeof clientLoader>();
  const actionData = useActionData<typeof clientAction>();
  const fetcher = useFetcher();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMonthDate, setSelectedMonthDate] = useState<Date>(new Date());
  const [reports, setReports] = useState<Reports>(initialReports || {});
  const [loadedMonths, setLoadedMonths] = useState<Set<string>>(
    new Set([currentMonth]),
  );
  const [entryIndexToEdit, setEntryIndexToEdit] = useState<number | null>(null);

  useEffect(() => {
    if (fetcher.data?.reports) {
      setReports((oldReports) => ({
        ...oldReports,
        ...fetcher.data.reports,
      }));
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (actionData?.updatedReports) {
      setReports((oldReports) => ({
        ...oldReports,
        ...actionData.updatedReports,
      }));
    }
  }, [actionData?.updatedReports]);

  // Load month data if not already loaded
  useEffect(() => {
    const selectedMonth = format(selectedMonthDate, "yyyy-MM");
    if (!loadedMonths.has(selectedMonth) && fetcher.state === "idle") {
      const formData = new FormData();
      formData.append("intent", "load-month");
      formData.append("month", selectedMonth);
      formData.append("loadPrevious", JSON.stringify(true));
      fetcher.submit(formData, { method: "post" });
      setLoadedMonths((prev) => new Set([...prev, selectedMonth]));
    }
  }, [selectedMonthDate, loadedMonths, fetcher]);

  const selectedReport: Report = useMemo(() => {
    return reports[format(selectedDate, DATE_FORMAT)] || { entries: [] };
  }, [selectedDate, reports]);

  const handleSelectedDate = (date: Date) => {
    setSelectedDate(date);
    if (!isSameMonth(date, selectedMonthDate)) {
      setSelectedMonthDate(date);
    }
  };

  const handleAddNewEntryClick = () => {
    setEntryIndexToEdit(selectedReport.entries?.length || 0);
  };

  const handleEntryFormClose = useCallback(() => setEntryIndexToEdit(null), []);

  const handleUpdateReports = useCallback(
    (updatedReports: Reports) =>
      setReports((oldReports) => ({
        ...oldReports,
        ...updatedReports,
      })),
    [],
  );

  useHotkeys("shift+space", handleAddNewEntryClick);

  return (
    <div className="min-w-[640px]">
      <AppHeader />
      <div className="mt-8 flex flex-1 flex-col gap-4 p-4 lg:grid lg:grid-cols-12">
        <div className="col-span-8 flex flex-col gap-4">
          <div className="flex flex-wrap justify-between gap-2">
            <RefreshPageButton />
            <DateControls
              selectedDate={selectedDate}
              setSelectedDate={handleSelectedDate}
            />
          </div>
          <div className="grid auto-rows-min gap-4">
            <div className="rounded-xl border">
              <HoursCalendar
                dailyDurations={calculateDailyDurations(reports)}
                selectedDate={selectedDate}
                setSelectedDate={handleSelectedDate}
                selectedMonth={selectedMonthDate}
                setSelectedMonth={setSelectedMonthDate}
              />
            </div>
          </div>
        </div>
        {!selectedReport.issues && (
          <div className="col-span-4 flex flex-col gap-4">
            <div>
              {selectedReport.entries?.length ? (
                selectedReport.entries.map((reportEntry, i) => {
                  const prevReportEntry =
                    (i > 0 && selectedReport.entries?.[i - 1]) || null;

                  const breakDuration =
                    (prevReportEntry &&
                      calculateDuration(
                        prevReportEntry.time.end,
                        reportEntry.time.start,
                      )) ||
                    0;

                  return (
                    <Fragment
                      key={`${reportEntry.time.start}-${reportEntry.time.end}-${i}`}
                    >
                      {breakDuration ? (
                        <div className="my-1 flex items-center gap-4">
                          <Separator
                            className={cn("flex-1", {
                              "bg-destructive": breakDuration < 0,
                            })}
                          />
                          <span
                            className={cn({
                              "text-muted-foreground": breakDuration > 0,
                              "text-destructive": breakDuration < 0,
                            })}
                          >
                            {formatDuration(breakDuration)} break
                          </span>
                          <Separator
                            className={cn("flex-1", {
                              "bg-destructive": breakDuration < 0,
                            })}
                          />
                        </div>
                      ) : (
                        <div />
                      )}
                      <ReportEntryCard
                        isInvalid={selectedReport.hasNegativeDuration}
                        entryIndex={i}
                        entry={reportEntry}
                        selectedDate={selectedDate}
                        className={cn("rounded-none last:rounded-b-lg", {
                          "rounded-t-none border-t-0":
                            !breakDuration && i !== 0,
                          "rounded-t-lg": i === 0,
                        })}
                        onEditClick={() => {
                          setEntryIndexToEdit(i);
                        }}
                      />
                    </Fragment>
                  );
                })
              ) : (
                <div className="rounded-lg border p-3 text-muted-foreground">
                  No entries yet
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Button
                disabled={selectedReport.hasNegativeDuration}
                onClick={handleAddNewEntryClick}
              >
                Add new entry
              </Button>
              <div className="text-center text-muted-foreground text-sm">
                or press Shift + Space
              </div>
            </div>
          </div>
        )}
        {!!selectedReport.issues && (
          <div className="col-span-4 flex flex-col gap-4">
            {selectedReport.issues?.map((issue) => (
              <div
                key={getDotPath(issue)}
                className="rounded-lg border p-3 text-muted-foreground"
              >
                <p>{issue.message}</p>
                {typeof issue.input === "string" && (
                  <p>
                    <Badge
                      variant="destructive"
                      className="line-clamp-1 inline-flex max-w-full break-words"
                    >
                      {issue.input}
                    </Badge>
                  </p>
                )}
                <p className="mt-2 text-foreground">
                  Please fix your file manually.
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      <EntryForm
        report={selectedReport}
        entryIndex={entryIndexToEdit}
        selectedDate={selectedDate}
        recentProjects={recentProjects}
        onClose={handleEntryFormClose}
        onUpdateReports={handleUpdateReports}
      />
    </div>
  );
}
