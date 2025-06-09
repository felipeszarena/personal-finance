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
import { Plus, Search, Edit, Trash2, Copy } from "lucide-react"
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

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName)
    return category?.icon || "circle"
  }

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName)
    return category?.color || "#6B7280"
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Transações</h1>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setEditingTransaction(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingTransaction ? "Editar Transação" : "Nova Transação"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="amount">Valor</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    defaultValue={editingTransaction?.amount || ""}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select name="type" defaultValue={editingTransaction?.type || "expense"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Despesa</SelectItem>
                      <SelectItem value="income">Receita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select name="category" defaultValue={editingTransaction?.category || categories[0].name}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.name} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    required
                    defaultValue={editingTransaction?.description || ""}
                  />
                </div>
                <div>
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    required
                    defaultValue={editingTransaction?.date || new Date().toISOString().split("T")[0]}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingTransaction ? "Atualizar" : "Salvar"} Transação
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por descrição..."
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                />
              </div>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-categories">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.type} onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-types">Todos os tipos</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                placeholder="Data inicial"
                value={filters.startDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
              />
              <Input
                type="date"
                placeholder="Data final"
                value={filters.endDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <div className="space-y-4 mb-6">
          {paginatedTransactions.map((transaction) => (
            <Card key={transaction.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: getCategoryColor(transaction.category) }}
                    >
                      <span className="text-sm font-bold">{transaction.category.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{transaction.description}</h3>
                      <p className="text-sm text-gray-500">{transaction.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p
                        className={`font-bold text-lg ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(transaction)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDuplicate(transaction)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-700"
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
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="flex items-center px-4">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
