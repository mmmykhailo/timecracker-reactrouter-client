import { Suspense } from "react";
import { Await, redirect, useLoaderData } from "react-router";
import { get as idbGet, del as idbDel } from "idb-keyval";
import { AppHeader } from "~/components/app-header";
import {
  calculateDailyDurations,
  calculateMonthlyDurations,
  readReports,
} from "~/lib/reports";
import { YearlyProjectHoursChart } from "~/components/stats/yearly-project-hours-chart";
import { YearlyActivityGraph } from "~/components/stats/yearly-activity-graph";

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

    const reportsPromise = readReports(rootHandle);

    const dailyDurationsPromise = Promise.resolve(
      calculateDailyDurations(await reportsPromise),
    );
    const monthlyDurationsPromise = Promise.resolve(
      calculateMonthlyDurations(await dailyDurationsPromise),
    );

    return {
      dailyDurationsPromise,
      monthlyDurationsPromise,
    };
  } catch (e) {
    console.error(e);
    await idbDel("rootHandle");
    return redirect("/welcome");
  }
}

export default function Home() {
  const { dailyDurationsPromise, monthlyDurationsPromise } =
    useLoaderData<typeof clientLoader>();

  return (
    <div className="min-w-[640px]">
      <AppHeader />
      <div className="mt-8 flex flex-col gap-4 p-4">
        <div className="flex flex-1 flex-col gap-4 lg:grid lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Suspense fallback={<YearlyActivityGraph dailyDurations={{}} />}>
              <Await resolve={dailyDurationsPromise}>
                {(dailyDurations) => (
                  <YearlyActivityGraph dailyDurations={dailyDurations} />
                )}
              </Await>
            </Suspense>
          </div>
          <Suspense
            fallback={
              <YearlyProjectHoursChart
                monthlyDurations={{}}
                className="lg:col-span-6"
              />
            }
          >
            <Await resolve={monthlyDurationsPromise}>
              {(monthlyDurations) => (
                <YearlyProjectHoursChart
                  monthlyDurations={monthlyDurations}
                  className="lg:col-span-6"
                />
              )}
            </Await>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
