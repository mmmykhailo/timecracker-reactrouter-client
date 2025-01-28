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
import { useFetcher } from "react-router";
import { format, isToday } from "date-fns";
import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "~/lib/utils";
import { useTimeInput } from "~/hooks/use-time-input";
import { formatTime } from "~/lib/time-strings";
import type { clientAction } from "~/routes/_index";

type EntryFormProps = {
  report: Report | null;
  entryIndex: number | null;
  selectedDate: Date;
  onClose: () => void;
};

const EntryForm = ({
  report,
  entryIndex,
  selectedDate,
  onClose,
}: EntryFormProps) => {
  const { onChange: onTimeChange, onBlur: onTimeBlur } = useTimeInput();
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const [isValidationStale, setIsValidationStale] = useState(true);
  const fetcher = useFetcher<typeof clientAction>();
  const errors = isValidationStale ? null : fetcher.data?.entryFormErrors;
  const entry = (entryIndex !== null && report?.entries?.[entryIndex]) || null;

  const [defaultStart, defaultEnd] = useMemo(() => {
    if (!isToday(selectedDate)) {
      return ["", ""];
    }

    const prevEntry =
      (entryIndex !== null && report?.entries?.[entryIndex - 1]) || null;

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
  }, [selectedDate, entryIndex, report]);

  const handleDescriptionEnterPress = (
    e: KeyboardEvent<HTMLTextAreaElement>,
  ): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitButtonRef.current?.click();
    }
  };

  const handleClose = () => {
    setIsValidationStale(true);
    onClose();
  };

  return (
    <Dialog
      open={entryIndex !== null}
      onOpenChange={(open) => !open && handleClose()}
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
        <fetcher.Form
          className="flex flex-col gap-6"
          action="/?index"
          method="POST"
          onSubmit={() => setIsValidationStale(false)}
        >
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
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Start Time *</Label>
                <Input
                  required
                  id="start"
                  name="start"
                  className={cn({
                    "border-destructive":
                      errors?.nested?.time || errors?.nested?.["time.start"],
                  })}
                  defaultValue={entry?.time.start || defaultStart}
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
                  required
                  id="end"
                  name="end"
                  className={cn({
                    "border-destructive":
                      errors?.nested?.time || errors?.nested?.["time.end"],
                  })}
                  defaultValue={entry?.time.end || defaultEnd}
                  autoComplete="off"
                  placeholder="10:15"
                  onChange={onTimeChange}
                  onBlur={onTimeBlur}
                  onFocus={(e) => e.target.select()}
                />
              </div>
            </div>

            {!!errors?.nested?.time?.[0] && (
              <div className="mt-1 text-destructive">
                {errors?.nested?.time?.[0]}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Project *</Label>
            <Input
              required
              id="project"
              name="project"
              className={cn({
                "border-destructive": errors?.nested?.project,
              })}
              defaultValue={entry?.project || ""}
              autoComplete="off"
              maxLength={32}
              placeholder="Project name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity">Activity</Label>
            <Input
              id="activity"
              name="activity"
              className={cn({
                "border-destructive": errors?.nested?.activity,
              })}
              defaultValue={entry?.activity || ""}
              autoComplete="off"
              maxLength={32}
              placeholder="Activity"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              required
              id="description"
              name="description"
              className={cn("h-24", {
                "border-destructive": errors?.nested?.description,
              })}
              onKeyDown={handleDescriptionEnterPress}
              defaultValue={entry?.description || ""}
              autoComplete="off"
              maxLength={256}
              placeholder="Description"
            />
          </div>

          <DialogFooter>
            <Button ref={submitButtonRef} type="submit">
              Save changes
            </Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
};

export default EntryForm;
