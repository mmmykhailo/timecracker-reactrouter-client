import type {
  ActionFunctionArgs,
  ClientActionFunctionArgs,
} from "react-router";
import { type FlatErrors, flatten, safeParse } from "valibot";
import {
  http,
  getAuthHeaders,
  performAuthenticatedRequest,
} from "~/lib/http.server";
import type {
  Report,
  ReportEntry,
  UnownedReportData,
} from "~/lib/http.server/codegen";
import { EntryFormSchema } from "~/lib/schema";
import { parseTimeIntoMinutes } from "~/lib/time-strings";

function validateEntryForm(formData: FormData) {
  const entryFormData = {
    time: {
      start: formData.get("start")?.toString(),
      end: formData.get("end")?.toString(),
    },
    project: formData.get("project")?.toString(),
    activity: formData.get("activity")?.toString(),
    description: formData.get("description")?.toString(),
    reportId: formData.get("reportId")?.toString(),
    date: formData.get("date")?.toString(),
    entryIndex: formData.get("entryIndex")?.toString(),
  };

  const parsedEntryFormData = safeParse(EntryFormSchema, entryFormData);

  if (!parsedEntryFormData.success) {
    return {
      errors: flatten(parsedEntryFormData.issues),
    };
  }

  return { parsedEntryFormData };
}

export async function action({ request, params }: ActionFunctionArgs): Promise<{
  errors: FlatErrors<undefined>;
}> {
  const dateStr = params.date;

  if (!dateStr) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  const body = await request.formData();

  const { errors, parsedEntryFormData } = validateEntryForm(body);

  if (errors) {
    return { errors };
  }

  const entry: ReportEntry = {
    time: {
      start: parsedEntryFormData.output.time.start,
      end: parsedEntryFormData.output.time.end,
    },
    duration:
      parseTimeIntoMinutes(parsedEntryFormData.output.time.end) -
      parseTimeIntoMinutes(parsedEntryFormData.output.time.start),
    project: parsedEntryFormData.output.project,
    activity: parsedEntryFormData.output.activity || null,
    description: parsedEntryFormData.output.description,
  };

  const { requestHeaders } = await getAuthHeaders(request);

  const { data: getReportResponse } = await performAuthenticatedRequest(
    request,
    http.getReportByDate({
      headers: requestHeaders,
      path: {
        date: dateStr,
      },
    }),
  );

  const report: Report | UnownedReportData = getReportResponse?.report || {
    date: dateStr,
    entries: [],
  };
  report.entries.push(entry);

  const { data: putReportResponse } = await performAuthenticatedRequest(
    request,
    http.putReportByDate({
      headers: requestHeaders,
      path: {
        date: dateStr,
      },
      body: report,
    }),
  );

  if (!putReportResponse) {
    return {
      errors: {
        nested: {
          unknown: ["Unknown error"],
        },
      },
    };
  }
  return {
    errors: {},
  };
}

export async function clientAction({
  request,
  serverAction,
}: ClientActionFunctionArgs) {
  const body = await request.clone().formData();

  const { errors } = validateEntryForm(body);

  if (errors) {
    return { errors };
  }

  const data = await serverAction();
  return data;
}
