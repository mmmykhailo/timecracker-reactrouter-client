import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import type { ReportEntry } from "~/lib/reports";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Form } from "react-router";
import { format } from "date-fns";

type TimeEntryFormProps = {
  report: Array<ReportEntry> | null;
  entryIndex: number | null;
  selectedDate: Date;
  onClose: () => void;
};

const TimeEntryForm = ({
  report,
  entryIndex,
  selectedDate,
  onClose,
}: TimeEntryFormProps) => {
  const entry = (entryIndex !== null && report?.[entryIndex]) || null;

  return (
    <Dialog open={!!entry} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit report entry</DialogTitle>
          <DialogDescription>
            Write down stuff you want to track
          </DialogDescription>
        </DialogHeader>
        <Form className="space-y-6" action="/?index" method="POST">
          {selectedDate && (
            <input
              type="hidden"
              name="date"
              value={format(selectedDate, "yyyyMMdd")}
            />
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">Start Time</Label>
              <Input
                id="start"
                name="start"
                defaultValue={entry?.start || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End Time</Label>
              <Input id="end" name="end" defaultValue={entry?.end || ""} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <Input
              id="project"
              name="project"
              defaultValue={entry?.project || ""}
              placeholder="Project name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity">Activity</Label>
            <Input
              id="activity"
              name="activity"
              defaultValue={entry?.activity || ""}
              placeholder="Activity"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={entry?.description || ""}
              placeholder="Description"
              className="h-24"
            />
          </div>

          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TimeEntryForm;
