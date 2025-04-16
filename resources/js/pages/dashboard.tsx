"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PlusCircle, DollarSign, CreditCard, PieChart } from "lucide-react"
import AppLayout from "@/layouts/app-layout"
import { router, usePage } from "@inertiajs/react"
import { format, startOfMonth } from "date-fns"
import { FinanceSummary } from "@/components/dashboard/finance-summary"
import { ExpensesList } from "@/components/dashboard/expenses-list"
import { IncomeSources } from "@/components/dashboard/incomesources"
import { BudgetOverview } from "@/components/dashboard/budget-overview"
import { MonthlyChart } from "@/components/dashboard/monthly-chart"
import { EmptyState } from "@/components/empty-state"
import ExpenseForm from "@/pages/expenses/expenseform"
import IncomeForm from "@/pages/income/incomeform"
import BucketForm from "@/pages/bucket/bucketform"
import { DateRangeFilter } from "@/components/date-range-filter"

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
    month_year: string
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
    incomeSources: IncomeSource[]
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
    // console.log(props);

    console.log(rangeData);

    const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(() => {
        // Default to current month
        const defaultFrom = startOfMonth(new Date())
        const defaultTo = new Date()

        // Try to parse from URL params if available
        let fromDate = defaultFrom
        let toDate = defaultTo

        if (fromParam) {
            try {
                const parsedDate = new Date(fromParam)
                if (!isNaN(parsedDate.getTime())) {
                    fromDate = parsedDate
                }
            } catch (e) {
                console.error("Invalid from date:", fromParam)
            }

        }

        if (toParam) {
            try {
                const parsedDate = new Date(toParam)
                if (!isNaN(parsedDate.getTime())) {
                    toDate = parsedDate
                }
            } catch (e) {
                console.error("Invalid to date:", toParam)
            }
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

    // Handle applying the date filter
    const handleApplyFilter = (newDateRange: { from: Date; to: Date }) => {
        // Update local state
        setDateRange(newDateRange)

        const from = format(newDateRange.from, "yyyy-MM-dd")
        const to = format(newDateRange.to, "yyyy-MM-dd")

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
    }

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

    // Check if data is empty
    const isDataEmpty = safeData.buckets.length === 0 && safeData.expenses.length === 0 && safeData.totalIncome === 0 && safeData.incomeSources.length === 0

    return (
        <AppLayout>
            <div className="flex flex-col pb-20 md:pb-0">
                {/* Header with date range and add expense button */}
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                    <div className="flex items-center justify-between p-4">
                        <h1 className="text-xl font-semibold tracking-tight">Budget Dashboard</h1>
                        <div className="flex items-center space-x-2">
                            {/* New DateRangeFilter component */}
                            <DateRangeFilter
                                dateRange={dateRange}
                                onApplyFilter={handleApplyFilter}
                                buttonVariant="outline"
                                buttonSize="sm"
                                buttonClassName="h-8"
                                triggerLabel="Filter"
                            />

                            <Button size="sm" className="h-8 gap-1" onClick={handleAddButtonClick}>
                                {getAddButtonIcon()}
                                <span className="hidden sm:inline">{getAddButtonText()}</span>
                            </Button>
                        </div>
                    </div>

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

                                                            <IncomeSources
                                                                title="Income Sources"
                                                                incomeSources={safeData.incomeSources}
                                                                currency={currency}
                                                                onEdit={(incomeSource) => {
                                                                    setCurrentIncomeSource(incomeSource)
                                                                    setIsIncomeFormOpen(true)
                                                                }}
                                                            />
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
                                                        <div className="lg:col-span-2">

                                                            <MonthlyChart data={safeData.monthlyData} currency={currency} />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <EmptyState
                                                        title="No data for this period"
                                                        description="Try selecting a different date range or add some transactions."
                                                        icon={<PieChart className="h-10 w-10 text-muted-foreground" />}                                                    />
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
