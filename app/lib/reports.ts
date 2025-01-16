import { areIntervalsOverlapping, endOfWeek, getISOWeek, isWithinInterval, parse, parseISO, startOfWeek } from "date-fns";
import { safeParse, type RegexIssue, type StringIssue } from "valibot";
import { TimeSchema, type TimeIssue } from "./schema";
import { calculateDuration, parseTimeIntoMinutes } from "./time-strings";
import { getWeekEndDateString, getWeekStartDateString } from "./date-strings";

export const TIMEREPORT_FILENAME_PREFIX = "timereport - ";
export const WEEK_DIR_NAME_REGEX = /^week (\d{2})$/i;
export const YEAR_DIR_NAME_REGEX = /^\d{4}$/i;
export const DATE_FORMAT = "yyyyMMdd";

export type RawReport = {
  name: string;
  content: string;
};

export type ReportEntry = {
  start: string;
  end: string;
  duration: number; // duration in minutes
  project: string | null;
  activity: string | null;
  description: string | null;
};

export type Report = {
  entries?: Array<ReportEntry>;
  issues?: Array<TimeIssue>;
  hasNegativeDuration?: boolean;
};

export type Reports = Record<string, Report>;

export type DailyDurationsItem = {
  duration: number;
  byProject: Record<string, number>;
  hasNegativeDuration?: boolean;
};
export type WeeklyDurationsItem = {
  duration: number;
  byProject: Record<string, number>;
  hasNegativeDuration?: boolean;
};
export type MonthlyDurationsItem = {
  duration: number;
  byProject: Record<string, number>;
  hasNegativeDuration?: boolean;
  yearMonth: string; // yyyyMM format
};

export type DailyDurations = Record<string, DailyDurationsItem>; // key is yyyyMMdd
export type WeeklyDurations = Record<string, WeeklyDurationsItem>; // key is yyyyMMdd of week start
export type MonthlyDurations = Record<string, MonthlyDurationsItem>; // key is yyyyMM

export const calculateDailyDurations = (reports: Reports): DailyDurations => {
  return Object.entries(reports).reduce((acc, [date, dayReport]) => {
    let duration = 0;
    const byProject: DailyDurationsItem["byProject"] = {};
    for (const entry of dayReport.entries || []) {
      if (!entry.duration || entry.duration < 0) {
        continue;
      }

      duration += entry.duration;

      if (!entry.project) {
        continue;
      }

      if (!byProject[entry.project]) {
        byProject[entry.project] = entry.duration;
        continue;
      }

      byProject[entry.project] = byProject[entry.project] + entry.duration;
    }

    acc[date] = {
      duration,
      byProject,
      hasNegativeDuration: dayReport.hasNegativeDuration,
    };

    return acc;
  }, {} as DailyDurations);
};

export const calculateWeeklyDurations = (
  dailyDurations: DailyDurations,
): WeeklyDurations => {
  return Object.entries(dailyDurations).reduce((acc, [date, dayData]) => {
    const weekStartDate = getWeekStartDateString(date);

    if (!acc[weekStartDate]) {
      acc[weekStartDate] = {
        duration: 0,
        byProject: {},
        hasNegativeDuration: false,
      };
    }

    acc[weekStartDate].duration += dayData.duration;

    for (const [project, duration] of Object.entries(dayData.byProject)) {
      acc[weekStartDate].byProject[project] =
        (acc[weekStartDate].byProject[project] || 0) + duration;
    }

    if (dayData.hasNegativeDuration) {
      acc[weekStartDate].hasNegativeDuration = true;
    }

    return acc;
  }, {} as WeeklyDurations);
};

export const calculateMonthlyDurations = (
  dailyDurations: DailyDurations,
): MonthlyDurations => {
  return Object.entries(dailyDurations).reduce((acc, [date, dayData]) => {
    const yearMonth = date.slice(0, 6);

    if (!acc[yearMonth]) {
      acc[yearMonth] = {
        duration: 0,
        byProject: {},
        hasNegativeDuration: false,
        yearMonth,
      };
    }

    acc[yearMonth].duration += dayData.duration;

    for (const [project, duration] of Object.entries(dayData.byProject)) {
      acc[yearMonth].byProject[project] =
        (acc[yearMonth].byProject[project] || 0) + duration;
    }

    if (dayData.hasNegativeDuration) {
      acc[yearMonth].hasNegativeDuration = true;
    }

    return acc;
  }, {} as MonthlyDurations);
};

