"use client"

import { useState, useEffect } from "react"
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface DateRange {
  from: Date
  to: Date
}

interface DateRangeFilterProps {
  dateRange: DateRange
  onApplyFilter: (range: DateRange) => void
  buttonVariant?: "outline" | "default" | "ghost"
  buttonSize?: "default" | "sm" | "lg"
  buttonClassName?: string
  triggerLabel?: string
}

export function DateRangeFilter({
  dateRange,
  onApplyFilter,
  buttonVariant = "outline",
  buttonSize = "sm",
  buttonClassName,
  triggerLabel = "Filter",
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempRange, setTempRange] = useState<DateRange>(dateRange)
  const [currentView, setCurrentView] = useState<Date>(
    dateRange.from ? new Date(dateRange.from) : startOfMonth(new Date()),
  )

  // Reset temp range when dateRange prop changes
  useEffect(() => {
    setTempRange(dateRange)
  }, [dateRange])

  // Reset temp range when sheet opens
  useEffect(() => {
    if (isOpen) {
      setTempRange(dateRange)
      setCurrentView(dateRange.from ? new Date(dateRange.from) : startOfMonth(new Date()))
    }
  }, [isOpen, dateRange])

  // Format date range for display
  const formatDateRange = () => {
    if (!dateRange.from || !dateRange.to) return "Select date range"

    try {
      return `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d, yyyy")}`
    } catch (e) {
      return "Invalid date range"
    }
  }

  // Handle preset selection
  const handlePresetChange = (preset: string) => {
    const today = new Date()
    const currentMonth = startOfMonth(today)
    let newRange: DateRange

    switch (preset) {
      case "this-month": {
        newRange = {
          from: currentMonth,
          to: today,
        }
        break
      }
      case "last-month": {
        const lastMonth = subMonths(currentMonth, 1)
        newRange = {
          from: lastMonth,
          to: endOfMonth(lastMonth),
        }
        break
      }
      case "last-3-months": {
        newRange = {
          from: subMonths(currentMonth, 2),
          to: today,
        }
        break
      }
      case "last-6-months": {
        newRange = {
          from: subMonths(currentMonth, 5),
          to: today,
        }
        break
      }
      case "this-year": {
        newRange = {
          from: new Date(today.getFullYear(), 0, 1),
          to: today,
        }
        break
      }
      case "last-year": {
        newRange = {
          from: new Date(today.getFullYear() - 1, 0, 1),
          to: new Date(today.getFullYear() - 1, 11, 31),
        }
        break
      }
      default:
        return
    }

    setTempRange(newRange)
    setCurrentView(newRange.from)
  }

  // Navigate to previous/next month
  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentView(direction === "next" ? addMonths(currentView, 1) : subMonths(currentView, 1))
  }

  // Select a month
  const selectMonth = (date: Date) => {
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(date)

    setTempRange({
      from: monthStart,
      to: monthEnd,
    })
  }

  // Apply the filter
  const applyFilter = () => {
    if (tempRange.from && tempRange.to) {
      onApplyFilter(tempRange)
      setIsOpen(false)
    }
  }

  // Generate months for the current view year
  const generateMonths = () => {
    const months = []
    const year = currentView.getFullYear()

    for (let month = 0; month < 12; month++) {
      const date = new Date(year, month, 1)
      months.push({
        date,
        name: format(date, "MMM"),
        isSelected: isMonthSelected(date),
      })
    }

    return months
  }

  // Check if a month is selected
  const isMonthSelected = (date: Date) => {
    if (!tempRange.from || !tempRange.to) return false

    const year = date.getFullYear()
    const month = date.getMonth()

    const fromYear = tempRange.from.getFullYear()
    const fromMonth = tempRange.from.getMonth()

    const toYear = tempRange.to.getFullYear()
    const toMonth = tempRange.to.getMonth()

    // Check if the date's year/month falls within the selected range
    if (year < fromYear || (year === fromYear && month < fromMonth)) return false
    if (year > toYear || (year === toYear && month > toMonth)) return false

    return true
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className={cn("gap-1", buttonClassName)}>
          <CalendarIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{triggerLabel}</span>
          <span className="text-xs text-muted-foreground ml-1">{formatDateRange()}</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="top"
        className="w-full p-0 max-h-[80vh] overflow-auto"
        aria-labelledby="date-filter-title"
        aria-describedby="date-filter-description"
      >
        <div className="container mx-auto max-w-lg py-6 px-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 id="date-filter-title" className="text-lg font-medium">
                Date Range Filter
              </h3>
              <Button size="sm" variant="ghost" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </div>

            <p id="date-filter-description" className="text-sm text-muted-foreground">
              Select a date range to filter your budget data
            </p>

            {/* Presets */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Preset Ranges</label>
              <Select onValueChange={handlePresetChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a preset range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                  <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                  <SelectItem value="last-year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Month/Year Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Select Month</label>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentView(new Date(currentView.getFullYear() - 1, 0, 1))}
                  >
                    <span className="sr-only">Previous Year</span>
                    <ChevronLeft className="h-4 w-4" />
                    <ChevronLeft className="h-4 w-4 -ml-2" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
                    <span className="sr-only">Previous Month</span>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium px-2">{format(currentView, "MMMM yyyy")}</span>
                  <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
                    <span className="sr-only">Next Month</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentView(new Date(currentView.getFullYear() + 1, 0, 1))}
                  >
                    <span className="sr-only">Next Year</span>
                    <ChevronRight className="h-4 w-4" />
                    <ChevronRight className="h-4 w-4 -ml-2" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {generateMonths().map((month) => (
                  <Button
                    key={month.name}
                    variant={month.isSelected ? "default" : "outline"}
                    size="sm"
                    className="h-9"
                    onClick={() => selectMonth(month.date)}
                  >
                    {month.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Selected Range Display */}
            <div className="bg-muted/30 p-3 rounded-md">
              <p className="text-sm">
                <span className="font-medium">Selected Range: </span>
                {tempRange.from && tempRange.to ? (
                  <>
                    {format(tempRange.from, "MMMM d, yyyy")} - {format(tempRange.to, "MMMM d, yyyy")}
                  </>
                ) : (
                  "No date range selected"
                )}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTempRange(dateRange)
                  setIsOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={applyFilter} disabled={!tempRange.from || !tempRange.to}>
                Apply Filter
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
