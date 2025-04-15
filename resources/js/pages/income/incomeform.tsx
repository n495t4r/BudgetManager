"use client"

import type React from "react"
import { useForm } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface IncomeSource {
    id: number
    name: string
    amount: number
    is_active: boolean
}

interface IncomeFormProps {
    readonly open: boolean
    readonly onOpenChange: (open: boolean) => void
    readonly incomeSource?: IncomeSource
    readonly currency: string
    readonly onSuccess: () => void
}

export default function IncomeForm({ open, onOpenChange, incomeSource, currency = "$", onSuccess }: IncomeFormProps) {
    const isEditing = !!incomeSource?.id
    // Form for creating/editing an income source
    const { data, setData, post, put, processing, errors, reset } = useForm({
        id: incomeSource?.id || 0,
        name: incomeSource?.name || "",
        amount: incomeSource?.amount?.toString() || "",
        is_active: incomeSource?.is_active ?? true,
    })

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const onSuccessCallback = () => {
            toast(
                isEditing ? "Income source updated successfully!" : "Income source added successfully!",
            )
            onOpenChange(false)
            onSuccess()
        }

        if (isEditing) {
            put(route("income-sources.update", incomeSource.id), {
                preserveScroll: true,
                onSuccess: onSuccessCallback,
            })
        } else {
            post(route("income-sources.store"), {
                preserveScroll: true,
                onSuccess: onSuccessCallback,
            })
        }
    }

    // Handle dialog close
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            // Reset form when closing
            reset()
        }
        onOpenChange(open)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Edit Income Source" : "Add Income Source"}</DialogTitle>
                        <DialogDescription>
                            {isEditing ? "Update your income source details" : "Add a new income source to your budget"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Source Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Salary, Freelance, Investments"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                            />
                            {errors.name && <p className="text-sm font-medium text-destructive">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Monthly Amount</Label>
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

                        <div className="flex items-center justify-between">
                            <Label htmlFor="is_active" className="cursor-pointer">
                                Active
                            </Label>
                            <Switch
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData("is_active", checked)}
                            />
                        </div>
                        {errors.is_active && <p className="text-sm font-medium text-destructive">{errors.is_active}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? "Saving..." : isEditing ? "Update Income" : "Add Income"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
