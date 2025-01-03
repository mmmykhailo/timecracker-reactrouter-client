import { Button } from "~/components/ui/button";
import type { Route } from "./+types/_index";
import { AppHeader } from "~/components/app-header";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Delete,
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
import { addDays, format, isSameDay } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import HoursCalendar from "~/components/hours-calendar";
import {
  calculateDailyDurations,
  parseTimeTrackerReport,
  TIMEREPORT_FILENAME_PREFIX,
  type Reports,
  type TimeEntry,
} from "~/lib/reports";

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

  useEffect(() => {
    // Example usage:
    const sampleInput = `14:00 - project - PR review
  14:30 - project - FE sync
15:00 - project - activity - task description (rest of the line)
18:00 - `;

    const result = parseTimeTrackerReport(sampleInput);
    console.log(result);
  }, []);

  const handleOpenFolder = async () => {
    if (!("showDirectoryPicker" in window)) {
      return null;
    }

    const rootHandle = await window.showDirectoryPicker();
    const rawReports: Array<{
      name: string;
      content: string;
    }> = [];

    const readDirectory = async (dirHandle: FileSystemDirectoryHandle) => {
      for await (const entry of dirHandle.values()) {
        if (entry.kind === "file") {
          if (!entry.name.startsWith(TIMEREPORT_FILENAME_PREFIX)) {
            continue;
          }
          // Read the file and add its content to the reports array
          const file = await entry.getFile();
          const content = await file.text();
          rawReports.push({
            name: entry.name.replace(TIMEREPORT_FILENAME_PREFIX, ""),
            content,
          });
        } else if (entry.kind === "directory") {
          // Recursively read subdirectories
          await readDirectory(entry);
        }
      }
    };

    await readDirectory(rootHandle);

    console.log("Reports:", rawReports);

    setReports(
      rawReports.reduce((prev, curr) => {
        prev[curr.name] = parseTimeTrackerReport(curr.content);

        return prev;
      }, {} as Record<string, Array<TimeEntry>>)
    );
  };

  useEffect(() => {
    console.log(reports);
  }, [reports]);

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
          {selectedReport?.map((reportEntry) => (
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
                  {reportEntry.duration} mins
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
          ))}
        </div>
      </div>
    </>
  );
}
