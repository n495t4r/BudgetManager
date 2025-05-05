"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { router, useForm } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { format, parse } from "date-fns"
import { Calendar } from "@/components/ui/calender"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
// import { useToast } from "@/hooks/use-toast"
import { toast } from "sonner"

interface LineItem {
    id: number
    title: string
    percentage?: string
    amount?: number
    spent?: number
    remaining?: number
    bucket_id?: number
}

interface Bucket {
    id: number
    title: string
    percentage?: string
    amount?: number
    spent?: number
    remaining?: number
    lineItems?: LineItem[] // Note: camelCase property name
}

interface Expense {
    id: number
    date: string
    description: string
    amount: string | number
    bucket_id: number
    line_item_id: number
    bucket?: Bucket
    line_item?: {
        id: number
        title: string
        bucket?: Bucket
    }
}

interface ExpenseFormProps {
    readonly open: boolean
    readonly onOpenChange: (open: boolean) => void
    readonly expense?: Expense
    readonly buckets: readonly Bucket[]
    readonly currency: string
    readonly onSuccess: () => void
    readonly period?: string
}

export default function ExpenseForm({
    open,
    onOpenChange,
    expense,
    buckets = [],
    currency = "$",
    onSuccess,
    period,
}: ExpenseFormProps) {
    const [lineItems, setLineItems] = useState<LineItem[]>([])
    const isEditing = !!expense?.id
    //   const { toast } = useToast()
    const formInitialized = useRef(false)

    // Form for creating/editing an expense
    const { data, setData, post, put, processing, errors, reset } = useForm({
        id: 0,
        date: format(period ? new Date(period) : new Date(), "yyyy-MM-dd"),
        bucket_id: "",
        line_item_id: "",
        amount: "",
        description: "",
        period: period || "",
    })

    useEffect(() => {
        if (open) {
            const formData = {
                id: expense?.id || 0,
                date: expense?.date
                    ? format(new Date(expense.date), "yyyy-MM-dd")
                    : format(period ? new Date(period) : new Date(), "yyyy-MM-dd"),
                bucket_id: expense?.bucket_id?.toString() || "",
                line_item_id: expense?.line_item_id?.toString() || "",
                amount: typeof expense?.amount === "string"
                    ? expense.amount
                    : expense?.amount?.toString() || "",
                description: expense?.description || "",
                period: period || "",
            }

            reset(formData)
            formInitialized.current = true

            if (expense?.bucket_id) {
                const bucket = buckets.find((b) => b.id === expense.bucket_id)
                if (bucket?.lineItems?.length) {
                    setLineItems(bucket.lineItems)
                }
            } else {
                setLineItems([]) // for fresh form, also reset line items
            }
        }
    }, [open, expense, period, buckets])


    // Update line items when bucket changes
    useEffect(() => {
        if (data.bucket_id) {
            //   console.log("Bucket changed to:", data.bucket_id)
            const bucket = buckets.find((b) => b.id.toString() === data.bucket_id.toString())
            if (bucket && bucket.lineItems && bucket.lineItems.length > 0) {
                // console.log("Found bucket with line items:", bucket.lineItems)
                setLineItems(bucket.lineItems)
            } else {
                // console.log("No line items found for bucket")
                setLineItems([])
            }
        } else {
            setLineItems([])
        }
    }, [data.bucket_id, buckets])

    // Handle date selection from calendar
    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setData("date", format(date, "yyyy-MM-dd"))
        }
    }

    // Format date for display in the date picker button
    const getFormattedDate = () => {
        try {
            const date = parse(data.date, "yyyy-MM-dd", new Date())
            return format(date, "MMM dd, yyyy")
        } catch (error) {
            return "Invalid date"
        }
    }

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const onSuccessCallback = () => {
            toast(
                isEditing ? "Expense updated successfully!" : "Expense created successfully!",
            )

            // Reset the form completely after successful submission
            setData({
                id: 0,
                date: format(period ? new Date(period) : new Date(), "yyyy-MM-dd"),
                bucket_id: "",
                line_item_id: "",
                amount: "",
                description: "",
                period: period || "",
            })

            // Reset line items
            setLineItems([])

            formInitialized.current = false
            onOpenChange(false)
            onSuccess()
        }

        if (isEditing && expense?.id) {
            //   console.log("Updating expense:", data)
            put(route("expenses.update", expense.id), {
                preserveScroll: true,
                onSuccess: onSuccessCallback,
            })
        } else {
            //   console.log("Creating expense:", data)
            router.post(route("expenses.store"), data, {
                preserveScroll: true,
                onSuccess: onSuccessCallback,
            })
        }
    }

    // Handle dialog close
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            // Reset initialization state when closing
            formInitialized.current = false
        }
        onOpenChange(open)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Edit Expense" : "Add New Expense"}</DialogTitle>
                        <DialogDescription>
                            {isEditing ? "Update your expense record" : "Record a new expense for your budget"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        type="button"
                                        variant="outline"
                                        className={cn("w-full justify-start text-left font-normal", !data.date && "text-muted-foreground")}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {data.date ? getFormattedDate() : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={data.date ? parse(data.date, "yyyy-MM-dd", new Date()) : undefined}
                                        onSelect={handleDateSelect}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.date && <p className="text-sm font-medium text-destructive">{errors.date}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bucket_id">Budget Bucket</Label>
                            <Select
                                value={data.bucket_id ? data.bucket_id.toString() : undefined}
                                onValueChange={(value) => setData("bucket_id", value)}
                            >
                                <SelectTrigger id="bucket_id">
                                    <SelectValue placeholder="Select a bucket" />
                                </SelectTrigger>
                                <SelectContent>
                                    {buckets.map((bucket) => (
                                        <SelectItem key={bucket.id} value={bucket.id.toString()}>
                                            {bucket.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.bucket_id && <p className="text-sm font-medium text-destructive">{errors.bucket_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="line_item_id">Line Item</Label>
                            <Select
                                value={data.line_item_id ? data.line_item_id.toString() : undefined}
                                onValueChange={(value) => setData("line_item_id", value)}
                                disabled={!data.bucket_id || lineItems.length === 0}
                            >
                                <SelectTrigger id="line_item_id">
                                    <SelectValue placeholder="Select a line item" />
                                </SelectTrigger>
                                <SelectContent>
                                    {lineItems && lineItems.length > 0 ? (
                                        lineItems.map((item) => (
                                            <SelectItem key={item.id} value={item.id.toString()}>
                                                {item.title}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="no-line-items" disabled>
                                            No line items available
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.line_item_id && <p className="text-sm font-medium text-destructive">{errors.line_item_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                                    {currency}
                                </span>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="pl-7"
                                    value={data.amount}
                                    onChange={(e) => setData("amount", e.target.value)}
                                />
                            </div>
                            {errors.amount && <p className="text-sm font-medium text-destructive">{errors.amount}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Enter expense details"
                                value={data.description}
                                onChange={(e) => setData("description", e.target.value)}
                            />
                            {errors.description && <p className="text-sm font-medium text-destructive">{errors.description}</p>}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? "Saving..." : isEditing ? "Update Expense" : "Save Expense"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
