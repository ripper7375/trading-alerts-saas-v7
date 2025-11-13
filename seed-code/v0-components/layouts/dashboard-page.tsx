"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Menu, X, Bell } from "lucide-react"
import { cn } from "@/lib/utils"

type NavItem = {
  id: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "🏠" },
  { id: "charts", label: "Live Charts", icon: "📊" },
  { id: "alerts", label: "Alerts", icon: "🔔" },
  { id: "watchlist", label: "Watchlist", icon: "📝" },
  { id: "settings", label: "Settings", icon: "⚙️" },
]

export default function DashboardLayout() {
  const [activeNav, setActiveNav] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo Section */}
        <div className="border-b p-6">
          <h1 className="font-serif text-3xl font-bold text-black">DavidTrade</h1>
          <div className="mt-3 inline-block rounded-md bg-green-500 px-3 py-1 text-xs font-semibold text-white">
            FREE TIER 🆓
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveNav(item.id)
                    setSidebarOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors duration-200",
                    activeNav === item.id
                      ? "border-l-4 border-blue-600 bg-blue-50 font-semibold text-blue-600"
                      : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
          {/* Hamburger Menu (Mobile) */}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
            {sidebarOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
          </button>

          {/* Spacer for desktop */}
          <div className="hidden md:block" />

          {/* Right Side: Notifications & Profile */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-700" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </Button>

            <button className="flex items-center gap-3 rounded-lg px-2 py-1 transition-colors duration-200 hover:bg-gray-100">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/professional-trader-avatar.png" alt="Davin Trader" />
                <AvatarFallback>DT</AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium text-gray-900">Davin Trader</p>
              </div>
              <span className="text-gray-500">▼</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8">
          <div className="flex h-full items-center justify-center">
            <p className="text-3xl text-gray-400">Dashboard content goes here</p>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white md:hidden">
        <ul className="flex justify-around py-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveNav(item.id)}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 transition-colors duration-200",
                  activeNav === item.id ? "text-blue-600" : "text-gray-600",
                )}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
