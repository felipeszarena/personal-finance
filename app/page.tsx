"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Download, TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react"
import { type Transaction, type Goal, getTransactions, getGoals } from "@/lib/storage"
import { generatePDF } from "@/lib/pdf"
import Navigation from "@/components/navigation"
import { formatCurrency } from "@/lib/utils"

const COLORS = ["#3B82F6", "#10B981", "#EF4444", "#F59E0B", "#8B5CF6", "#F97316"]

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [period, setPeriod] = useState("month")
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    setTransactions(getTransactions())
    setGoals(getGoals())
  }, [])

  useEffect(() => {
    const now = new Date()
    let startDate = new Date()

    switch (period) {
      case "month":
        startDate.setMonth(now.getMonth() - 1)
        break
      case "3months":
        startDate.setMonth(now.getMonth() - 3)
        break
      case "year":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate = new Date(0)
    }

    const filtered = transactions.filter((t) => new Date(t.date) >= startDate)
    setFilteredTransactions(filtered)
  }, [transactions, period])

  const totalIncome = filteredTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = filteredTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0

  // Expenses by category for pie chart
  const expensesByCategory = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      },
      {} as Record<string, number>,
    )

  const pieData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount,
  }))

  // Monthly evolution for line chart
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (5 - i))
    const monthKey = date.toISOString().slice(0, 7)

    const monthTransactions = transactions.filter((t) => t.date.startsWith(monthKey))
    const income = monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
    const expenses = monthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    return {
      month: date.toLocaleDateString("pt-BR", { month: "short" }),
      income,
      expenses,
    }
  })

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const handleDownloadPDF = () => {
    generatePDF(filteredTransactions, goals, { period })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Financeiro</h1>
          <div className="flex gap-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Último mês</SelectItem>
                <SelectItem value="3months">Últimos 3 meses</SelectItem>
                <SelectItem value="year">Último ano</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Baixar Relatório PDF
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(balance)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Economia</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${savingsRate >= 0 ? "text-green-600" : "text-red-600"}`}>
                {savingsRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Gastos por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} name="Receitas" />
                  <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="Despesas" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Últimas Transações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.category}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Goals Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Progresso das Metas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {goals.slice(0, 5).map((goal) => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100
                  return (
                    <div key={goal.id}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{goal.name}</span>
                        <span className="text-sm text-gray-500">{progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-sm text-gray-500">
                        <span>{formatCurrency(goal.currentAmount)}</span>
                        <span>{formatCurrency(goal.targetAmount)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
