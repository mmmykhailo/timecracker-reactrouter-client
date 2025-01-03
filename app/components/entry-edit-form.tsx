import React, { useEffect, type FormEventHandler } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Alert, AlertDescription } from "~/components/ui/alert";
import type { Reports, TimeEntry } from "~/lib/reports";

type TimeEntryFormProps = {
  reports: Reports;
  onSave: (date: string, index: number, entry: TimeEntry) => void;
};

const TimeEntryForm = ({ reports, onSave }: TimeEntryFormProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const date = searchParams.get("date");
  const index = parseInt(searchParams.get("index") || "0", 10);

  const entry = date ? reports[date]?.[index] : null;

  const [formData, setFormData] = React.useState({
    start: "",
    end: "",
    project: "",
    activity: "",
    description: "",
  });

  useEffect(() => {
    setFormData({
      start: entry?.start || "",
      end: entry?.end || "",
      project: entry?.project || "",
      activity: entry?.activity || "",
      description: entry?.description || "",
    });
  }, [entry]);

  const [error, setError] = React.useState("");

  // Helper function to parse time string into minutes since midnight
  const parseTimeToMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Helper function to validate time format
  const isValidTimeFormat = (timeStr: string) => {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr);
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setError("");

    if (!date) {
      return;
    }

    // Basic validation
    if (!formData.start || !formData.end) {
      setError("Start and end times are required");
      return;
    }

    if (
      !isValidTimeFormat(formData.start) ||
      !isValidTimeFormat(formData.end)
    ) {
      setError("Invalid time format. Use HH:mm (24-hour format)");
      return;
    }

    const startMinutes = parseTimeToMinutes(formData.start);
    const endMinutes = parseTimeToMinutes(formData.end);

    // Calculate duration handling midnight crossing
    let duration = endMinutes - startMinutes;
    if (duration < 0) {
      duration += 24 * 60; // Add 24 hours worth of minutes
    }

    const updatedEntry = {
      start: formData.start,
      end: formData.end,
      duration,
      project: formData.project || null,
      activity: formData.activity || null,
      description: formData.description || null,
    };

    onSave(date, index, updatedEntry);
    navigate(-1);
  };

  if (!entry) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Time entry not found</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Time Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">Start Time</Label>
              <Input
                id="start"
                type="time"
                value={formData.start}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, start: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End Time</Label>
              <Input
                id="end"
                type="time"
                value={formData.end}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, end: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <Input
              id="project"
              value={formData.project}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, project: e.target.value }))
              }
              placeholder="Project name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity">Activity</Label>
            <Input
              id="activity"
              value={formData.activity}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, activity: e.target.value }))
              }
              placeholder="Activity type"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Add description"
              className="h-24"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TimeEntryForm;
