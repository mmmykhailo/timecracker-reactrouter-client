import { useEffect, useRef } from "react";
import {
  type LoaderFunctionArgs,
  data,
  href,
  redirect,
  useFetcher,
  useLoaderData,
} from "react-router";
import DateControls from "~/components/date-controls";
import { EntriesSection } from "~/components/entries-section";
import HoursCalendar from "~/components/hours-calendar";
import { RefreshPageButton } from "~/components/refresh-page-button";
import { getAuthHeaders, logoutIfUnauthorized } from "~/lib/auth.server";
import {
  endOfMonth,
  formatDateString,
  parseDateString,
  startOfMonth,
} from "~/lib/date-utils";
import { http } from "~/lib/http.server";
import type { loader as dailyDurationsLoader } from "./o._actions.daily-durations";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const dateStr = params.date;

  if (!dateStr) {
    throw redirect("/");
  }

  const { requestHeaders, responseHeaders } = await getAuthHeaders(request);

  const {
    data: reportResponse,
    response: { status: responseStatus },
  } = await http.getReportByDate({
    headers: requestHeaders,
    path: {
      date: dateStr,
    },
  });

  await logoutIfUnauthorized(responseStatus, request);

  return data(
    { report: reportResponse?.report, dateStr },
    {
      headers: responseHeaders,
    },
  );
}

export default function OnlineReportPage() {
  const { report, dateStr } = useLoaderData<typeof loader>();
  const dailyDurationsFetcher = useFetcher<typeof dailyDurationsLoader>();
  const isLoaded = useRef(false);

  console.log({ report, dateStr });

  const date = parseDateString(dateStr);

  useEffect(() => {
    console.log(dailyDurationsFetcher.data, dailyDurationsFetcher.state);
    if (
      !dailyDurationsFetcher.data ||
      dailyDurationsFetcher.state === "loading"
    ) {
      return;
    }

    if (dailyDurationsFetcher.data) {
      console.log({ data: dailyDurationsFetcher.data });
    }
  }, [dailyDurationsFetcher.data, dailyDurationsFetcher.state]);

  useEffect(() => {
    if (!isLoaded.current) {
      const url = href("/o/daily-durations");
      const searchParams = new URLSearchParams();
      searchParams.append("from", formatDateString(startOfMonth(date)));
      searchParams.append("to", formatDateString(endOfMonth(date)));

      dailyDurationsFetcher.load(`${url}?${searchParams.toString()}`);
      isLoaded.current = true;
    }
  }, [dailyDurationsFetcher, date]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:grid lg:grid-cols-12">
      <div className="col-span-8 flex flex-col gap-4">
        <div className="flex flex-wrap justify-between gap-2">
          <RefreshPageButton />
          <DateControls selectedDate={date} />
        </div>
        <div className="rounded-xl border p-4">
          <HoursCalendar
            selectedDate={date}
            dailyDurations={dailyDurationsFetcher.data || {}}
          />
        </div>
      </div>
      <div className="col-span-4 flex flex-col gap-4">
        <EntriesSection
          report={
            report || {
              date: date.toISOString(),
              entries: [],
            }
          }
        />
      </div>
    </div>
  );
}
