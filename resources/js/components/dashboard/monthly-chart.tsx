"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"

interface MonthlyDataPoint {
  name: string
  income: number
  expenses: number
}

interface MonthlyChartProps {
  data: MonthlyDataPoint[]
  currency: string
}

export function MonthlyChart({ data, currency }: MonthlyChartProps) {
  // Format currency for tooltip
  const formatCurrency = (value: number) => `${currency}${value.toFixed(2)}`

const formatAmount = (amount: number) => {
    return `${currency}${new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount)}`
}

  console.log("MonthlyChart data", data)
  return (

    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Monthly Overview</CardTitle>
        <CardDescription>Income vs expenses over time</CardDescription>
      </CardHeader>
      <CardContent className="p-0 pt-2">
        <div className="h-[300px] md:h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${currency}${value}`} />
              <Tooltip
                formatter={(value: number) => [formatAmount(value), ""]}
                labelFormatter={(label) => `Month: ${label}`}
                contentStyle={{ fontSize: "12px" }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar name="Income" dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar name="Expenses" dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
