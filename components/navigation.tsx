"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, CreditCard, Target, Activity, TrendingUp } from "lucide-react"
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
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-72 glass-card border-r border-white/10 flex-col p-8 z-50">
        <div className="mb-12">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                FinanceApp
              </h2>
              <p className="text-xs text-gray-400">Gestão Financeira</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-4 px-6 py-4 rounded-xl transition-all duration-300 group",
                  isActive
                    ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30 glow-effect"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10",
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-lg transition-all duration-300",
                    isActive ? "bg-gradient-to-r from-blue-500 to-purple-600" : "bg-white/5 group-hover:bg-white/10",
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-medium">{item.label}</span>
                {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-blue-400"></div>}
              </Link>
            )
          })}
        </div>

        <div className="mt-auto p-6 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          <div className="flex items-center space-x-3">
            <Activity className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm font-medium text-white">Sistema Online</p>
              <p className="text-xs text-gray-400">Dados sincronizados</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-card border-t border-white/10 px-4 py-3 z-50">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center space-y-1 px-4 py-2 rounded-xl transition-all duration-300",
                  isActive ? "text-blue-400 bg-blue-500/10" : "text-gray-400 hover:text-white",
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-lg transition-all duration-300",
                    isActive ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20" : "bg-transparent",
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Content Padding */}
      <div className="md:ml-72 mb-20 md:mb-0"></div>
    </>
  )
}
