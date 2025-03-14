import { isToday } from "date-fns";
import { useMemo } from "react";
import type { ReportEntry } from "~/lib/http.server/codegen";
import { formatTime } from "~/lib/time-strings";

export function useDefaultTime(
  entries: Array<ReportEntry>,
  date: Date,
  entryIndex: number | null = null,
) {
  return useMemo(() => {
    if (!entries || !date) {
      return ["", ""];
    }

    const prevEntry =
      (entryIndex !== null && entries?.[entryIndex - 1]) || null;

    if (!isToday(date)) {
      return [prevEntry?.time.end || "", ""];
    }

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    const floorMinutes = Math.floor(minutes / 15) * 15;
    const ceilHours = Math.ceil(minutes / 15 > 3 ? hours + 1 : hours);
    const ceilMinutes = Math.ceil(minutes / 15 > 3 ? 0 : minutes / 15) * 15;

    return [
      prevEntry?.time.end || formatTime(hours, floorMinutes),
      formatTime(ceilHours, ceilMinutes),
    ];
  }, [entryIndex, entries, date]);
}
