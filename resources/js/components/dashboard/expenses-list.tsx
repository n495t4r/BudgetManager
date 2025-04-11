"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, ChevronRight } from "lucide-react"
import { format, parseISO } from "date-fns"
import { router } from "@inertiajs/react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ExpenseRecord {
  id: number
  date: string
  description: string
  amount: number
  bucket: string
  lineItem: string
}

interface ExpensesListProps {
  title?: string
  expenses: ExpenseRecord[]
  currency: string
  showAll?: boolean
  onEdit: (expense: ExpenseRecord) => void
}

export function ExpensesList({ title = "Expenses", expenses, currency, showAll = false, onEdit }: ExpensesListProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null)

  const displayExpenses = showAll ? expenses : expenses.slice(0, 5)

  const confirmDelete = (id: number) => {
    setExpenseToDelete(id)
    setIsAlertOpen(true)
  }

  const handleDelete = () => {
    if (!expenseToDelete) return

    router.delete(route("expenses.destroy", { expense: expenseToDelete }), {
      preserveScroll: true,
      onSuccess: () => {
        setIsAlertOpen(false)
        setExpenseToDelete(null)
      },
      onError: (errors) => {
        console.error(errors)
      },
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM d, yyyy")
    } catch (e) {
      return dateString
    }
  }

  // Generate a consistent color based on bucket name
  const getBadgeVariant = (bucket: string) => {
    const bucketHash = bucket.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const variants = ["default", "secondary", "outline", "destructive"]
    return variants[bucketHash % variants.length]
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">No expenses found for this period</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {displayExpenses.map((expense) => (
            <div key={expense.id} className="p-4 flex items-center">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{expense.lineItem}</span>
                  <Badge variant={getBadgeVariant(expense.bucket)} className="text-xs">
                    {expense.bucket}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground truncate mt-1">{expense.description}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">{formatDate(expense.date)}</span>
                  <span className="font-semibold text-sm">
                    {currency}
                    {formatAmount(expense.amount)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(expense)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => confirmDelete(expense.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {!showAll && expenses.length > 5 && (
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-center text-sm"
              onClick={() => router.visit(route("expenses.index"))}
            >
              View all expenses
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the expense record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
