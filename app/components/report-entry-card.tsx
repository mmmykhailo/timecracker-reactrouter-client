import type { ReportEntry } from "~/lib/reports";
import { Button } from "./ui/button";
import { Edit, Trash } from "lucide-react";
import { Form } from "react-router";
import { format } from "date-fns";
import { cn } from "~/lib/utils";
import { formatDuration } from "~/lib/time-strings";

type ReportEntryCardProps = {
  isInvalid?: boolean;
  entry: ReportEntry;
  entryIndex: number;
  selectedDate: Date;
  className?: string;
  onEditClick: () => void;
};

export default function ReportEntryCard({
  isInvalid,
  entry: {
    project,
    activity,
    description,
    time: { start, end },
    duration,
  },
  entryIndex,
  selectedDate,
  className,
  onEditClick,
}: ReportEntryCardProps) {
  return (
    <div
      className={cn(
        "flex justify-between gap-2 rounded-lg border p-3 text-left text-sm",
        {
          "border-destructive": isInvalid,
        },
        className,
      )}
    >
      <div className="min-w-0 shrink">
        <div className="line-clamp-1 break-words font-semibold">{project}</div>
        <div className="line-clamp-1 break-words font-semibold text-sm">
          {activity}
        </div>
        <div className="break-words text-muted-foreground text-sm">
          {description}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end justify-between gap-1">
        <div className="text-muted-foreground text-sm">
          {start} - {end}
        </div>
        <div className="text-muted-foreground text-sm">
          {formatDuration(duration)}
        </div>
        <div className="mt-1 flex gap-2">
          <Button variant="outline" size="icon" onClick={onEditClick}>
            <Edit size={12} />
          </Button>
          <Form method="POST">
            <input type="hidden" name="intent" value="delete-entry" />
            <input
              type="hidden"
              name="entryIndex"
              value={entryIndex.toString()}
            />

            {selectedDate && (
              <input
                type="hidden"
                name="date"
                value={format(selectedDate, "yyyyMMdd")}
              />
            )}
            <Button type="submit" variant="outline" size="icon">
              <Trash size={12} />
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
