"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, CreditCard, Target } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/transactions", label: "Transações", icon: CreditCard },
    { href: "/goals", label: "Metas", icon: Target },
  ]

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex-col p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-blue-600">FinanceApp</h2>
        </div>
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                  isActive ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-100",
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors",
                  isActive ? "text-blue-700" : "text-gray-600",
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Content Padding */}
      <div className="md:ml-64 mb-16 md:mb-0">{/* This div provides proper spacing for the main content */}</div>
    </>
  )
}
