import { type LoaderFunctionArgs, data, useLoaderData } from "react-router";
import { Fragment } from "react/jsx-runtime";
import ReportEntryCard from "~/components/report-entry-card";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/classNames";
import { http, getAuthHeaders } from "~/lib/http.server";
import { calculateDuration, formatDuration } from "~/lib/time-strings";

export async function loader({ request }: LoaderFunctionArgs) {
  const { requestHeaders } = await getAuthHeaders(request);

  const {
    data: reportsResponse,
    response: { status: responseStatus },
  } = await http.getReports({
    headers: requestHeaders,
  });

  if (responseStatus === 401) {
    console.log("unauthorized");
  }

  return data({ reports: reportsResponse?.reports || [] });
}

export default function ProfilePage() {
  const { reports } = useLoaderData<typeof loader>();
  const entries = reports?.[0]?.entries;

  return (
    <div className="col-span-4 flex flex-col gap-4 p-4">
      <div>
        {entries?.length ? (
          entries.map((reportEntry, i) => {
            const prevReportEntry = (i > 0 && entries[i - 1]) || null;

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
                  //   isInvalid={selectedReport.hasNegativeDuration}
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
    </div>
  );
}
