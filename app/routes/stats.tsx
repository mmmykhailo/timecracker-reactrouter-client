import { Suspense } from "react";
import { Await, redirect, useLoaderData } from "react-router";
import { get as idbGet, del as idbDel } from "idb-keyval";
import { AppHeader } from "~/components/app-header";
import {
  calculateDailyDurations,
  calculateMonthlyDurations,
  calculateWeeklyDurations,
  readReports,
} from "~/lib/reports";
import { MonthlyProjectHoursChart } from "~/components/stats/monthly-project-hours-chart";
import { YearlyActivityGraph } from "~/components/stats/yearly-activity-graph";
import { WeeklyProjectHoursChart } from "~/components/stats/weekly-project-hours-chart";
import { DailyProjectHoursChart } from "~/components/stats/daily-project-hours-chart";

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
    const weeklyDurationsPromise = Promise.resolve(
      calculateWeeklyDurations(await dailyDurationsPromise),
    );

    return {
      dailyDurationsPromise,
      monthlyDurationsPromise,
      weeklyDurationsPromise,
    };
  } catch (e) {
    console.error(e);
    await idbDel("rootHandle");
    return redirect("/welcome");
  }
}

export default function Home() {
  const {
    dailyDurationsPromise,
    weeklyDurationsPromise,
    monthlyDurationsPromise,
  } = useLoaderData<typeof clientLoader>();

  return (
    <div className="min-w-[640px]">
      <AppHeader />
      <div className="mt-8 flex flex-col gap-4 p-4">
        <div className="flex flex-1 flex-col gap-4 lg:grid lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-6">
            <Suspense fallback={<YearlyActivityGraph dailyDurations={{}} />}>
              <Await resolve={dailyDurationsPromise}>
                {(dailyDurations) => (
                  <YearlyActivityGraph dailyDurations={dailyDurations} />
                )}
              </Await>
            </Suspense>
            <Suspense
              fallback={<WeeklyProjectHoursChart weeklyDurations={{}} />}
            >
              <Await resolve={weeklyDurationsPromise}>
                {(weeklyDurations) => (
                  <WeeklyProjectHoursChart weeklyDurations={weeklyDurations} />
                )}
              </Await>
            </Suspense>
          </div>
          <div className="flex flex-col gap-4 lg:col-span-6">
            <Suspense
              fallback={<MonthlyProjectHoursChart monthlyDurations={{}} />}
            >
              <Await resolve={monthlyDurationsPromise}>
                {(monthlyDurations) => (
                  <MonthlyProjectHoursChart
                    monthlyDurations={monthlyDurations}
                  />
                )}
              </Await>
            </Suspense>
            <Suspense fallback={<DailyProjectHoursChart dailyDurations={{}} />}>
              <Await resolve={dailyDurationsPromise}>
                {(dailyDurations) => (
                  <DailyProjectHoursChart dailyDurations={dailyDurations} />
                )}
              </Await>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
