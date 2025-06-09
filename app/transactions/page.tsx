"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Edit, Trash2, Copy, Filter, Calendar } from "lucide-react"
import { type Transaction, getTransactions, saveTransaction, updateTransaction, deleteTransaction } from "@/lib/storage"
import { categories } from "@/lib/categories"
import Navigation from "@/components/navigation"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    type: "",
    startDate: "",
    endDate: "",
  })
  const { toast } = useToast()

  const itemsPerPage = 20

  useEffect(() => {
    setTransactions(getTransactions())
  }, [])

  useEffect(() => {
    let filtered = transactions

    if (filters.search) {
      filtered = filtered.filter((t) => t.description.toLowerCase().includes(filters.search.toLowerCase()))
    }

    if (filters.category && filters.category !== "all-categories") {
      filtered = filtered.filter((t) => t.category === filters.category)
    }

    if (filters.type && filters.type !== "all-types") {
      filtered = filtered.filter((t) => t.type === filters.type)
    }

    if (filters.startDate) {
      filtered = filtered.filter((t) => t.date >= filters.startDate)
    }

    if (filters.endDate) {
      filtered = filtered.filter((t) => t.date <= filters.endDate)
    }

    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    setFilteredTransactions(filtered)
    setCurrentPage(1)
  }, [transactions, filters])

  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const transactionData = {
      amount: Number.parseFloat(formData.get("amount") as string),
      type: formData.get("type") as "income" | "expense",
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      date: formData.get("date") as string,
    }

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transactionData)
      toast({
        title: "Transação atualizada",
        description: "A transação foi atualizada com sucesso.",
      })
    } else {
      saveTransaction(transactionData)
      toast({
        title: "Transação criada",
        description: "A transação foi criada com sucesso.",
      })
    }

    setTransactions(getTransactions())
    setIsModalOpen(false)
    setEditingTransaction(null)
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta transação?")) {
      deleteTransaction(id)
      setTransactions(getTransactions())
      toast({
        title: "Transação excluída",
        description: "A transação foi excluída com sucesso.",
      })
    }
  }

  const handleDuplicate = (transaction: Transaction) => {
    const { id, createdAt, ...transactionData } = transaction
    saveTransaction(transactionData)
    setTransactions(getTransactions())
    toast({
      title: "Transação duplicada",
      description: "A transação foi duplicada com sucesso.",
    })
  }

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName)
    return category?.color || "#64748b"
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 heading-primary">Gestão de Transações</h1>
            <p className="text-slate-600 mt-2 text-lg">Controle completo das suas receitas e despesas</p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                className="professional-gradient text-white professional-shadow"
                onClick={() => setEditingTransaction(null)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent className="professional-card professional-shadow sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-slate-900">
                  {editingTransaction ? "Editar Transação" : "Nova Transação"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="amount" className="text-slate-700 font-semibold">
                    Valor
                  </Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    defaultValue={editingTransaction?.amount || ""}
                    className="professional-border"
                  />
                </div>
                <div>
                  <Label htmlFor="type" className="text-slate-700 font-semibold">
                    Tipo
                  </Label>
                  <Select name="type" defaultValue={editingTransaction?.type || "expense"}>
                    <SelectTrigger className="professional-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="professional-card">
                      <SelectItem value="expense">Despesa</SelectItem>
                      <SelectItem value="income">Receita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category" className="text-slate-700 font-semibold">
                    Categoria
                  </Label>
                  <Select name="category" defaultValue={editingTransaction?.category || categories[0].name}>
                    <SelectTrigger className="professional-border">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent className="professional-card">
                      {categories.map((category) => (
                        <SelectItem key={category.name} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description" className="text-slate-700 font-semibold">
                    Descrição
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    required
                    defaultValue={editingTransaction?.description || ""}
                    className="professional-border"
                  />
                </div>
                <div>
                  <Label htmlFor="date" className="text-slate-700 font-semibold">
                    Data
                  </Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    required
                    defaultValue={editingTransaction?.date || new Date().toISOString().split("T")[0]}
                    className="professional-border"
                  />
                </div>
                <Button type="submit" className="w-full professional-gradient text-white professional-shadow">
                  {editingTransaction ? "Atualizar" : "Salvar"} Transação
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="professional-card professional-shadow mb-8">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-xl font-semibold text-slate-900 heading-secondary flex items-center">
              <Filter className="w-5 h-5 mr-2 text-blue-600" />
              Filtros de Pesquisa
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por descrição..."
                  className="pl-10 professional-border"
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                />
              </div>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="professional-border">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent className="professional-card">
                  <SelectItem value="all-categories">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.type} onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}>
                <SelectTrigger className="professional-border">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent className="professional-card">
                  <SelectItem value="all-types">Todos os tipos</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  type="date"
                  placeholder="Data inicial"
                  className="pl-10 professional-border"
                  value={filters.startDate}
                  onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  type="date"
                  placeholder="Data final"
                  className="pl-10 professional-border"
                  value={filters.endDate}
                  onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <div className="space-y-4 mb-8">
          {paginatedTransactions.map((transaction) => (
            <Card
              key={transaction.id}
              className="professional-card professional-shadow hover:professional-shadow-lg transition-all duration-200"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg professional-shadow"
                      style={{ backgroundColor: getCategoryColor(transaction.category) }}
                    >
                      {transaction.category.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-lg">{transaction.description}</h3>
                      <p className="text-sm text-slate-500 font-medium">{transaction.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p
                        className={`font-bold text-2xl ${transaction.type === "income" ? "text-emerald-600" : "text-red-600"}`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-sm text-slate-500 font-medium">
                        {new Date(transaction.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(transaction)}
                        className="professional-border hover:bg-slate-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicate(transaction)}
                        className="professional-border hover:bg-slate-50"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(transaction.id)}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="professional-border hover:bg-slate-50"
            >
              Anterior
            </Button>
            <span className="flex items-center px-6 py-2 professional-card professional-border rounded-lg text-slate-700 font-semibold">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="professional-border hover:bg-slate-50"
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
