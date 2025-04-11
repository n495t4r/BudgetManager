"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { addDays, format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calender"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DateRangePickerProps {
  date: DateRange
  setDate: (date: DateRange) => void
}

export function DateRangePicker({ date, setDate }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handlePresetChange = (preset: string) => {
    const today = new Date()

    switch (preset) {
      case "this-month": {
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        setDate({ from: firstDayOfMonth, to: today })
        break
      }
      case "last-month": {
        const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
        setDate({ from: firstDayOfLastMonth, to: lastDayOfLastMonth })
        break
      }
      case "this-quarter": {
        const quarter = Math.floor(today.getMonth() / 3)
        const firstDayOfQuarter = new Date(today.getFullYear(), quarter * 3, 1)
        setDate({ from: firstDayOfQuarter, to: today })
        break
      }
      case "this-year": {
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1)
        setDate({ from: firstDayOfYear, to: today })
        break
      }
      case "last-7-days": {
        const last7Days = addDays(today, -6)
        setDate({ from: last7Days, to: today })
        break
      }
      case "last-30-days": {
        const last30Days = addDays(today, -29)
        setDate({ from: last30Days, to: today })
        break
      }
    }
  }

  const formatDateRange = () => {
    if (!date?.from) {
      return "Select date range"
    }

    if (!date.to) {
      return format(date.from, "MMM d, yyyy")
    }

    return `${format(date.from, "MMM d")} - ${format(date.to, "MMM d, yyyy")}`
  }

  return (
    <div className="w-full">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button id="date" variant="outline" size="sm" className="w-full justify-start text-left font-normal h-8">
            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
            <span className="truncate">{formatDateRange()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b">
            <Select onValueChange={handlePresetChange} defaultValue="this-month">
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="this-quarter">This Quarter</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
                <SelectItem value="last-7-days">Last 7 days</SelectItem>
                <SelectItem value="last-30-days">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(newDate) => {
              setDate(newDate as DateRange)
              if (newDate?.to) {
                setIsOpen(false)
              }
            }}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
