import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import type { Report } from "~/lib/reports";
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
import { findIssueByPath, type EntryFormIssue } from "~/lib/schema";
import { cn } from "~/lib/utils";
import { useTimeInput } from "~/hooks/use-time-input";

type EntryFormProps = {
  report: Report | null;
  entryIndex: number | null;
  selectedDate: Date;
  issues?: Array<EntryFormIssue>;
  onClose: () => void;
};

const EntryForm = ({
  report,
  entryIndex,
  selectedDate,
  issues,
  onClose,
}: EntryFormProps) => {
  const navigation = useNavigation();
  const { onChange: onTimeChange, onBlur: onTimeBlur } = useTimeInput();
  const entry = (entryIndex !== null && report?.entries?.[entryIndex]) || null;

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
                className={cn({
                  "border-destructive": !!findIssueByPath(issues, "start"),
                })}
                defaultValue={entry?.start || ""}
                autoComplete="off"
                placeholder="10:00"
                onChange={onTimeChange}
                onBlur={onTimeBlur}
                onFocus={(e) => e.target.select()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End Time *</Label>
              <Input
                id="end"
                name="end"
                className={cn({
                  "border-destructive": !!findIssueByPath(issues, "end"),
                })}
                defaultValue={entry?.end || ""}
                autoComplete="off"
                placeholder="10:15"
                onChange={onTimeChange}
                onBlur={onTimeBlur}
                onFocus={(e) => e.target.select()}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Project *</Label>
            <Input
              id="project"
              name="project"
              className={cn({
                "border-destructive": !!findIssueByPath(issues, "project"),
              })}
              defaultValue={entry?.project || ""}
              autoComplete="off"
              placeholder="Project name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity">Activity</Label>
            <Input
              id="activity"
              name="activity"
              className={cn({
                "border-destructive": !!findIssueByPath(issues, "activity"),
              })}
              defaultValue={entry?.activity || ""}
              autoComplete="off"
              placeholder="Activity"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              className={cn("h-24", {
                "border-destructive": !!findIssueByPath(issues, "description"),
              })}
              defaultValue={entry?.description || ""}
              autoComplete="off"
              placeholder="Description"
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

export default EntryForm;
