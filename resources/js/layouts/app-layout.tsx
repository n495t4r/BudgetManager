import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { MobileNav } from "@/components/mobile-nav"

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          {/* <div className="container mx-auto max-w-4xl">{children}</div> */}
          <div className="container mx-auto px-4 md:px-6 lg:px-8">{children}</div>
        </main>
        <MobileNav />
      </div>
    </SidebarProvider>
  )
}