export function parseReport(input: string): {
  issues?: Array<StringIssue | RegexIssue<string>>;
  entries?: ReportEntry[];
  hasNegativeDuration?: boolean;
} {
  const lines = input.split("\n").filter((line) => line.trim());
  const entries: ReportEntry[] = [];
  let hasNegativeDuration = false;

  for (let i = 0; i < lines.length - 1; i++) {
    const currentLine = lines[i];
    const nextLine = lines[i + 1];

    // Extract start time from current line
    const startTime = currentLine.split(" - ")[0].trim();
    // Extract end time from next line
    const endTime = nextLine.split(" - ")[0].trim();

    const parsedStartTime = safeParse(TimeSchema, startTime);
    const parsedEndTime = safeParse(TimeSchema, endTime);
    if (!parsedStartTime.success || !parsedEndTime.success) {
      return {
        issues: parsedStartTime.issues || parsedEndTime.issues || [],
      };
    }

    const duration = calculateDuration(startTime, endTime);

    if (duration < 0) {
      hasNegativeDuration = true;
    }

    const parts = currentLine.split(" - ");

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

  return {
    entries: entries.filter((entry) => entry.project && entry.description),
    hasNegativeDuration: hasNegativeDuration,
  };
}

async function readWeekDir(
  weekDirHandle: FileSystemDirectoryHandle,
  rawReports: Array<RawReport>,
) {
  const weekDirNumber = Number.parseInt(weekDirHandle.name.split(" ")[1], 10);
  for await (const weekChild of weekDirHandle.values()) {
    if (weekChild.kind === "file") {
      const fileHandle = weekChild;
      if (!fileHandle.name.startsWith(TIMEREPORT_FILENAME_PREFIX)) {
        continue;
      }

      const fileDateString = fileHandle.name.replace(
        TIMEREPORT_FILENAME_PREFIX,
        "",
      );
      const fileDate = parse(fileDateString, DATE_FORMAT, new Date());
      const isoWeek = getISOWeek(fileDate);

      if (isoWeek !== weekDirNumber) {
        console.log("isoWeek !== weekDirNumber", fileDateString, fileDate, isoWeek, weekDirNumber);
        continue;
      }
      const file = await fileHandle.getFile();
      const content = await file.text();

      rawReports.push({
        name: fileHandle.name.replace(TIMEREPORT_FILENAME_PREFIX, ""),
        content,
      });
    }
  }

  return rawReports;
}

async function readYearDir(
  yearDirHandle: FileSystemDirectoryHandle,
  rawReports: Array<RawReport>,
  startDate?: Date,
  endDate?: Date
) {
  // Pre-calculate year number once
  const yearNumber = startDate || endDate ? Number.parseInt(yearDirHandle.name) : null;
  
  const entries = [];
  for await (const entry of yearDirHandle.values()) {
    if (entry.kind === "directory") {
      entries.push(entry);
    }
  }

  const processingTasks = entries
    .map(yearChild => {
      const dirNameMatch = yearChild.name.match(WEEK_DIR_NAME_REGEX);
      if (!dirNameMatch) return null;

      if (startDate && endDate) {
        const weekNumber = Number.parseInt(yearChild.name.split(" ")[1], 10);
        
        
          const paddedWeekStr = weekNumber.toString().padStart(2, '0');
          const weekStart = parseISO(`${yearNumber}-W${paddedWeekStr}-1`);
          const weekEnd = endOfWeek(weekStart)
         
        // I don't care about performance, it is fast anyway
        if (
          !areIntervalsOverlapping({
            start: weekStart,
            end: weekEnd
          }, {
            start: startDate,
            end: endDate
          })) {
          return null;
        }
      }

      return yearChild;
    })
    .filter((dir): dir is FileSystemDirectoryHandle => dir !== null)
    .map(weekDir => readWeekDir(weekDir, rawReports));

  const results = await Promise.all(processingTasks);
  
  return results.reduce((merged, current) => {
    merged.push(...current);
    return merged;
  }, rawReports);
}

export async function readReports(
  rootHandle: FileSystemDirectoryHandle,
  startDate?: Date,
  endDate?: Date
) {
  let rawReports: Array<RawReport> = [];
  
  const adjustedStartDate = startDate ? startOfWeek(startDate) : undefined;
  const adjustedEndDate = endDate ? endOfWeek(endDate) : undefined;

  for await (const rootChild of rootHandle.values()) {
    if (rootChild.kind === "directory") {
      const dirNameMatch = rootChild.name.match(YEAR_DIR_NAME_REGEX);
      if (!dirNameMatch) {
        continue;
      }

      rawReports = await readYearDir(
        rootChild,
        rawReports,
        adjustedStartDate,
        adjustedEndDate
      );
    }
  }

  return rawReports.reduce((prev, curr) => {
    const report = parseReport(curr.content);
    prev[curr.name] = report;
    return prev;
  }, {} as Reports);
}

export async function readReport(
  rootHandle: FileSystemDirectoryHandle,
  fileDateString: string,
) {
  const fileDate = parse(fileDateString, DATE_FORMAT, new Date());
  const isoWeek = getISOWeek(fileDate);
  const year = fileDate.getFullYear();

  const rawReport = await readFileFromPath(rootHandle, [
    year.toString(),
    `week ${isoWeek.toString().padStart(2, "0")}`,
    `${TIMEREPORT_FILENAME_PREFIX}${fileDateString}`,
  ]);

  if (!rawReport) {
    return null;
  }

  return parseReport(rawReport);
}

async function readFileFromPath(
  rootHandle: FileSystemDirectoryHandle,
  pathSegments: string[],
) {
  try {
    let currentHandle: FileSystemDirectoryHandle = rootHandle;

    // Traverse through directories
    for (const segment of pathSegments.slice(0, -1)) {
      currentHandle = await currentHandle.getDirectoryHandle(segment);
    }

    // Get the file handle
    const fileName = pathSegments[pathSegments.length - 1];
    const fileHandle = await currentHandle.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    return await file.text();
  } catch (error) {
    return null;
  }
}

export function serializeReport(entries: ReportEntry[]): string {
  let output = "";

  const sortedEntries = entries
    .filter((entry) => entry.description)
    .sort(
      (a, b) => parseTimeIntoMinutes(a.start) - parseTimeIntoMinutes(b.start),
    );

  for (const entryIndex of sortedEntries.keys()) {
    const entry = sortedEntries[entryIndex];
    const nextEntryIndex = entryIndex + 1;
    const nextEntry =
      nextEntryIndex < sortedEntries.length
        ? sortedEntries[nextEntryIndex]
        : null;

    let line = entry.start;

    if (entry.project) {
      line += ` - ${entry.project}`;

      if (entry.activity && entry.description) {
        line += ` - ${entry.activity} - ${entry.description}`;
      } else if (entry.description) {
        line += ` - ${entry.description}`;
      }
    }

    output += `${line}\n`;

    if (!nextEntry || entry.end !== nextEntry.start) {
      output += `${entry.end} - \n`;
    }
  }

  return output;
}

export async function writeReport(
  rootHandle: FileSystemDirectoryHandle,
  fileDateString: string,
  entries: ReportEntry[],
) {
  const fileDate = parse(fileDateString, DATE_FORMAT, new Date());
  const isoWeek = getISOWeek(fileDate);
  const year = fileDate.getFullYear();

  const rawReport = serializeReport(entries);

  await writeFileToPath(
    rootHandle,
    [
      year.toString(),
      `week ${isoWeek.toString().padStart(2, "0")}`,
      `${TIMEREPORT_FILENAME_PREFIX}${fileDateString}`,
    ],
    rawReport,
  );
}

async function writeFileToPath(
  rootHandle: FileSystemDirectoryHandle,
  pathSegments: string[],
  rawReport: string,
) {
  try {
    let currentHandle: FileSystemDirectoryHandle = rootHandle;

    // Traverse through directories
    for (const segment of pathSegments.slice(0, -1)) {
      currentHandle = await currentHandle.getDirectoryHandle(segment, {
        create: true,
      });
    }

    // Get the file handle
    const fileName = pathSegments[pathSegments.length - 1];
    const fileHandle = await currentHandle.getFileHandle(fileName, {
      create: true,
    });

    const writable = await fileHandle.createWritable();
    await writable.write(rawReport);
    await writable.close();
  } catch (error) {
    return null;
  }
}
