import { type LoaderFunctionArgs, data } from "react-router";
import { getAuthHeaders, logoutIfUnauthorized } from "~/lib/auth.server";
import { http } from "~/lib/http.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (!from || !to) {
    throw new Response(null, {
      status: 400,
      statusText: "Bad Request",
    });
  }

  const { requestHeaders, responseHeaders } = await getAuthHeaders(request);

  const {
    data: reportResponse,
    response: { status: responseStatus },
  } = await http.getReportsDailyDurations({
    headers: requestHeaders,
    query: {
      from,
      to,
    },
  });

  console.log({ reportResponse });

  await logoutIfUnauthorized(responseStatus, request);

  return data(reportResponse?.dailyDurations, { headers: responseHeaders });
}
