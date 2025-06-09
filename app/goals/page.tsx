"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Plus, Target, Calendar, DollarSign, Edit, Trash2, TrendingUp } from "lucide-react"
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

      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Metas Financeiras</h1>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setEditingGoal(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingGoal ? "Editar Meta" : "Nova Meta"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitGoal} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome da Meta</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    defaultValue={editingGoal?.name || ""}
                    placeholder="Ex: Viagem para Europa"
                  />
                </div>
                <div>
                  <Label htmlFor="targetAmount">Valor Alvo</Label>
                  <Input
                    id="targetAmount"
                    name="targetAmount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    defaultValue={editingGoal?.targetAmount || ""}
                  />
                </div>
                <div>
                  <Label htmlFor="deadline">Prazo</Label>
                  <Input
                    id="deadline"
                    name="deadline"
                    type="date"
                    required
                    defaultValue={editingGoal?.deadline || ""}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingGoal ? "Atualizar" : "Criar"} Meta
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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
              <Card key={goal.id} className={`${isCompleted ? "border-green-500 bg-green-50" : ""}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{goal.name}</CardTitle>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        {isOverdue ? (
                          <span className="text-red-600">{Math.abs(daysRemaining)} dias em atraso</span>
                        ) : (
                          <span>{daysRemaining} dias restantes</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(goal)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(goal.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progresso</span>
                        <span className="font-semibold">{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={Math.min(progress, 100)} className="h-3" />
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Atual</p>
                        <p className="font-bold text-green-600">{formatCurrency(goal.currentAmount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Meta</p>
                        <p className="font-bold">{formatCurrency(goal.targetAmount)}</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {!isCompleted && (
                        <Button onClick={() => openContributionModal(goal)} className="flex-1" variant="outline">
                          <DollarSign className="w-4 h-4 mr-1" />
                          Contribuir
                        </Button>
                      )}
                      {!goal.isCompleted && progress >= 100 && (
                        <Button
                          onClick={() => handleMarkCompleted(goal)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <Target className="w-4 h-4 mr-1" />
                          Concluir
                        </Button>
                      )}
                    </div>

                    {goal.contributions.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Últimas contribuições:</p>
                        <div className="space-y-1 max-h-20 overflow-y-auto">
                          {goal.contributions
                            .slice(-3)
                            .reverse()
                            .map((contribution) => (
                              <div key={contribution.id} className="flex justify-between text-xs">
                                <span>{new Date(contribution.date).toLocaleDateString("pt-BR")}</span>
                                <span className="font-medium text-green-600">
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
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Contribuição</DialogTitle>
              {selectedGoal && <p className="text-sm text-gray-500">Meta: {selectedGoal.name}</p>}
            </DialogHeader>
            <form onSubmit={handleSubmitContribution} className="space-y-4">
              <div>
                <Label htmlFor="amount">Valor da Contribuição</Label>
                <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required placeholder="0,00" />
              </div>
              <Button type="submit" className="w-full">
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
