import { addDays, format, isSameDay } from "date-fns";
import { Button } from "./ui/button";
import type { Dispatch, SetStateAction } from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "~/lib/utils";
import { Calendar } from "./ui/calendar";

type DateControlsProps = {
  selectedDate: Date | undefined;
  setSelectedDate: Dispatch<SetStateAction<Date | undefined>>;
};

export default function DateControls({
  selectedDate,
  setSelectedDate,
}: DateControlsProps) {
  return (
    <div className="flex justify-end gap-2">
      {!!selectedDate && !isSameDay(selectedDate, new Date()) && (
        <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
          Go to today
        </Button>
      )}
      <Button
        disabled={!selectedDate}
        variant="outline"
        size="icon"
        onClick={() => setSelectedDate((old) => old && addDays(old, -1))}
      >
        <ChevronLeft />
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[240px] pl-3 text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            {selectedDate ? (
              format(selectedDate, "PPP")
            ) : (
              <span>Pick a date</span>
            )}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="single"
            defaultMonth={selectedDate || new Date()}
            selected={selectedDate}
            onSelect={(date) => setSelectedDate(date)}
            disabled={(date) =>
              date > new Date() || date < new Date("1900-01-01")
            }
          />
        </PopoverContent>
      </Popover>
      <Button
        disabled={!selectedDate}
        variant="outline"
        size="icon"
        onClick={() => setSelectedDate((old) => old && addDays(old, 1))}
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
