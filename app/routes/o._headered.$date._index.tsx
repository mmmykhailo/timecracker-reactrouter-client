import {
  type LoaderFunctionArgs,
  data,
  redirect,
  useLoaderData,
} from "react-router";
import DateControls from "~/components/date-controls";
import { EntriesSection } from "~/components/entries-section";
import { RefreshPageButton } from "~/components/refresh-page-button";
import { getAuthHeaders, logoutIfUnauthorized } from "~/lib/auth.server";
import { parseDateString } from "~/lib/date-strings";
import { http } from "~/lib/http.server";

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

  const date = parseDateString(dateStr);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:grid lg:grid-cols-12">
      <div className="col-span-8 flex flex-col gap-4">
        <div className="flex flex-wrap justify-between gap-2">
          <RefreshPageButton />
          <DateControls selectedDate={date} />
        </div>
      </div>
      <div className="col-span-4 flex flex-col gap-4">
        <EntriesSection
          report={
            report || {
              date: dateStr,
              entries: [],
            }
          }
        />
      </div>
    </div>
  );
}
