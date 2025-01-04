import { format } from "date-fns";
import { useMemo, useState } from "react";
import { get as idbGet, set as idbSet } from "idb-keyval";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/_index";
import { AppHeader } from "~/components/app-header";
import HoursCalendar from "~/components/hours-calendar";
import {
  calculateDailyDurations,
  readReports,
  type Reports,
} from "~/lib/reports";
import TimeEntryForm from "~/components/entry-edit-form";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import ReportEntryCard from "~/components/report-entry-card";
import DateControls from "~/components/date-controls";
import { useLoaderData } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function clientLoader() {
  const rootHandle: FileSystemDirectoryHandle | undefined = await idbGet(
    "rootHandle"
  );

  return {
    reports: rootHandle ? await readReports(rootHandle) : null,
  };
}

export default function Home() {
  const { reports: loaderReports } = useLoaderData<typeof clientLoader>();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [reports, setReports] = useState<Reports>(loaderReports || {});

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
    return reports[format(selectedDate, "yyyyMMdd")] || null;
  }, [selectedDate, reports]);

  return (
    <>
      <AppHeader />
      <div className="grid grid-cols-12 flex-1 gap-4 p-4 mt-8">
        <div className="flex flex-col gap-4 col-span-8">
          <div className="flex justify-between gap-2">
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
            selectedReport.map((reportEntry) => (
              <ReportEntryCard {...reportEntry} />
            ))
          ) : (
            <div className="rounded-lg border p-3 text-muted-foreground">
              No entries yet
            </div>
          )}
        </div>
      </div>
      <Dialog>
        <DialogContent>
          <TimeEntryForm
            reports={reports}
            onSave={(d, i, e) => console.log(d, i, e)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
