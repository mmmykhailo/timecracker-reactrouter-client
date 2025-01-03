import { addDays, format, isSameDay } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { get as idbGet, set as idbSet } from "idb-keyval";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/_index";
import { AppHeader } from "~/components/app-header";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { Calendar } from "~/components/ui/calendar";
import HoursCalendar from "~/components/hours-calendar";
import {
  calculateDailyDurations,
  formatDuration,
  readReports,
  type Reports,
} from "~/lib/reports";
import TimeEntryForm from "~/components/entry-edit-form";
import { Dialog, DialogContent } from "~/components/ui/dialog";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function clientLoader() {
  return null;
}

export default function Home() {
  // const data = useLoaderData<typeof clientLoader>();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  const [reports, setReports] = useState<Reports>({});

  const handleOpenFolder = async () => {
    if (!("showDirectoryPicker" in window)) {
      return null;
    }

    const rootHandle: FileSystemDirectoryHandle =
      (await idbGet("rootHandle")) || (await window.showDirectoryPicker());

    await idbSet("rootHandle", rootHandle);

    setReports(await readReports(rootHandle));
  };

  useEffect(() => {
    const initiateReadReports = async () => {
      const rootHandle: FileSystemDirectoryHandle | undefined = await idbGet(
        "rootHandle"
      );
      if (rootHandle) {
        setReports(await readReports(rootHandle));
      }
    };

    initiateReadReports();
  }, []);

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

            <div className="flex justify-end gap-2">
              {!!selectedDate && !isSameDay(selectedDate, new Date()) && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedDate(new Date())}
                >
                  Go to today
                </Button>
              )}
              <Button
                disabled={!selectedDate}
                variant="outline"
                size="icon"
                onClick={() =>
                  setSelectedDate((old) => old && addDays(old, -1))
                }
              >
                <ChevronLeft />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] pl-3 text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    {selectedDate ? (
                      format(selectedDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="single"
                    defaultMonth={selectedDate || new Date()}
                    selected={selectedDate}
                    onSelect={(date) => setSelectedDate(date)}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                  />
                </PopoverContent>
              </Popover>
              <Button
                disabled={!selectedDate}
                variant="outline"
                size="icon"
                onClick={() => setSelectedDate((old) => old && addDays(old, 1))}
              >
                <ChevronRight />
              </Button>
            </div>
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
              <div className="flex justify-between gap-2 rounded-lg border p-3 text-left text-sm">
                <div>
                  <div className="font-semibold">{reportEntry.project}</div>
                  <div className="font-semibold text-sm">
                    {reportEntry.activity}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {reportEntry.description}
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between gap-1 flex-shrink-0">
                  <div className="text-muted-foreground text-sm">
                    {reportEntry.start} - {reportEntry.end}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {formatDuration(reportEntry.duration)}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Button variant="outline" size="icon">
                      <Edit size={12} />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Trash size={12} />
                    </Button>
                  </div>
                </div>
              </div>
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
