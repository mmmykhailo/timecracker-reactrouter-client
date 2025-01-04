import { formatDuration, type ReportEntry } from "~/lib/reports";
import { Button } from "./ui/button";
import { Edit, Trash } from "lucide-react";

type ReportEntryCardProps = {
  entry: ReportEntry;
  onEditClick: () => void;
};

export default function ReportEntryCard({
  entry: { project, activity, description, start, end, duration },
  onEditClick,
}: ReportEntryCardProps) {
  return (
    <div className="flex justify-between gap-2 rounded-lg border p-3 text-left text-sm">
      <div>
        <div className="font-semibold">{project}</div>
        <div className="font-semibold text-sm">{activity}</div>
        <div className="text-muted-foreground text-sm">{description}</div>
      </div>
      <div className="flex flex-col items-end justify-between gap-1 flex-shrink-0">
        <div className="text-muted-foreground text-sm">
          {start} - {end}
        </div>
        <div className="text-muted-foreground text-sm">
          {formatDuration(duration)}
        </div>
        <div className="flex gap-2 mt-1">
          <Button variant="outline" size="icon" onClick={onEditClick}>
            <Edit size={12} />
          </Button>
          <Button variant="outline" size="icon">
            <Trash size={12} />
          </Button>
        </div>
      </div>
    </div>
  );
}
