"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangePicker } from "@/components/date-range-picker"
import { Button } from "@/components/ui/button"
import { PlusCircle, Filter } from "lucide-react"
import AppLayout from "@/layouts/app-layout"
import { router } from "@inertiajs/react"
import { format } from "date-fns"
import { FinanceSummary } from "@/components/dashboard/finance-summary"
import { ExpensesList } from "@/components/dashboard/expenses-list"
import { BudgetOverview } from "@/components/dashboard/budget-overview"
import { MonthlyChart } from "@/components/dashboard/monthly-chart"
import ExpenseForm from "@/pages/expenses/expenseform"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

// Define interfaces based on the provided structure
interface LineItemSummary {
  id: number
  title: string
  percentage: number
  amount: number
  spent: number
  remaining: number
}

interface BucketSummary {
  id: number
  title: string
  percentage: number
  amount: number
  spent: number
  remaining: number
  lineItems: LineItemSummary[]
}

interface ExpenseRecord {
  id: number
  date: string
  description: string
  amount: number
  bucket: string
  lineItem: string
  bucket_id?: number
  line_item_id?: number
}

interface MonthlyDataPoint {
  name: string
  income: number
  expenses: number
}

interface DashboardData {
  totalIncome: number
  totalExpenses: number
  remainingBalance: number
  buckets: BucketSummary[]
  recentExpenses: ExpenseRecord[]
  expenses: ExpenseRecord[]
  monthlyData: MonthlyDataPoint[]
}

interface Props {
  dashboardData: DashboardData
  currency: string
}

export default function DashboardPage({ dashboardData, currency = "$" }: Props) {
  // Initialize date range from URL parameters or default to current month
  const searchParams = new URLSearchParams(window.location.search)
  const fromParam = searchParams.get("from")
  const toParam = searchParams.get("to")

  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(() => {
    let fromDate: Date
    try {
      fromDate = fromParam ? new Date(fromParam) : new Date(new Date().setDate(1))
      if (isNaN(fromDate.getTime())) {
        fromDate = new Date(new Date().setDate(1))
      }
    } catch (e) {
      fromDate = new Date(new Date().setDate(1))
    }

    let toDate: Date
    try {
      toDate = toParam ? new Date(toParam) : new Date()
      if (isNaN(toDate.getTime())) {
        toDate = new Date()
      }
    } catch (e) {
      toDate = new Date()
    }

    return { from: fromDate, to: toDate }
  })

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentExpense, setCurrentExpense] = useState<ExpenseRecord | undefined>(undefined)
  const [isDateRangeApplied, setIsDateRangeApplied] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Handle date range change
  const handleDateRangeChange = (newDateRange: { from: Date; to: Date }) => {
    setDateRange(newDateRange)
    setIsDateRangeApplied(true)
    setIsFilterOpen(false)
  }

  // Apply date filter when date range changes
  useEffect(() => {
    if (isDateRangeApplied) {
      // Validate dates before formatting
      const fromDate =
        dateRange.from && !isNaN(dateRange.from.getTime()) ? dateRange.from : new Date(new Date().setDate(1))

      const toDate = dateRange.to && !isNaN(dateRange.to.getTime()) ? dateRange.to : new Date()

      // Format dates for the API request
      const from = format(fromDate, "yyyy-MM-dd")
      const to = format(toDate, "yyyy-MM-dd")

      // Make request to server with new date range
      router.get(
        "",
        { from, to },
        {
          preserveState: true,
          preserveScroll: true,
          only: ["dashboardData"],
        },
      )

      setIsDateRangeApplied(false)
    }
  }, [dateRange, isDateRangeApplied])

  const openCreateForm = () => {
    setCurrentExpense(undefined)
    setIsFormOpen(true)
  }

  const handleFormSuccess = () => {
    // Refresh data after form submission
  }

  // Format date range for display
  const formatDateRange = () => {
    if (!dateRange.from || !dateRange.to) return ""

    try {
      return `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d, yyyy")}`
    } catch (e) {
      return "Invalid date range"
    }
  }

  return (
    <AppLayout>
      <div className="flex flex-col pb-20">
        {/* Header with date range and add expense button */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-semibold tracking-tight">Budget Dashboard</h1>
            <div className="flex items-center space-x-2">
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Filter className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Filter</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="top" className="w-full sm:max-w-lg mx-auto">
                  <div className="py-6">
                    <h3 className="text-lg font-medium mb-4">Select Date Range</h3>
                    <DateRangePicker date={dateRange} setDate={handleDateRangeChange} />
                  </div>
                </SheetContent>
              </Sheet>

              <Button size="sm" className="h-8 gap-1" onClick={openCreateForm}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Add Expense</span>
              </Button>
            </div>
          </div>
          <div className="px-4 pb-2 text-sm text-muted-foreground">{formatDateRange()}</div>
        </div>

        {/* Finance Summary Cards */}
        <FinanceSummary
          totalIncome={dashboardData.totalIncome}
          totalExpenses={dashboardData.totalExpenses}
          remainingBalance={dashboardData.remainingBalance}
          currency={currency}
        />

        {/* Tabs for different views */}
        <div className="px-4 mt-4">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="buckets">Buckets</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <MonthlyChart data={dashboardData.monthlyData} currency={currency} />
              <ExpensesList
                title="Recent Expenses"
                expenses={dashboardData.recentExpenses}
                currency={currency}
                onEdit={(expense) => {
                  setCurrentExpense(expense)
                  setIsFormOpen(true)
                }}
              />
            </TabsContent>

            <TabsContent value="buckets" className="mt-4">
              <BudgetOverview buckets={dashboardData.buckets} currency={currency} />
            </TabsContent>

            <TabsContent value="expenses" className="mt-4">
              <ExpensesList
                title="All Expenses"
                expenses={dashboardData.expenses}
                currency={currency}
                showAll
                onEdit={(expense) => {
                  setCurrentExpense(expense)
                  setIsFormOpen(true)
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Expense Form Modal */}
        <ExpenseForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          expense={currentExpense as any}
          buckets={dashboardData.buckets as any}
          currency={currency}
          onSuccess={handleFormSuccess}
        />
      </div>
    </AppLayout>
  )
}
