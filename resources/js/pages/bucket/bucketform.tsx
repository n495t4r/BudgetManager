"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface LineItem {
  id?: number
  title: string
  percentage: number
}

interface Bucket {
  id: number
  title: string
  percentage: number
  line_items: LineItem[]
}

interface BucketFormProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly bucket?: Bucket
  readonly onSuccess: () => void
}

export default function BucketForm({ open, onOpenChange, bucket, onSuccess }: BucketFormProps) {
  const isEditing = !!bucket?.id
  const [lineItems, setLineItems] = useState<LineItem[]>([])
  const [totalPercentage, setTotalPercentage] = useState(0)
  const [lineItemsError, setLineItemsError] = useState("")

  // Form for creating/editing a budget bucket
  const { data, setData, post, put, processing, errors, reset } = useForm({
    id: bucket?.id || 0,
    title: bucket?.title || "",
    percentage: bucket?.percentage?.toString() || "0",
    line_items: [] as LineItem[],
  })

  // Initialize line items when editing
  useEffect(() => {
    if (bucket?.line_items && bucket.line_items.length > 0) {
      setLineItems(bucket.line_items)
    } else {
      setLineItems([{ title: "", percentage: 0 }])
    }
  }, [bucket, open])

  // Calculate total percentage of line items
  useEffect(() => {
    const total = lineItems.reduce((sum, item) => sum + (Number(item.percentage) || 0), 0)
    setTotalPercentage(total)

    if (lineItems.length > 0 && total !== 100) {
      setLineItemsError(`Line items must add up to 100%. Current total: ${total}%`)
    } else {
      setLineItemsError("")
    }
  }, [lineItems])

  // Add a new line item
  const addLineItem = () => {
    setLineItems([...lineItems, { title: "", percentage: 0 }])
  }

  // Remove a line item
  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      const newLineItems = [...lineItems]
      newLineItems.splice(index, 1)
      setLineItems(newLineItems)
    }
  }

  // Update a line item
  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newLineItems = [...lineItems]
    newLineItems[index] = { ...newLineItems[index], [field]: value }
    setLineItems(newLineItems)
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate line items
    if (totalPercentage !== 100) {
      return
    }

    // Update form data with line items
    setData("line_items", lineItems)

    const onSuccessCallback = () => {
      toast(isEditing ? "Budget bucket updated successfully!" : "Budget bucket added successfully!",
      )
      onOpenChange(false)
      onSuccess()
    }

    if (isEditing) {
      put(route("buckets.update", bucket.id), {
        preserveScroll: true,
        onSuccess: onSuccessCallback,
      })
    } else {
      post(route("buckets.store"), {
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
      setLineItems([{ title: "", percentage: 0 }])
      setLineItemsError("")
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Budget Bucket" : "Add Budget Bucket"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update your budget bucket details"
                : "Create a new budget bucket to categorize your expenses"}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="grid gap-4 py-4 px-1">
              <div className="space-y-2">
                <Label htmlFor="title">Bucket Name</Label>
                <Input
                  id="title"
                  placeholder="e.g. Necessities, Discretionary, Savings"
                  value={data.title}
                  onChange={(e) => setData("title", e.target.value)}
                />
                {errors.title && <p className="text-sm font-medium text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="percentage">Budget Percentage</Label>
                <div className="relative">
                  <Input
                    id="percentage"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    className="pr-8"
                    value={data.percentage}
                    onChange={(e) => setData("percentage", e.target.value)}
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground">%</span>
                </div>
                {errors.percentage && <p className="text-sm font-medium text-destructive">{errors.percentage}</p>}
              </div>

              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <Label>Line Items</Label>
                  <span
                    className={cn("text-xs font-medium", totalPercentage === 100 ? "text-green-600" : "text-amber-600")}
                  >
                    Total: {totalPercentage}%
                  </span>
                </div>

                {lineItemsError && <p className="text-sm font-medium text-destructive">{lineItemsError}</p>}

                <div className="space-y-3">
                  {lineItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Line item name"
                          value={item.title}
                          onChange={(e) => updateLineItem(index, "title", e.target.value)}
                        />
                      </div>
                      <div className="w-24 relative">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0"
                          className="pr-8"
                          value={item.percentage}
                          onChange={(e) => updateLineItem(index, "percentage", Number(e.target.value))}
                        />
                        <span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground">%</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLineItem(index)}
                        disabled={lineItems.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addLineItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Line Item
                </Button>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={processing || totalPercentage !== 100}>
              {processing ? "Saving..." : isEditing ? "Update Bucket" : "Add Bucket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
