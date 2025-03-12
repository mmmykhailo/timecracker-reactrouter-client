import { addDays, format, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link, href, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { DatePicker } from "./ui/date-picker";

type DateControlsProps = {
  selectedDate: Date;
};

export default function DateControls({ selectedDate }: DateControlsProps) {
  const navigate = useNavigate();

  return (
    <div className="flex justify-end gap-2">
      {!!selectedDate && !isSameDay(selectedDate, new Date()) && (
        <Button asChild variant="outline">
          <Link
            prefetch="render"
            to={href("/o/:date", { date: format(new Date(), "yyyyMMdd") })}
          >
            Go to today
          </Link>
        </Button>
      )}
      <Button asChild disabled={!selectedDate} variant="outline" size="icon">
        <Link
          prefetch="render"
          to={href("/o/:date", {
            date: format(addDays(selectedDate, -1), "yyyyMMdd"),
          })}
        >
          <ChevronLeft />
        </Link>
      </Button>
      <DatePicker
        className="w-[180px]"
        selectedDate={selectedDate}
        setSelectedDate={(date) =>
          navigate(href("/o/:date", { date: format(date, "yyyyMMdd") }))
        }
      />
      <Button asChild disabled={!selectedDate} variant="outline" size="icon">
        <Link
          prefetch="render"
          to={href("/o/:date", {
            date: format(addDays(selectedDate, 1), "yyyyMMdd"),
          })}
        >
          <ChevronRight />
        </Link>
      </Button>
    </div>
  );
}
