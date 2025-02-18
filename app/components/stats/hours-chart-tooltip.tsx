import type * as RechartsPrimitive from "recharts";
import type { ComponentProps, CSSProperties } from "react";
import { chartColors } from "~/lib/colors";
import { formatDuration } from "~/lib/time-strings";

export const HoursChartTooltip = ({
  active,
  payload,
  label,
  names,
}: ComponentProps<typeof RechartsPrimitive.Tooltip> & {
  names: Array<string>;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="flex flex-col gap-2 rounded border bg-background p-2">
        <div className="font-medium">{label}</div>
        <div className="flex flex-col-reverse">
          {payload.map(({ name, value }) => {
            if (typeof value !== "number" || typeof name !== "string") {
              return;
            }
            return (
              <div key={name} className="flex w-full justify-between gap-3">
                <div className="flex items-center gap-1">
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-(--color-bg)"
                    style={
                      {
                        "--color-bg":
                          chartColors[
                            names.findIndex((n) => n === name) %
                              chartColors.length
                          ],
                      } as CSSProperties
                    }
                  />
                  {name}
                </div>
                {formatDuration(value)}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};
