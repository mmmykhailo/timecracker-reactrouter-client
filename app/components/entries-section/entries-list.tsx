import { Fragment } from "react/jsx-runtime";
import { cn } from "~/lib/classNames";
import type { ReportEntry } from "~/lib/reports";
import { calculateDuration, formatDuration } from "~/lib/time-strings";
import ReportEntryCard from "../report-entry-card";
import { Separator } from "../ui/separator";

type EntriesListProps = {
  entries?: Array<ReportEntry>;
};

export function EntriesList({ entries }: EntriesListProps) {
  return (
    <div>
      {entries?.length ? (
        entries.map((reportEntry, i) => {
          const prevReportEntry = (i > 0 && entries?.[i - 1]) || null;

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
                // isInvalid={hasNegativeDuration}
                entryIndex={i}
                entry={reportEntry}
                className={cn("rounded-none last:rounded-b-lg", {
                  "rounded-t-none border-t-0": !breakDuration && i !== 0,
                  "rounded-t-lg": i === 0,
                })}
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
  );
}
