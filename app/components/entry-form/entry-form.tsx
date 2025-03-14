import { format } from "date-fns";
import { type KeyboardEvent, useCallback, useMemo, useRef } from "react";
import { href, useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { useTimeInput } from "~/hooks/use-time-input";
import { cn } from "~/lib/classNames";
import { parseDateString } from "~/lib/date-strings";
import type { Report } from "~/lib/http.server/codegen";
import type { action } from "~/routes/o._actions.new-entry.$date";
import { AutoCompleteInput } from "../ui/autocomplete-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useDefaultTime } from "./use-default-time";

type EntryFormProps = {
  report: Pick<Report, "date" | "entries">;
  entryIndex: number | null;
  recentProjects: Array<string>;
  onClose: () => void;
};

const EntryForm = ({
  report,
  entryIndex,
  recentProjects,
  onClose,
}: EntryFormProps) => {
  const { onChange: onTimeChange, onBlur: onTimeBlur } = useTimeInput();
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const fetcher = useFetcher<typeof action>({ key: "entry-form" });
  const errors = fetcher.data?.errors;
  const entry = (entryIndex !== null && report?.entries?.[entryIndex]) || null;
  const date = useMemo(() => parseDateString(report.date), [report]);

  const [defaultStart, defaultEnd] = useDefaultTime(
    report.entries,
    date,
    entryIndex,
  );

  const handleDescriptionEnterPress = (
    e: KeyboardEvent<HTMLTextAreaElement>,
  ): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitButtonRef.current?.click();
    }
  };

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const getProjectSuggestions = (value: string) => {
    if (!value) {
      return recentProjects.slice(-6);
    }
    return recentProjects
      .filter((project) => project.includes(value))
      .slice(-6);
  };

  if (!report || !date) {
    return null;
  }

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
          action={href("/o/new-entry/:date", {
            date: report.date,
          })}
          method="POST"
        >
          <input type="hidden" name="date" value={format(date, "yyyyMMdd")} />
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
            <AutoCompleteInput
              required
              id="project"
              name="project"
              wrapperClassName={cn({
                "border-destructive": errors?.nested?.project?.[0],
              })}
              defaultValue={entry?.project || ""}
              maxLength={32}
              placeholder="Project name"
              getSuggestions={getProjectSuggestions}
            />
            {!!errors?.nested?.project?.[0] && (
              <div className="mt-1 text-destructive">
                {errors?.nested?.project?.[0]}
              </div>
            )}
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
            {!!errors?.nested?.unknown?.[0] && (
              <div className="mt-1 text-destructive">
                {errors?.nested?.unknown?.[0]}
              </div>
            )}
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
};

export default EntryForm;
