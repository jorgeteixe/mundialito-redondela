"use client";

import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export type DateTimePickerProps = {
  value?: Date;
  onChange?: (value: Date | undefined) => void;
  /** When set, a hidden input submits the value as an ISO string for native forms. */
  name?: string;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-invalid"?: boolean;
};

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function toTimeValue(date?: Date) {
  if (!date) return "00:00";
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDisplay(date?: Date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function DateTimePicker({
  value,
  onChange,
  name,
  id,
  placeholder = "Selecciona fecha y hora",
  disabled,
  className,
  "aria-invalid": ariaInvalid,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const timeId = `${id ?? "datetime"}-time`;

  function handleDaySelect(day: Date | undefined) {
    if (!day) {
      onChange?.(undefined);
      return;
    }
    const next = new Date(day);
    // Preserve the time-of-day already chosen, defaulting to midnight.
    next.setHours(value?.getHours() ?? 0, value?.getMinutes() ?? 0, 0, 0);
    onChange?.(next);
  }

  function handleTimeChange(timeValue: string) {
    const [hoursPart, minutesPart] = timeValue.split(":");
    const hours = Number.parseInt(hoursPart ?? "", 10);
    const minutes = Number.parseInt(minutesPart ?? "", 10);
    const base = value ? new Date(value) : new Date();
    base.setHours(
      Number.isFinite(hours) ? hours : 0,
      Number.isFinite(minutes) ? minutes : 0,
      0,
      0,
    );
    onChange?.(base);
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {name ? (
        <input
          type="hidden"
          name={name}
          value={value ? value.toISOString() : ""}
        />
      ) : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={ariaInvalid}
            className={cn(
              "w-full justify-start font-normal",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="size-4" />
            {value ? formatDisplay(value) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDaySelect}
            weekStartsOn={1}
            autoFocus
          />
          <div className="flex items-center gap-2 border-t p-3">
            <Label htmlFor={timeId} className="text-sm">
              Hora
            </Label>
            <Input
              id={timeId}
              type="time"
              value={toTimeValue(value)}
              onChange={(event) => handleTimeChange(event.target.value)}
              className="w-auto"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
