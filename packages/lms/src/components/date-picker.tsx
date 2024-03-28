"use client";

import * as React from "react";
import { Button, ButtonProps } from "./button";
import { Calendar, CalendarProps } from "./calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface DatePickerProps
  extends Omit<ButtonProps, "children">,
    Pick<CalendarProps, "fromDate" | "toDate"> {
  date?: Date;
  disabledDays?: CalendarProps["disabled"];
  onDateChange?: (date: Date | undefined) => void;
}

export function DatePicker({
  className,
  date,
  disabledDays,
  fromDate,
  onDateChange,
  toDate,
  variant = "outline",
  ...props
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState(() => date || new Date());

  const onClose = () => {
    setOpen(false);
    setMonth(date || new Date());
  };

  return (
    <Popover
      onOpenChange={(toOpen) => {
        if (toOpen) {
          setOpen(true);
        } else {
          onClose();
        }
      }}
      open={open}
    >
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          variant={variant}
          {...props}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "eeee, PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          disabled={disabledDays}
          fromDate={fromDate}
          mode="single"
          month={month}
          onMonthChange={setMonth}
          onSelect={(val) => {
            if (onDateChange) {
              onDateChange(val);
            }
            onClose();
          }}
          selected={date}
          toDate={toDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
