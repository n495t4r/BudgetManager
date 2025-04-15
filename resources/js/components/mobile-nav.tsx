"use client"

import { Home, PlusCircle, Settings, PieChart } from "lucide-react"
import { usePage } from "@inertiajs/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function MobileNav() {
  const { url } = usePage()

  const isActive = (path: string) => url.startsWith(path)

  const navItems = [
    {
      label: "Home",
      icon: Home,
      href: route("dashboard"),
      active: isActive(route("dashboard")),
    },
    // {
    //   label: "Add",
    //   icon: PlusCircle,
    //   href: "#",
    //   onClick: () => {
    //     // This will be handled by the modal in the dashboard
    //     const event = new CustomEvent("open-expense-form")
    //     window.dispatchEvent(event)
    //   },
    //   active: false,
    // },
    // {
    //   label: "Reports",
    //   icon: PieChart,
    // //   href: route("reports"),
    //   href: "#",
    //   active: isActive(route("dashboard")),
    // //   active: isActive(route("reports")),
    // },
    {
      label: "Settings",
      icon: Settings,
      href: "settings",
    //   href: route("settings"),
    active: isActive(route("settings")),
    //   active: isActive(route("settings")),
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            size="sm"
            className={cn(
              "flex flex-col items-center justify-center rounded-none h-16 w-full gap-1",
              item.active && "bg-muted",
            )}
            onClick={() => {
              if (item.onClick) {
                item.onClick()
              } else {
                window.location.href = item.href
              }
            }}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
