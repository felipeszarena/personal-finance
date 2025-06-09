// Script to populate the app with sample data for demonstration
const sampleTransactions = [
  {
    id: "trans1",
    amount: 5000,
    type: "income",
    category: "Salário",
    description: "Salário mensal",
    date: "2024-01-15",
    createdAt: "2024-01-15T10:00:00.000Z",
  },
  {
    id: "trans2",
    amount: 1200,
    type: "expense",
    category: "Moradia",
    description: "Aluguel",
    date: "2024-01-05",
    createdAt: "2024-01-05T09:00:00.000Z",
  },
  {
    id: "trans3",
    amount: 300,
    type: "expense",
    category: "Alimentação",
    description: "Supermercado",
    date: "2024-01-10",
    createdAt: "2024-01-10T14:30:00.000Z",
  },
  {
    id: "trans4",
    amount: 150,
    type: "expense",
    category: "Transporte",
    description: "Combustível",
    date: "2024-01-12",
    createdAt: "2024-01-12T16:45:00.000Z",
  },
  {
    id: "trans5",
    amount: 800,
    type: "income",
    category: "Freelance",
    description: "Projeto web",
    date: "2024-01-20",
    createdAt: "2024-01-20T11:15:00.000Z",
  },
]

const sampleGoals = [
  {
    id: "goal1",
    name: "Viagem para Europa",
    targetAmount: 15000,
    currentAmount: 3500,
    deadline: "2024-12-31",
    isCompleted: false,
    contributions: [
      {
        id: "contrib1",
        amount: 1500,
        date: "2024-01-01",
      },
      {
        id: "contrib2",
        amount: 2000,
        date: "2024-01-15",
      },
    ],
  },
  {
    id: "goal2",
    name: "Reserva de Emergência",
    targetAmount: 10000,
    currentAmount: 7500,
    deadline: "2024-06-30",
    isCompleted: false,
    contributions: [
      {
        id: "contrib3",
        amount: 2500,
        date: "2024-01-01",
      },
      {
        id: "contrib4",
        amount: 5000,
        date: "2024-01-10",
      },
    ],
  },
]

// Populate localStorage with sample data
localStorage.setItem("finance-app-transactions", JSON.stringify(sampleTransactions))
localStorage.setItem("finance-app-goals", JSON.stringify(sampleGoals))

console.log("Sample data has been loaded!")
console.log("Transactions:", sampleTransactions.length)
console.log("Goals:", sampleGoals.length)
console.log("Refresh the page to see the data in the app.")
