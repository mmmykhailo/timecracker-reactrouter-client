import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { get as idbGet, set as idbSet } from "idb-keyval";
import { Button } from "~/components/ui/button";
import { AppHeader } from "~/components/app-header";
import HoursCalendar from "~/components/hours-calendar";
import {
  calculateDailyDurations,
  DATE_FORMAT,
  readReport,
  readReports,
  writeReport,
  type ReportEntry,
  type Reports,
} from "~/lib/reports";
import TimeEntryForm from "~/components/entry-edit-form";
import ReportEntryCard from "~/components/report-entry-card";
import DateControls from "~/components/date-controls";
import {
  useActionData,
  useLoaderData,
  type ClientActionFunctionArgs,
} from "react-router";

export function meta() {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function clientLoader() {
  const rootHandle: FileSystemDirectoryHandle | undefined =
    await idbGet("rootHandle");

  return {
    reports: rootHandle ? await readReports(rootHandle) : null,
  };
}

export async function clientAction({ request }: ClientActionFunctionArgs) {
  const body = await request.formData();
  const entry: ReportEntry = {
    start: body.get("start")?.toString() || "",
    end: body.get("end")?.toString() || "",
    duration: 0,
    project: body.get("project")?.toString() || null,
    activity: body.get("activity")?.toString() || null,
    description: body.get("description")?.toString() || null,
  };

  // todo: add validation for entry

  const dateString = body.get("date")?.toString();
  const entryIndexString = body.get("entryIndex")?.toString();

  const entryIndex = entryIndexString
    ? Number.parseInt(entryIndexString, 10)
    : null;

  const rootHandle: FileSystemDirectoryHandle | undefined =
    await idbGet("rootHandle");
  if (
    !rootHandle ||
    !dateString ||
    entryIndex === null ||
    Number.isNaN(entryIndex)
  ) {
    console.error(rootHandle, dateString, entryIndexString, entryIndex);
    return;
  }

  const report = await readReport(rootHandle, dateString);
  if (!report) {
    throw "Handle this";
  }

  report[entryIndex] = entry;

  await writeReport(rootHandle, dateString, report);

  const updatedReport = await readReport(rootHandle, dateString);

  if (!updatedReport) {
    return null;
  }

  return {
    updatedReports: {
      [dateString]: updatedReport,
    },
  };
}

export default function Home() {
  const { reports: loaderReports } = useLoaderData<typeof clientLoader>();
  const actionData = useActionData<typeof clientAction>();

  useEffect(() => {
    if (actionData?.updatedReports) {
      setReports((oldReports) => ({
        ...oldReports,
        ...actionData.updatedReports,
      }));
    }
  }, [actionData?.updatedReports]);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [reports, setReports] = useState<Reports>(loaderReports || {});
  const [entryIndexToEdit, setEntryIndexToEdit] = useState<number | null>(null);

  const handleOpenFolder = async () => {
    const rootHandle: FileSystemDirectoryHandle =
      (await idbGet("rootHandle")) || (await window.showDirectoryPicker());

    await idbSet("rootHandle", rootHandle);

    setReports(await readReports(rootHandle));
  };

  const selectedReport = useMemo(() => {
    if (!selectedDate) {
      return null;
    }
    return reports[format(selectedDate, DATE_FORMAT)] || null;
  }, [selectedDate, reports]);

  return (
    <>
      <AppHeader />
      <div className="flex flex-col lg:grid lg:grid-cols-12 flex-1 gap-4 p-4 mt-8">
        <div className="flex flex-col gap-4 col-span-8">
          <div className="flex justify-between flex-wrap gap-2">
            <Button variant="outline" onClick={handleOpenFolder}>
              Open folder
            </Button>
            <DateControls
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          </div>
          <div className="grid auto-rows-min gap-4">
            <div className="rounded-xl border">
              <HoursCalendar
                // isCompact
                dailyDurations={calculateDailyDurations(reports)}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            </div>
          </div>
        </div>
        <div className="col-span-4 flex flex-col gap-4">
          {selectedReport?.length ? (
            selectedReport.map((reportEntry, i) => (
              <ReportEntryCard
                key={`${reportEntry.start}-${reportEntry.end}-${i}`}
                entry={reportEntry}
                onEditClick={() => {
                  setEntryIndexToEdit(i);
                }}
              />
            ))
          ) : (
            <div className="rounded-lg border p-3 text-muted-foreground">
              No entries yet
            </div>
          )}
          <Button
            onClick={() => setEntryIndexToEdit(selectedReport?.length || 0)}
          >
            Add new entry
          </Button>
        </div>
      </div>
      <TimeEntryForm
        report={selectedReport}
        entryIndex={entryIndexToEdit}
        selectedDate={selectedDate}
        onClose={() => setEntryIndexToEdit(null)}
      />
    </>
  );
}
