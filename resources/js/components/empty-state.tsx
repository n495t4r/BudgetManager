import type React from "react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function EmptyState({ title, description, icon, actions, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-12 px-4 h-full", className)}>
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
      {actions && <div className="mt-6 flex flex-wrap gap-3 justify-center">{actions}</div>}
    </div>
  )
}
