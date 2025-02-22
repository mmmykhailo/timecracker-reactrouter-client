import { ChevronLeft } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";
import type { ComponentProps } from "react";

export type CalendarProps = ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("flex flex-col p-3", className)}
      classNames={{
        months: "flex flex-col relative",
        month: "space-y-4",
        month_caption: "flex justify-center items-center h-[28px] -mt-[28px]",
        caption_label: "text-sm font-medium",
        nav: "flex items-center justify-between relative",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 rounded-md",
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal",
        ),
        range_start: "range_start",
        range_end: "range_end",
        selected:
          "bg-primary text-primary-foreground [&>button:hover]:bg-inherit [&>button:hover]:text-inherit",
        today: "bg-accent text-accent-foreground",
        outside:
          "outside text-muted-foreground aria-selected:bg-primary/50 aria-selected:text-primary-foreground",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ className, ...props }) => (
          <ChevronLeft
            className={cn(
              "h-4 w-4",
              className,
              props.orientation === "left" ? "" : "rotate-180",
            )}
            {...props}
          />
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
