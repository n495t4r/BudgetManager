"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

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

interface BudgetOverviewProps {
  buckets: BucketSummary[]
  currency: string
}

export function BudgetOverview({ buckets, currency }: BudgetOverviewProps) {
  const [expandedBuckets, setExpandedBuckets] = useState<Record<number, boolean>>({})

  const toggleBucket = (bucketId: number) => {
    setExpandedBuckets((prev) => ({
      ...prev,
      [bucketId]: !prev[bucketId],
    }))
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const calculatePercentSpent = (spent: number, amount: number) => {
    if (amount === 0) return 0
    return Math.min(100, Math.round((spent / amount) * 100))
  }

  const getProgressColor = (percentSpent: number) => {
    if (percentSpent > 90) return "bg-rose-500"
    if (percentSpent > 75) return "bg-amber-500"
    return "bg-emerald-500"
  }

  return (
    <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
      {buckets.map((bucket) => {
        const isExpanded = expandedBuckets[bucket.id] || false
        const percentSpent = calculatePercentSpent(bucket.spent, bucket.amount)

        return (
          <Card key={bucket.id} className="overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleBucket(bucket.id)}>
                <CardTitle className="text-base flex items-center">
                  {bucket.title}
                  <span className="text-xs font-normal text-muted-foreground ml-2">{bucket.percentage}%</span>
                </CardTitle>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              <div className="flex justify-between items-center text-sm mt-2">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Budget</span>
                  <span className="font-medium">
                    {currency}
                    {formatAmount(bucket.amount)}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-muted-foreground">Spent</span>
                  <span className="font-medium">
                    {currency}
                    {formatAmount(bucket.spent)}
                  </span>
                </div>
              </div>

              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>{percentSpent}% spent</span>
                  <span className={cn(bucket.remaining >= 0 ? "text-emerald-600" : "text-rose-600")}>
                    {bucket.remaining >= 0 ? "Remaining: " : "Overspent: "}
                    {currency}
                    {formatAmount(Math.abs(bucket.remaining))}
                  </span>
                </div>
                <Progress value={percentSpent} className="h-2" indicatorClassName={getProgressColor(percentSpent)} />
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="p-0">
                <div className="divide-y bg-muted/30">
                  {bucket.lineItems.map((item) => {
                    const itemPercentSpent = calculatePercentSpent(item.spent, item.amount)

                    return (
                      <div key={item.id} className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-sm">{item.title}</div>
                          <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                        </div>

                        <div className="flex justify-between items-center text-xs mt-1">
                          <span>
                            {currency}
                            {formatAmount(item.amount)}
                          </span>
                          <span>
                            Spent: {currency}
                            {formatAmount(item.spent)}
                          </span>
                        </div>

                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{itemPercentSpent}% spent</span>
                            <span className={cn(item.remaining >= 0 ? "text-emerald-600" : "text-rose-600")}>
                              {item.remaining >= 0 ? "Left: " : "Over: "}
                              {currency}
                              {formatAmount(Math.abs(item.remaining))}
                            </span>
                          </div>
                          <Progress
                            value={itemPercentSpent}
                            className="h-1.5"
                            indicatorClassName={getProgressColor(itemPercentSpent)}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}
