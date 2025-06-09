"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, CreditCard, Target, TrendingUp, User } from "lucide-react"
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
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-72 sidebar-professional flex-col z-50">
        <div className="p-8 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl professional-gradient flex items-center justify-center professional-shadow">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 heading-primary">FinanceApp</h2>
              <p className="text-sm text-slate-500 font-medium">Gestão Financeira Profissional</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200 professional-shadow"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent",
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700",
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-semibold">{item.label}</span>
                  {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-blue-600"></div>}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="p-6 border-t border-slate-200">
          <div className="flex items-center space-x-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
              <User className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Sistema Ativo</p>
              <p className="text-xs text-slate-500">Dados sincronizados</p>
            </div>
            <div className="ml-auto">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 z-50 professional-shadow-lg">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-all duration-200",
                  isActive ? "text-blue-700 bg-blue-50" : "text-slate-500 hover:text-slate-700",
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    isActive ? "bg-blue-100 text-blue-700" : "bg-transparent",
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold">{item.label}</span>
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
