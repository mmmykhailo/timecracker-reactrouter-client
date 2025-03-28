import {
  type ActionFunctionArgs,
  type ClientActionFunctionArgs,
  data,
} from "react-router";
import { type FlatErrors, flatten, safeParse } from "valibot";
import { getAuthHeaders } from "~/lib/auth.server";
import { http, performAuthenticatedRequest } from "~/lib/http.server";
import type {
  Report,
  ReportEntry,
  UnownedReportData,
} from "~/lib/http.server/codegen";
import { EntryFormSchema } from "~/lib/schema";
import { parseTimeIntoMinutes } from "~/lib/time-strings";

function validateEntryForm(formData: FormData, dateStr: string) {
  const entryFormData = {
    dateStr: dateStr,
    time: {
      start: formData.get("start")?.toString(),
      end: formData.get("end")?.toString(),
    },
    project: formData.get("project")?.toString(),
    activity: formData.get("activity")?.toString(),
    description: formData.get("description")?.toString(),
    reportId: formData.get("reportId")?.toString(),
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

export async function action({ request, params }: ActionFunctionArgs) {
  const dateStr = params.date;

  console.log({ dateStr });

  if (!dateStr) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }
  const { requestHeaders, responseHeaders } = await getAuthHeaders(request);

  const body = await request.formData();

  const { errors, parsedEntryFormData } = validateEntryForm(body, dateStr);

  if (errors) {
    console.log({ errors });
    return data({ errors }, { headers: responseHeaders });
  }

  console.log({ parsedEntryFormData });

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

  const { data: getReportResponse } = await performAuthenticatedRequest(
    request,
    http.getReportByDate({
      headers: requestHeaders,
      path: {
        date: parsedEntryFormData.output.dateStr,
      },
    }),
  );

  const report: Report | UnownedReportData = getReportResponse?.report || {
    date: parsedEntryFormData.output.dateStr,
    entries: [],
  };
  report.entries.push(entry);

  console.log(
    "REPORT",
    { report },
    { dateStr: parsedEntryFormData.output.dateStr },
  );

  const { data: putReportResponse } = await performAuthenticatedRequest(
    request,
    http.putReportByDate({
      headers: requestHeaders,
      path: {
        date: parsedEntryFormData.output.dateStr,
      },
      body: report,
    }),
  );

  if (!putReportResponse) {
    const errors: FlatErrors<undefined> = {
      nested: {
        unknown: ["Unknown error"],
      },
    };
    return data(
      {
        errors,
      },
      {
        headers: responseHeaders,
      },
    );
  }
  return {
    errors: null,
  };
}

export async function clientAction({
  request,
  params,
  serverAction,
}: ClientActionFunctionArgs) {
  const date = params.date;

  if (!date) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  const body = await request.clone().formData();

  const { errors } = validateEntryForm(body, date);

  if (errors) {
    return { errors };
  }

  const data = await serverAction();
  return data;
}
