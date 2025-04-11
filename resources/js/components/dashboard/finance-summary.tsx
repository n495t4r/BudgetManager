"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface FinanceSummaryProps {
  totalIncome: number
  totalExpenses: number
  remainingBalance: number
  currency: string
}

export function FinanceSummary({ totalIncome, totalExpenses, remainingBalance, currency }: FinanceSummaryProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const spendingPercentage = totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0

  const savingPercentage = totalIncome > 0 ? Math.round((remainingBalance / totalIncome) * 100) : 0

  return (
    <div className="grid grid-cols-1 gap-4 p-4">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-3 divide-x">
            {/* Income */}
            <div className="p-4 flex flex-col items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground mb-1">Income</span>
              <div className="flex items-center">
                <span className="text-sm font-bold text-emerald-600">
                  {currency}
                  {formatAmount(totalIncome)}
                </span>
              </div>
            </div>

            {/* Expenses */}
            <div className="p-4 flex flex-col items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground mb-1">Spent</span>
              <div className="flex items-center">
                <span className="text-sm font-bold text-rose-600">
                  {currency}
                  {formatAmount(totalExpenses)}
                </span>
                <span className="text-xs ml-1 text-rose-600">({spendingPercentage}%)</span>
              </div>
            </div>

            {/* Remaining */}
            <div className="p-4 flex flex-col items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground mb-1">Remaining</span>
              <div className="flex items-center">
                <span className={cn("text-sm font-bold", remainingBalance >= 0 ? "text-emerald-600" : "text-rose-600")}>
                  {currency}
                  {formatAmount(Math.abs(remainingBalance))}
                </span>
                <span className={cn("text-xs ml-1", remainingBalance >= 0 ? "text-emerald-600" : "text-rose-600")}>
                  ({savingPercentage}%)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
