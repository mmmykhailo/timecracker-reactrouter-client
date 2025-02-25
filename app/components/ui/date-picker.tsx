import { CalendarIcon } from "lucide-react";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Calendar } from "./calendar";
import { cn } from "~/lib/utils";
import { format } from "date-fns";

type DatePickerProps = {
  selectedLabel?: string;
  selectedDate: Date;
  className?: string;
  setSelectedDate: (date: Date) => void;
};

export function DatePicker({
  selectedLabel,
  selectedDate,
  className,
  setSelectedDate,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "pl-3 text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className,
          )}
        >
          {!!selectedLabel || !selectedDate ? (
            <span>{selectedLabel || "Pick a date"}</span>
          ) : (
            format(selectedDate, "PP")
          )}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          autoFocus
          mode="single"
          defaultMonth={selectedDate || new Date()}
          selected={selectedDate}
          onSelect={(date) => setSelectedDate(date || new Date())}
          disabled={(date) =>
            date > new Date() || date < new Date("1900-01-01")
          }
        />
      </PopoverContent>
    </Popover>
  );
}
