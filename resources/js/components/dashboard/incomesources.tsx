"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

interface IncomeSource {
    id: number
    name: string
    amount: number
    month_year: string
    is_active: boolean
}

interface IncomeListProps {
  title?: string
  incomeSources: IncomeSource[]
  currency: string
  showAll?: boolean
  onEdit: (incomeSource: IncomeSource) => void
}

export function IncomeSources({ title = "Income Sources", incomeSources, currency, showAll = false, onEdit }: IncomeListProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [incomeSourceToDelete, setIncomeSourceToDelete] = useState<number | null>(null)
    console.log(incomeSources)
  const displayIncomeSources = showAll ? incomeSources || [] : (incomeSources || []).slice(0, 5)

  const confirmDelete = (id: number) => {
    setIncomeSourceToDelete(id)
    setIsAlertOpen(true)
  }

  const handleDelete = () => {
    if (!incomeSourceToDelete) return

    router.delete(route("income-sources.destroy", { income_source: incomeSourceToDelete }), {
      preserveScroll: true,
      onSuccess: () => {
        setIsAlertOpen(false)
        setIncomeSourceToDelete(null)
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

  if (incomeSources.length === 0) {
    return (
        <Card className="min-h-[200px] flex items-center justify-center">
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">No income source found for this period</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y max-h-[400px] overflow-y-auto">
          {displayIncomeSources.map((incomeSource) => (
            <div key={incomeSource.id} className="p-4 flex items-center">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{incomeSource.name}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">{formatDate(incomeSource.month_year)}</span>
                  <span className="font-semibold text-sm">
                    {currency}
                    {formatAmount(incomeSource.amount)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(incomeSource)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => confirmDelete(incomeSource.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {!showAll && incomeSources.length > 5 && (
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-center text-sm"
              onClick={() => router.visit(route("income-sources.index"))}
            >
              View all sources
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Income</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the income source record.
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
