import type { ReportEntry } from "~/lib/reports";
import { Button } from "./ui/button";
import { Edit, Trash } from "lucide-react";
import { Form, useFetcher } from "react-router";
import { format } from "date-fns";
import { cn } from "~/lib/utils";
import { formatDuration } from "~/lib/time-strings";
import CopyableText from "./ui/copyable-text";

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
  const fetcher = useFetcher();

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
        <div>
          <CopyableText>
            <span className="line-clamp-1 break-all font-semibold">
              {project}
            </span>
          </CopyableText>
        </div>
        <div>
          {!!activity && (
            <CopyableText>
              <span className="line-clamp-1 break-all font-semibold text-sm">
                {activity}
              </span>
            </CopyableText>
          )}
        </div>
        <div className="break-words text-muted-foreground text-sm">
          <CopyableText>{description}</CopyableText>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end justify-between gap-1">
        <div className="text-muted-foreground text-sm">
          {start} - {end}
        </div>
        <div className="text-muted-foreground text-sm">
          <CopyableText>{formatDuration(duration)}</CopyableText>
        </div>
        <div className="mt-1 flex gap-2">
          <Button variant="outline" size="icon" onClick={onEditClick}>
            <Edit size={12} />
          </Button>
          <Form method="POST" action="/?index">
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
