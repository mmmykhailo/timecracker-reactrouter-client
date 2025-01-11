import { get as idbGet, del as idbDel } from "idb-keyval";
import { AppHeader } from "~/components/app-header";
import { readReports } from "~/lib/reports";
import { redirect, useLoaderData } from "react-router";
import { YearlyProjectHoursChart } from "~/components/stats/yearly-project-hours-chart";

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
      reports: await readReports(rootHandle),
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
      <div className="flex flex-col lg:grid lg:grid-cols-12 flex-1 gap-4 p-4 mt-8">
        <YearlyProjectHoursChart reports={loaderReports} />
      </div>
    </div>
  );
}
