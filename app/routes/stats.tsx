import { get as idbGet, del as idbDel } from "idb-keyval";
import { AppHeader } from "~/components/app-header";
import { readReports } from "~/lib/reports";
import { Await, redirect, useLoaderData } from "react-router";
import { YearlyProjectHoursChart } from "~/components/stats/yearly-project-hours-chart";
import { Suspense } from "react";
import { LoaderCircle } from "lucide-react";

export function meta() {
  return [
    { title: "Timecracker" },
    { name: "description", content: "Stupidly simple timetracker" },
  ];
}

export async function clientLoader() {
  try {
    const rootHandle: FileSystemDirectoryHandle | undefined =
      await idbGet("rootHandle");

    if (!rootHandle) {
      return redirect("/welcome");
    }

    return {
      reports: readReports(rootHandle),
    };
  } catch (e) {
    console.error(e);
    await idbDel("rootHandle");
    return redirect("/welcome");
  }
}

export default function Home() {
  const { reports: loaderReports } = useLoaderData<typeof clientLoader>();

  return (
    <div className="min-w-[640px]">
      <AppHeader />
      <Suspense
        fallback={
          <div className="grid min-h-[50svh] place-items-center">
            <LoaderCircle className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <Await resolve={loaderReports}>
          {(reports) => (
            <div className="mt-8 flex flex-1 flex-col gap-4 p-4 lg:grid lg:grid-cols-12">
              <YearlyProjectHoursChart reports={reports} />
            </div>
          )}
        </Await>
      </Suspense>
    </div>
  );
}
