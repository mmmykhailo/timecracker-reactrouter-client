import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import { Fragment } from "react/jsx-runtime";
import ReportEntryCard from "~/components/report-entry-card";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/classNames";
import { getReportEntries } from "~/lib/http";
import { getSession } from "~/lib/sessions";
import { calculateDuration, formatDuration } from "~/lib/time-strings";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const accessToken = session.get("accessToken");
  const refreshToken = session.get("refreshToken");

  const headers = new Headers();
  headers.append("Authorization", `Bearer ${accessToken}`);
  const { data, error } = await getReportEntries({
    headers,
  });

  console.log(accessToken);

  return { data };
}

export default function ProfilePage() {
  const { data } = useLoaderData<typeof loader>();

  if (!data) {
    return "Invalid data";
  }

  return (
    <div className="col-span-4 flex flex-col gap-4 p-4">
      <div>
        {data.reportEntries.length ? (
          data.reportEntries.map((reportEntry, i) => {
            const prevReportEntry =
              (i > 0 && data.reportEntries?.[i - 1]) || null;

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
