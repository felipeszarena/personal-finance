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
import { Download, TrendingUp, TrendingDown, DollarSign, Target, Activity, BarChart3, Calendar } from "lucide-react"
import { type Transaction, type Goal, getTransactions, getGoals } from "@/lib/storage"
import { generatePDF } from "@/lib/pdf"
import Navigation from "@/components/navigation"
import { formatCurrency } from "@/lib/utils"

const COLORS = ["#1e40af", "#059669", "#dc2626", "#d97706", "#7c3aed", "#0891b2"]

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

      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 heading-primary">Dashboard Financeiro</h1>
            <p className="text-slate-600 mt-2 text-lg">Visão geral completa das suas finanças pessoais</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-full sm:w-48 professional-card">
                <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="professional-card">
                <SelectItem value="month">Último mês</SelectItem>
                <SelectItem value="3months">Últimos 3 meses</SelectItem>
                <SelectItem value="year">Último ano</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleDownloadPDF} className="professional-gradient text-white professional-shadow">
              <Download className="w-4 h-4 mr-2" />
              Relatório PDF
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                Saldo Total
              </CardTitle>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold mb-2 ${balance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {formatCurrency(balance)}
              </div>
              <div className="flex items-center text-sm text-slate-500">
                <Activity className="w-4 h-4 mr-1" />
                <span>Saldo atual disponível</span>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Receitas</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600 mb-2">{formatCurrency(totalIncome)}</div>
              <div className="flex items-center text-sm text-slate-500">
                <BarChart3 className="w-4 h-4 mr-1" />
                <span>Total de entradas no período</span>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Despesas</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 mb-2">{formatCurrency(totalExpenses)}</div>
              <div className="flex items-center text-sm text-slate-500">
                <BarChart3 className="w-4 h-4 mr-1" />
                <span>Total de saídas no período</span>
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                Taxa de Economia
              </CardTitle>
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold mb-2 ${savingsRate >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {savingsRate.toFixed(1)}%
              </div>
              <div className="flex items-center text-sm text-slate-500">
                <Activity className="w-4 h-4 mr-1" />
                <span>Percentual economizado</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <Card className="professional-card professional-shadow">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-xl font-semibold text-slate-900 heading-secondary">
                Distribuição de Gastos por Categoria
              </CardTitle>
              <p className="text-sm text-slate-600">Análise detalhada dos seus gastos</p>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
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
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Line Chart */}
          <Card className="professional-card professional-shadow">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-xl font-semibold text-slate-900 heading-secondary">
                Evolução Mensal das Finanças
              </CardTitle>
              <p className="text-sm text-slate-600">Tendência de receitas e despesas</p>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#059669"
                    strokeWidth={3}
                    name="Receitas"
                    dot={{ fill: "#059669", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#dc2626"
                    strokeWidth={3}
                    name="Despesas"
                    dot={{ fill: "#dc2626", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Transactions */}
          <Card className="professional-card professional-shadow">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-xl font-semibold text-slate-900 heading-secondary">
                Transações Recentes
              </CardTitle>
              <p className="text-sm text-slate-600">Últimas movimentações financeiras</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                        <span className="text-sm font-semibold text-slate-700">
                          {transaction.category.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{transaction.description}</p>
                        <p className="text-sm text-slate-500">{transaction.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold text-lg ${transaction.type === "income" ? "text-emerald-600" : "text-red-600"}`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-sm text-slate-500">{new Date(transaction.date).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Goals Progress */}
          <Card className="professional-card professional-shadow">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-xl font-semibold text-slate-900 heading-secondary">
                Progresso das Metas Financeiras
              </CardTitle>
              <p className="text-sm text-slate-600">Acompanhamento dos seus objetivos</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {goals.slice(0, 5).map((goal) => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100
                  return (
                    <div key={goal.id} className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-slate-900">{goal.name}</span>
                        <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-600 font-semibold">{formatCurrency(goal.currentAmount)}</span>
                        <span className="text-slate-500">{formatCurrency(goal.targetAmount)}</span>
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
