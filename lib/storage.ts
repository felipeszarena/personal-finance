export interface Transaction {
  id: string
  amount: number
  type: "income" | "expense"
  category: string
  description: string
  date: string
  createdAt: string
}

export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  isCompleted: boolean
  contributions: {
    id: string
    amount: number
    date: string
  }[]
}

const STORAGE_KEYS = {
  transactions: "finance-app-transactions",
  goals: "finance-app-goals",
}

const generateId = () => Math.random().toString(36).substr(2, 9)

// Transaction functions
export const getTransactions = (): Transaction[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEYS.transactions)
  return stored ? JSON.parse(stored) : []
}

export const saveTransaction = (transaction: Omit<Transaction, "id" | "createdAt">) => {
  const transactions = getTransactions()
  const newTransaction: Transaction = {
    ...transaction,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  transactions.push(newTransaction)
  localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions))
}

export const updateTransaction = (id: string, updates: Partial<Transaction>) => {
  const transactions = getTransactions()
  const index = transactions.findIndex((t) => t.id === id)
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updates }
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions))
  }
}

export const deleteTransaction = (id: string) => {
  const transactions = getTransactions()
  const filtered = transactions.filter((t) => t.id !== id)
  localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(filtered))
}

// Goal functions
export const getGoals = (): Goal[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEYS.goals)
  return stored ? JSON.parse(stored) : []
}

export const saveGoal = (goal: Omit<Goal, "id" | "currentAmount" | "isCompleted" | "contributions">) => {
  const goals = getGoals()
  const newGoal: Goal = {
    ...goal,
    id: generateId(),
    currentAmount: 0,
    isCompleted: false,
    contributions: [],
  }
  goals.push(newGoal)
  localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(goals))
}

export const updateGoal = (id: string, updates: Partial<Goal>) => {
  const goals = getGoals()
  const index = goals.findIndex((g) => g.id === id)
  if (index !== -1) {
    goals[index] = { ...goals[index], ...updates }
    localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(goals))
  }
}

export const deleteGoal = (id: string) => {
  const goals = getGoals()
  const filtered = goals.filter((g) => g.id !== id)
  localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(filtered))
}

export const addContribution = (goalId: string, contribution: Omit<Goal["contributions"][0], "id">) => {
  const goals = getGoals()
  const goal = goals.find((g) => g.id === goalId)
  if (goal) {
    const newContribution = {
      ...contribution,
      id: generateId(),
    }
    goal.contributions.push(newContribution)
    goal.currentAmount += contribution.amount
    localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(goals))
  }
}
