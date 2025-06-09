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
import { Download, TrendingUp, TrendingDown, DollarSign, Target, Activity, BarChart3 } from "lucide-react"
import { type Transaction, type Goal, getTransactions, getGoals } from "@/lib/storage"
import { generatePDF } from "@/lib/pdf"
import Navigation from "@/components/navigation"
import { formatCurrency } from "@/lib/utils"

const COLORS = ["#667eea", "#4facfe", "#fa709a", "#fee140", "#764ba2", "#00f2fe"]

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
    <div className="min-h-screen">
      <Navigation />

      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Dashboard Financeiro
            </h1>
            <p className="text-gray-400 mt-2">Visão geral das suas finanças pessoais</p>
          </div>
          <div className="flex gap-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-48 glass-card border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/20">
                <SelectItem value="month">Último mês</SelectItem>
                <SelectItem value="3months">Últimos 3 meses</SelectItem>
                <SelectItem value="year">Último ano</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleDownloadPDF} className="tech-gradient hover:glow-effect transition-all duration-300">
              <Download className="w-4 h-4 mr-2" />
              Relatório PDF
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card tech-border hover:glow-effect transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Saldo Total</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                <DollarSign className="h-4 w-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${balance >= 0 ? "text-green-400" : "text-red-400"}`}>
                {formatCurrency(balance)}
              </div>
              <div className="flex items-center mt-2">
                <Activity className="w-4 h-4 text-gray-400 mr-1" />
                <span className="text-xs text-gray-400">Saldo atual</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card tech-border hover:glow-effect transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Receitas</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-r from-green-500/20 to-blue-500/20">
                <TrendingUp className="h-4 w-4 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{formatCurrency(totalIncome)}</div>
              <div className="flex items-center mt-2">
                <BarChart3 className="w-4 h-4 text-gray-400 mr-1" />
                <span className="text-xs text-gray-400">Total de entradas</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card tech-border hover:glow-effect transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Despesas</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-r from-red-500/20 to-pink-500/20">
                <TrendingDown className="h-4 w-4 text-red-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{formatCurrency(totalExpenses)}</div>
              <div className="flex items-center mt-2">
                <BarChart3 className="w-4 h-4 text-gray-400 mr-1" />
                <span className="text-xs text-gray-400">Total de saídas</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card tech-border hover:glow-effect transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Taxa de Economia</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                <Target className="h-4 w-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${savingsRate >= 0 ? "text-green-400" : "text-red-400"}`}>
                {savingsRate.toFixed(1)}%
              </div>
              <div className="flex items-center mt-2">
                <Activity className="w-4 h-4 text-gray-400 mr-1" />
                <span className="text-xs text-gray-400">Percentual poupado</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <Card className="glass-card tech-border">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-400 mr-3"></div>
                Gastos por Categoria
              </CardTitle>
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
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: "rgba(15, 15, 35, 0.9)",
                      border: "1px solid rgba(103, 126, 234, 0.2)",
                      borderRadius: "12px",
                      color: "white",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Line Chart */}
          <Card className="glass-card tech-border">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white flex items-center">
                <div className="w-2 h-2 rounded-full bg-purple-400 mr-3"></div>
                Evolução Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: "rgba(15, 15, 35, 0.9)",
                      border: "1px solid rgba(103, 126, 234, 0.2)",
                      borderRadius: "12px",
                      color: "white",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#4facfe"
                    strokeWidth={3}
                    name="Receitas"
                    dot={{ fill: "#4facfe", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#fa709a"
                    strokeWidth={3}
                    name="Despesas"
                    dot={{ fill: "#fa709a", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Transactions */}
          <Card className="glass-card tech-border">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-400 mr-3"></div>
                Últimas Transações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-400">
                          {transaction.category.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{transaction.description}</p>
                        <p className="text-sm text-gray-400">{transaction.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold text-lg ${transaction.type === "income" ? "text-green-400" : "text-red-400"}`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-sm text-gray-400">{new Date(transaction.date).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Goals Progress */}
          <Card className="glass-card tech-border">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white flex items-center">
                <div className="w-2 h-2 rounded-full bg-yellow-400 mr-3"></div>
                Progresso das Metas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {goals.slice(0, 5).map((goal) => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100
                  return (
                    <div key={goal.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex justify-between mb-3">
                        <span className="font-medium text-white">{goal.name}</span>
                        <span className="text-sm text-blue-400 font-semibold">{progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3 mb-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 glow-effect"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-400 font-medium">{formatCurrency(goal.currentAmount)}</span>
                        <span className="text-gray-400">{formatCurrency(goal.targetAmount)}</span>
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
