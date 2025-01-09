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
import { Form, useNavigation } from "react-router";
import { format } from "date-fns";
import { useEffect } from "react";

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
  const navigation = useNavigation();
  const entry = (entryIndex !== null && report?.[entryIndex]) || null;

  useEffect(() => {
    if (navigation.state === "submitting") {
      onClose();
    }
  }, [navigation.state, onClose]);

  return (
    <Dialog
      open={entryIndex !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          {entry ? (
            <DialogTitle>Edit report entry</DialogTitle>
          ) : (
            <DialogTitle>Add report entry</DialogTitle>
          )}

          <DialogDescription>
            Write down stuff you want to track
          </DialogDescription>
        </DialogHeader>
        <Form className="flex flex-col gap-6" action="/?index" method="POST">
          <input type="hidden" name="intent" value="edit-entry" />
          {selectedDate && (
            <input
              type="hidden"
              name="date"
              value={format(selectedDate, "yyyyMMdd")}
            />
          )}
          {entryIndex !== null && (
            <input type="hidden" name="entryIndex" value={entryIndex} />
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">Start Time *</Label>
              <Input
                id="start"
                name="start"
                defaultValue={entry?.start || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End Time *</Label>
              <Input id="end" name="end" defaultValue={entry?.end || ""} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Project *</Label>
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
            <Label htmlFor="description">Description *</Label>
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
