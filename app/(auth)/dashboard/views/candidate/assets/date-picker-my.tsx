import React, { useState, useEffect } from "react";
import { format, parse, setYear, setMonth, isValid } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MonthYearPickerProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  allowPresent?: boolean;
}

const months = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const isPresent = (value: string | undefined): boolean =>
  value?.toLowerCase() === "present";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);

export function MonthYearPicker({
  value,
  onChange,
  allowPresent = false,
}: MonthYearPickerProps) {
  const [date, setDate] = useState<Date | null>(null);
  const [isPresentSelected, setIsPresentSelected] = useState(isPresent(value));
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isPresent(value)) {
      setIsPresentSelected(true);
      setDate(null);
    } else if (value) {
      const parsedDate = parse(value, "yyyy-MM", new Date());
      if (isValid(parsedDate)) {
        setDate(parsedDate);
        setIsPresentSelected(false);
      } else {
        console.error("Invalid date format:", value);
        setDate(null);
      }
    } else {
      setDate(null);
      setIsPresentSelected(false);
    }
  }, [value]);

  const handleYearChange = (year: string) => {
    if (year === "Present") {
      setIsPresentSelected(true);
      setDate(null);
      onChange("Present");
    } else {
      const newDate = date
        ? setYear(date, parseInt(year))
        : new Date(parseInt(year), 0);
      setDate(newDate);
      setIsPresentSelected(false);
      onChange(format(newDate, "yyyy-MM"));
    }
  };

  const handleMonthChange = (month: string) => {
    const newDate = date
      ? setMonth(date, months.indexOf(month))
      : new Date(new Date().getFullYear(), months.indexOf(month));
    setDate(newDate);
    setIsPresentSelected(false);
    onChange(format(newDate, "yyyy-MM"));
  };

  const handleClear = () => {
    setDate(null);
    setIsPresentSelected(false);
    onChange(undefined);
    setIsOpen(false);
  };

  const handlePresentSelect = () => {
    setIsPresentSelected(true);
    setDate(null);
    onChange("Present");
    setIsOpen(false);
  };

  const displayValue = isPresentSelected
    ? "Present"
    : date && isValid(date)
    ? format(date, "MMMM yyyy")
    : "Pick a date";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={`w-full justify-start text-left font-normal ${
            !value && "text-muted-foreground"
          }`}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[200px] max-w-[250px] p-4" align="start">
        <div className="flex flex-col space-y-4">
          <Select
            value={isPresentSelected ? "Present" : (date ? date.getFullYear().toString() : "")}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Year">
                {isPresentSelected ? "Present" : (date ? date.getFullYear() : "Year")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={date ? months[date.getMonth()] : ""}
            onValueChange={handleMonthChange}
            disabled={isPresentSelected}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Month">
                {date ? months[date.getMonth()] : "Month"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {allowPresent && (
            <Button
              variant="outline"
              onClick={handlePresentSelect}
              className="w-full"
            >
              Present
            </Button>
          )}
          <Button variant="outline" onClick={handleClear} className="w-full">
            <X className="mr-2 h-4 w-4" /> Clear
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}