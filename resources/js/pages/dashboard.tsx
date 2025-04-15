"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangePicker } from "@/components/date-range-picker"
import { Button } from "@/components/ui/button"
import { PlusCircle, Filter, DollarSign, CreditCard, PieChart } from "lucide-react"
import AppLayout from "@/layouts/app-layout"
import { router, usePage } from "@inertiajs/react"
import { format } from "date-fns"
import { FinanceSummary } from "@/components/dashboard/finance-summary"
import { ExpensesList } from "@/components/dashboard/expenses-list"
import { BudgetOverview } from "@/components/dashboard/budget-overview"
import { MonthlyChart } from "@/components/dashboard/monthly-chart"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { EmptyState } from "@/components/empty-state"
import ExpenseForm from "@/pages/expenses/expenseform"
import IncomeForm from "@/pages/income/incomeform"
import BucketForm from "@/pages/bucket/bucketform"

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

interface IncomeSource {
    id: number
    name: string
    amount: number
    is_active: boolean
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
    incomeSources?: IncomeSource[]
}

interface Props {
    rangeData?: DashboardData
    currency?: string
}

export default function DashboardPage({ rangeData, currency = "$" }: Props) {
    // Provide default values if dashboardData is undefined
    const safeData: DashboardData = rangeData || {
        totalIncome: 0,
        totalExpenses: 0,
        remainingBalance: 0,
        buckets: [],
        recentExpenses: [],
        expenses: [],
        monthlyData: [],
        incomeSources: [],
    }

    // Initialize date range from URL parameters or default to current month
    const searchParams = new URLSearchParams(window.location.search)
    const fromParam = searchParams.get("from")
    const toParam = searchParams.get("to")

    const { props } = usePage();
    console.log(props);

    console.log(rangeData);
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

    const [activeTab, setActiveTab] = useState("overview")
    const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false)
    const [isIncomeFormOpen, setIsIncomeFormOpen] = useState(false)
    const [isBucketFormOpen, setIsBucketFormOpen] = useState(false)
    const [currentExpense, setCurrentExpense] = useState<ExpenseRecord | undefined>(undefined)
    const [currentIncomeSource, setCurrentIncomeSource] = useState<IncomeSource | undefined>(undefined)
    const [currentBucket, setCurrentBucket] = useState<BucketSummary | undefined>(undefined)
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
                    only: ["rangeData"],
                },
            )

            setIsDateRangeApplied(false)
        }
    }, [dateRange, isDateRangeApplied])

    // Handle tab change
    const handleTabChange = (value: string) => {
        setActiveTab(value)
    }

    // Open the appropriate form based on the active tab
    const handleAddButtonClick = () => {
        switch (activeTab) {
            case "overview":
                setCurrentIncomeSource(undefined)
                setIsIncomeFormOpen(true)
                break
            case "buckets":
                setCurrentBucket(undefined)
                setIsBucketFormOpen(true)
                break
            case "expenses":
                setCurrentExpense(undefined)
                setIsExpenseFormOpen(true)
                break
            default:
                setCurrentExpense(undefined)
                setIsExpenseFormOpen(true)
        }
    }

    const getAddButtonText = () => {
        switch (activeTab) {
            case "overview":
                return "Add Income"
            case "buckets":
                return "Add Bucket"
            case "expenses":
                return "Add Expense"
            default:
                return "Add"
        }
    }

    const getAddButtonIcon = () => {
        switch (activeTab) {
            case "overview":
                return <DollarSign className="h-3.5 w-3.5" />
            case "buckets":
                return <PieChart className="h-3.5 w-3.5" />
            case "expenses":
                return <CreditCard className="h-3.5 w-3.5" />
            default:
                return <PlusCircle className="h-3.5 w-3.5" />
        }
    }



    const handleFormSuccess = () => {
        // Refresh data after form submission
        router.reload({
            only: ["rangeData"],
            // preserveState: true,
            preserveScroll: true,
        })
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

    // Check if data is empty
    const isDataEmpty = safeData.buckets.length === 0 && safeData.expenses.length === 0 && safeData.totalIncome === 0

    return (
        <AppLayout>
            <div className="flex flex-col pb-20 md:pb-0">
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

                            <Button size="sm" className="h-8 gap-1" onClick={handleAddButtonClick}>
                                {getAddButtonIcon()}
                                <span className="hidden sm:inline">{getAddButtonText()}</span>
                            </Button>
                        </div>
                    </div>
                    <div className="px-4 pb-2 text-sm text-muted-foreground">{formatDateRange()}</div>
                </div>
                {isDataEmpty ? (
                    <EmptyState
                        title="No budget data yet"
                        description="Start by adding income sources, budget buckets, or expenses to see your financial overview."
                        icon={<DollarSign className="h-10 w-10 text-muted-foreground" />}
                        actions={
                            <>
                                <Button onClick={() => setIsIncomeFormOpen(true)} className="mr-2">
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    Add Income
                                </Button>
                                <Button variant="outline" onClick={() => setIsBucketFormOpen(true)} className="mr-2">
                                    <PieChart className="mr-2 h-4 w-4" />
                                    Create Budget
                                </Button>
                            </>
                        }
                    />
                ) : (
                    <>
                        {/* Finance Summary Cards */}
                        <FinanceSummary

                            totalIncome={safeData.totalIncome}
                            totalExpenses={safeData.totalExpenses}
                            remainingBalance={safeData.remainingBalance}
                            currency={currency}
                        />

                        {/* Tabs for different views */}
                        <div className="mt-4">
                            <Tabs defaultValue="overview" className="w-full" onValueChange={handleTabChange}>
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="buckets">Buckets</TabsTrigger>
                                    <TabsTrigger value="expenses">Expenses</TabsTrigger>
                                </TabsList>

                                {/* Fixed height container for all tab content */}
                                <div className="mt-4 relative">
                                    <div className="tab-content-wrapper">
                                        <TabsContent value="overview" className="m-0 absolute inset-0">
                                            <div className="h-full overflow-auto pb-4">
                                                {safeData.monthlyData.length > 0 ? (
                                                    <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
                                                        <div className="lg:col-span-2">

                                                            <MonthlyChart data={safeData.monthlyData} currency={currency} />
                                                        </div>
                                                        <div className="lg:col-span-2">

                                                            <ExpensesList
                                                                title="Recent Expenses"
                                                                expenses={safeData.recentExpenses}
                                                                currency={currency}
                                                                onEdit={(expense) => {
                                                                    setCurrentExpense(expense)
                                                                    setIsExpenseFormOpen(true)
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <EmptyState
                                                        title="No data for this period"
                                                        description="Try selecting a different date range or add some transactions."
                                                        icon={<Filter className="h-10 w-10 text-muted-foreground" />}
                                                    />
                                                )}
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="buckets" className="m-0 absolute inset-0">
                                            <div className="h-full overflow-auto pb-4">
                                                {safeData.buckets.length > 0 ? (
                                                    <div className="lg:grid lg:grid-cols-2 lg:gap-6">
                                                        <BudgetOverview
                                                            buckets={safeData.buckets}
                                                            currency={currency}
                                                        />
                                                    </div>
                                                ) : (
                                                    <EmptyState
                                                        title="No budget buckets"
                                                        description="Create budget buckets to track your spending by category."
                                                        icon={<PieChart className="h-10 w-10 text-muted-foreground" />}
                                                        actions={
                                                            <Button onClick={() => setIsBucketFormOpen(true)}>
                                                                <PlusCircle className="mr-2 h-4 w-4" />
                                                                Create Budget Bucket
                                                            </Button>
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="expenses" className="m-0 absolute inset-0">
                                            <div className="h-full overflow-auto pb-4">
                                                {safeData.expenses.length > 0 ? (
                                                    <ExpensesList
                                                        title="All Expenses"
                                                        expenses={safeData.expenses}
                                                        currency={currency}
                                                        showAll
                                                        onEdit={(expense) => {
                                                            setCurrentExpense(expense)
                                                            setIsExpenseFormOpen(true)
                                                        }}
                                                    />
                                                ) : (
                                                    <EmptyState
                                                        title="No expenses"
                                                        description="Add expenses to track your spending."
                                                        icon={<CreditCard className="h-10 w-10 text-muted-foreground" />}
                                                        actions={
                                                            <Button
                                                                onClick={() => {
                                                                    setCurrentExpense(undefined)
                                                                    setIsExpenseFormOpen(true)
                                                                }}
                                                            >
                                                                <PlusCircle className="mr-2 h-4 w-4" />
                                                                Add Expense
                                                            </Button>
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </TabsContent>
                                    </div>
                                </div>
                            </Tabs>
                        </div>
                    </>
                )}
                {/* Form Modal */}
                <ExpenseForm
                    open={isExpenseFormOpen}
                    onOpenChange={setIsExpenseFormOpen}
                    expense={currentExpense as any}
                    buckets={safeData.buckets as any}
                    currency={currency}
                    onSuccess={handleFormSuccess}
                />
                <IncomeForm
                    open={isIncomeFormOpen}
                    onOpenChange={setIsIncomeFormOpen}
                    incomeSource={currentIncomeSource}
                    currency={currency}
                    onSuccess={handleFormSuccess}
                />

                <BucketForm
                    open={isBucketFormOpen}
                    onOpenChange={setIsBucketFormOpen}
                    bucket={currentBucket as any}
                    onSuccess={handleFormSuccess}
                />
            </div>
        </AppLayout>
    )
}
