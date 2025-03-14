import { useState } from "react";
import type { Report } from "~/lib/http.server/codegen";
import EntryForm from "../entry-form/entry-form";
import { Button } from "../ui/button";
import { EntriesList } from "./entries-list";

type EntriesSectionProps = {
  report?: Pick<Report, "date" | "entries">;
};

export function EntriesSection({ report }: EntriesSectionProps) {
  const [entryIndexToEdit, setEntryIndexToEdit] = useState<number | null>(null);

  const handleAddNewEntryClick = () => {
    setEntryIndexToEdit(report?.entries.length || 0);
  };

  if (!report) {
    return null;
  }

  return (
    <>
      <div className="grid gap-2">
        <EntriesList entries={report?.entries} />

        <div className="grid gap-2">
          <Button
            //  disabled={selectedReport.hasNegativeDuration}
            onClick={handleAddNewEntryClick}
          >
            Add new entry
          </Button>
          <div className="text-center text-muted-foreground text-sm">
            or press Shift + Space
          </div>
        </div>
      </div>
      <EntryForm
        report={report}
        entryIndex={entryIndexToEdit}
        recentProjects={[]}
        onClose={() => setEntryIndexToEdit(null)}
      />
    </>
  );
}
