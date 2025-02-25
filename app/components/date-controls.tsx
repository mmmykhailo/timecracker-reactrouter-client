import { addDays, isSameDay } from "date-fns";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DatePicker } from "./ui/date-picker";

type DateControlsProps = {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
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
        onClick={() => setSelectedDate(addDays(selectedDate, -1))}
      >
        <ChevronLeft />
      </Button>
      <DatePicker
        className="w-[180px]"
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
      <Button
        disabled={!selectedDate}
        variant="outline"
        size="icon"
        onClick={() => setSelectedDate(addDays(selectedDate, 1))}
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
