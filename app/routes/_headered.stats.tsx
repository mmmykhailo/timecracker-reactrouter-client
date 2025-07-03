import { Suspense } from "react";
import { Await, redirect, useLoaderData } from "react-router";
import { get as idbGet, del as idbDel } from "idb-keyval";
import {
  calculateDailyDurations,
  calculateMonthlyDurations,
  calculateQuarterlyDurations,
  calculateWeeklyDurations,
  calculateYearlyDurations,
  readReports,
} from "~/lib/reports";
import { MonthlyProjectHoursChart } from "~/components/stats/monthly-project-hours-chart";
import { YearlyActivityGraph } from "~/components/stats/yearly-activity-graph";
import { WeeklyProjectHoursChart } from "~/components/stats/weekly-project-hours-chart";
import { DailyProjectHoursChart } from "~/components/stats/daily-project-hours-chart";
import { DetailedTotals } from "~/components/stats/detailed-totals";

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

    const dailyDurationsPromise = reportsPromise.then(calculateDailyDurations);
    const monthlyDurationsPromise = dailyDurationsPromise.then(
      calculateMonthlyDurations,
    );
    const weeklyDurationsPromise = dailyDurationsPromise.then(
      calculateWeeklyDurations,
    );
    const quarterlyDurationsPromise = monthlyDurationsPromise.then(
      calculateQuarterlyDurations,
    );
    const yearlyDurationsPromise = quarterlyDurationsPromise.then(
      calculateYearlyDurations,
    );

    return {
      dailyDurationsPromise,
      monthlyDurationsPromise,
      weeklyDurationsPromise,
      quarterlyDurationsPromise,
      yearlyDurationsPromise,
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
    quarterlyDurationsPromise,
    yearlyDurationsPromise,
  } = useLoaderData<typeof clientLoader>();

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-1 flex-col gap-4 lg:grid lg:grid-cols-12">
        <div className="flex flex-col gap-4 lg:col-span-6">
          <Suspense fallback={<YearlyActivityGraph dailyDurations={{}} />}>
            <Await resolve={dailyDurationsPromise}>
              {(dailyDurations) => (
                <YearlyActivityGraph dailyDurations={dailyDurations} />
              )}
            </Await>
          </Suspense>
          <Suspense fallback={<WeeklyProjectHoursChart weeklyDurations={{}} />}>
            <Await resolve={weeklyDurationsPromise}>
              {(weeklyDurations) => (
                <WeeklyProjectHoursChart weeklyDurations={weeklyDurations} />
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
        <div className="flex flex-col gap-4 lg:col-span-6">
          <Suspense
            fallback={
              <DetailedTotals
                dailyDurations={{}}
                weeklyDurations={{}}
                monthlyDurations={{}}
                quarterlyDurations={{}}
                yearlyDurations={{}}
              />
            }
          >
            <Await
              resolve={Promise.all([
                dailyDurationsPromise,
                weeklyDurationsPromise,
                monthlyDurationsPromise,
                quarterlyDurationsPromise,
                yearlyDurationsPromise,
              ])}
            >
              {([
                dailyDurations,
                weeklyDurations,
                monthlyDurations,
                quarterlyDurations,
                yearlyDurations,
              ]) => (
                <DetailedTotals
                  dailyDurations={dailyDurations}
                  weeklyDurations={weeklyDurations}
                  monthlyDurations={monthlyDurations}
                  quarterlyDurations={quarterlyDurations}
                  yearlyDurations={yearlyDurations}
                />
              )}
            </Await>
          </Suspense>
          <Suspense
            fallback={<MonthlyProjectHoursChart monthlyDurations={{}} />}
          >
            <Await resolve={monthlyDurationsPromise}>
              {(monthlyDurations) => (
                <MonthlyProjectHoursChart monthlyDurations={monthlyDurations} />
              )}
            </Await>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
