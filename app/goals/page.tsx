"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Target, DollarSign, Edit, Trash2, TrendingUp, Award, Clock } from "lucide-react"
import { type Goal, getGoals, saveGoal, updateGoal, deleteGoal, addContribution } from "@/lib/storage"
import Navigation from "@/components/navigation"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [filter, setFilter] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    setGoals(getGoals())
  }, [])

  useEffect(() => {
    let filtered = goals

    switch (filter) {
      case "active":
        filtered = goals.filter((g) => !g.isCompleted)
        break
      case "completed":
        filtered = goals.filter((g) => g.isCompleted)
        break
      default:
        filtered = goals
    }

    setFilteredGoals(filtered)
  }, [goals, filter])

  const handleSubmitGoal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const goalData = {
      name: formData.get("name") as string,
      targetAmount: Number.parseFloat(formData.get("targetAmount") as string),
      deadline: formData.get("deadline") as string,
    }

    if (editingGoal) {
      updateGoal(editingGoal.id, goalData)
      toast({
        title: "Meta atualizada",
        description: "A meta foi atualizada com sucesso.",
      })
    } else {
      saveGoal(goalData)
      toast({
        title: "Meta criada",
        description: "A meta foi criada com sucesso.",
      })
    }

    setGoals(getGoals())
    setIsModalOpen(false)
    setEditingGoal(null)
  }

  const handleSubmitContribution = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    if (!selectedGoal) return

    const contribution = {
      amount: Number.parseFloat(formData.get("amount") as string),
      date: new Date().toISOString().split("T")[0],
    }

    addContribution(selectedGoal.id, contribution)
    setGoals(getGoals())
    setIsContributionModalOpen(false)
    setSelectedGoal(null)

    toast({
      title: "Contribuição adicionada",
      description: "A contribuição foi adicionada com sucesso.",
    })
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta meta?")) {
      deleteGoal(id)
      setGoals(getGoals())
      toast({
        title: "Meta excluída",
        description: "A meta foi excluída com sucesso.",
      })
    }
  }

  const handleMarkCompleted = (goal: Goal) => {
    updateGoal(goal.id, { ...goal, isCompleted: true })
    setGoals(getGoals())
    toast({
      title: "Meta concluída",
      description: "Parabéns! Você atingiu sua meta.",
    })
  }

  const openContributionModal = (goal: Goal) => {
    setSelectedGoal(goal)
    setIsContributionModalOpen(true)
  }

  const getDaysRemaining = (deadline: string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 heading-primary">Metas Financeiras</h1>
            <p className="text-slate-600 mt-2 text-lg">Planeje e acompanhe seus objetivos financeiros</p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                className="professional-gradient text-white professional-shadow"
                onClick={() => setEditingGoal(null)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent className="professional-card professional-shadow sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-slate-900">
                  {editingGoal ? "Editar Meta" : "Nova Meta"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitGoal} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-slate-700 font-semibold">
                    Nome da Meta
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    defaultValue={editingGoal?.name || ""}
                    placeholder="Ex: Viagem para Europa"
                    className="professional-border"
                  />
                </div>
                <div>
                  <Label htmlFor="targetAmount" className="text-slate-700 font-semibold">
                    Valor Alvo
                  </Label>
                  <Input
                    id="targetAmount"
                    name="targetAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    defaultValue={editingGoal?.targetAmount || ""}
                    className="professional-border"
                  />
                </div>
                <div>
                  <Label htmlFor="deadline" className="text-slate-700 font-semibold">
                    Prazo
                  </Label>
                  <Input
                    id="deadline"
                    name="deadline"
                    type="date"
                    required
                    defaultValue={editingGoal?.deadline || ""}
                    className="professional-border"
                  />
                </div>
                <Button type="submit" className="w-full professional-gradient text-white professional-shadow">
                  {editingGoal ? "Atualizar" : "Criar"} Meta
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-64 professional-card professional-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="professional-card">
              <SelectItem value="all">Todas as metas</SelectItem>
              <SelectItem value="active">Metas ativas</SelectItem>
              <SelectItem value="completed">Metas concluídas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100
            const daysRemaining = getDaysRemaining(goal.deadline)
            const isOverdue = daysRemaining < 0
            const isCompleted = goal.isCompleted || progress >= 100

            return (
              <Card
                key={goal.id}
                className={`professional-card professional-shadow hover:professional-shadow-lg transition-all duration-300 ${isCompleted ? "border-emerald-200 bg-emerald-50" : ""}`}
              >
                <CardHeader className="border-b border-slate-100 pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-slate-900 heading-secondary flex items-center">
                        {isCompleted ? (
                          <Award className="w-5 h-5 text-emerald-600 mr-2" />
                        ) : (
                          <Target className="w-5 h-5 text-blue-600 mr-2" />
                        )}
                        {goal.name}
                      </CardTitle>
                      <div className="flex items-center text-sm text-slate-500 mt-2">
                        <Clock className="w-4 h-4 mr-1" />
                        {isOverdue ? (
                          <span className="text-red-600 font-semibold">{Math.abs(daysRemaining)} dias em atraso</span>
                        ) : (
                          <span className="font-medium">{daysRemaining} dias restantes</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(goal)}
                        className="professional-border hover:bg-slate-50"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(goal.id)}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-3">
                        <span className="text-slate-600 font-medium">Progresso</span>
                        <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all duration-500 professional-shadow"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 rounded-lg bg-slate-50 border border-slate-200">
                        <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wide">Atual</p>
                        <p className="font-bold text-emerald-600 text-lg">{formatCurrency(goal.currentAmount)}</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-slate-50 border border-slate-200">
                        <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wide">Meta</p>
                        <p className="font-bold text-slate-900 text-lg">{formatCurrency(goal.targetAmount)}</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {!isCompleted && (
                        <Button
                          onClick={() => openContributionModal(goal)}
                          className="flex-1 professional-border hover:bg-slate-50"
                          variant="outline"
                        >
                          <DollarSign className="w-4 h-4 mr-1" />
                          Contribuir
                        </Button>
                      )}
                      {!goal.isCompleted && progress >= 100 && (
                        <Button
                          onClick={() => handleMarkCompleted(goal)}
                          className="flex-1 success-professional text-white professional-shadow"
                        >
                          <Award className="w-4 h-4 mr-1" />
                          Concluir
                        </Button>
                      )}
                    </div>

                    {goal.contributions.length > 0 && (
                      <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                        <p className="text-sm font-semibold mb-3 text-slate-700 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Últimas contribuições:
                        </p>
                        <div className="space-y-2 max-h-24 overflow-y-auto">
                          {goal.contributions
                            .slice(-3)
                            .reverse()
                            .map((contribution) => (
                              <div key={contribution.id} className="flex justify-between text-xs">
                                <span className="text-slate-500 font-medium">
                                  {new Date(contribution.date).toLocaleDateString("pt-BR")}
                                </span>
                                <span className="font-bold text-emerald-600">
                                  +{formatCurrency(contribution.amount)}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Contribution Modal */}
        <Dialog open={isContributionModalOpen} onOpenChange={setIsContributionModalOpen}>
          <DialogContent className="professional-card professional-shadow sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-slate-900">Adicionar Contribuição</DialogTitle>
              {selectedGoal && <p className="text-sm text-slate-600">Meta: {selectedGoal.name}</p>}
            </DialogHeader>
            <form onSubmit={handleSubmitContribution} className="space-y-4">
              <div>
                <Label htmlFor="amount" className="text-slate-700 font-semibold">
                  Valor da Contribuição
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0,00"
                  className="professional-border"
                />
              </div>
              <Button type="submit" className="w-full success-professional text-white professional-shadow">
                <TrendingUp className="w-4 h-4 mr-2" />
                Adicionar Contribuição
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
