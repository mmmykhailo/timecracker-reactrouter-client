export const TIMEREPORT_FILENAME_PREFIX = "timereport - ";

export type ReportEntry = {
  start: string;
  end: string;
  duration: number; // duration in minutes
  project: string | null;
  activity: string | null;
  description: string | null;
};

export type Reports = Record<string, Array<ReportEntry>>;

export type DailyDurations = Record<string, number>;

function parseTimeIntoMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function calculateDuration(start: string, end: string): number {
  const startMinutes = parseTimeIntoMinutes(start);
  const endMinutes = parseTimeIntoMinutes(end);
  return endMinutes - startMinutes;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

export const calculateDailyDurations = (reports: Reports): DailyDurations => {
  return Object.entries(reports).reduce((acc, [date, dayEntries]) => {
    // Sum up all durations for the day
    const duration = dayEntries.reduce((sum, entry) => sum + entry.duration, 0);

    return {
      ...acc,
      [date]: duration,
    };
  }, {});
};

export function parseReport(input: string): ReportEntry[] {
  const lines = input.split("\n").filter((line) => line.trim());
  const entries: ReportEntry[] = [];

  for (let i = 0; i < lines.length - 1; i++) {
    const currentLine = lines[i];
    const nextLine = lines[i + 1];

    // Extract start time from current line
    const startTime = currentLine.split(" - ")[0].trim();
    // Extract end time from next line
    const endTime = nextLine.split(" - ")[0].trim();

    const duration = calculateDuration(startTime, endTime);

    // Split the current line by ' - '
    const parts = currentLine.split(" - ");

    // Initialize entry with default values
    const entry: ReportEntry = {
      start: startTime,
      end: endTime,
      duration: duration,
      project: null,
      activity: null,
      description: null,
    };

    if (parts.length >= 2) {
      entry.project = parts[1] || null;

      if (parts.length >= 3) {
        // Check if the third part is an activity or description
        if (parts.length >= 4) {
          entry.activity = parts[2].trim();
          // Join the rest of the parts as description
          entry.description = parts.slice(3).join(" - ").trim();
        } else {
          entry.description = parts[2].trim();
        }
      }
    }

    entries.push(entry);
  }

  return entries;
}

export async function readReports(rootHandle: FileSystemDirectoryHandle) {
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

  return rawReports.reduce((prev, curr) => {
    prev[curr.name] = parseReport(curr.content);

    return prev;
  }, {} as Record<string, Array<ReportEntry>>);
}

export function serializeReport(entries: ReportEntry[]): string {
  let output = "";

  for (const entryIndex of entries.keys()) {
    const entry = entries[entryIndex];
    const nextEntryIndex = entryIndex + 1;
    const nextEntry =
      nextEntryIndex < entries.length ? entries[nextEntryIndex] : null;

    let line = entry.start;

    if (entry.project) {
      line += ` - ${entry.project}`;

      if (entry.activity && entry.description) {
        line += ` - ${entry.activity} - ${entry.description}`;
      } else if (entry.description) {
        line += ` - ${entry.description}`;
      }
    }

    output += line + "\n";

    if (!nextEntry || entry.end !== nextEntry.start) {
      output += `${entry.end} - \n`;
    }
  }

  return output;
}
