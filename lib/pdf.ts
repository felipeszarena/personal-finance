import jsPDF from "jspdf"
import type { Transaction, Goal } from "./storage"

export const generatePDF = (transactions: Transaction[], goals: Goal[], filters: { period: string }) => {
  const pdf = new jsPDF()

  // Header
  pdf.setFontSize(20)
  pdf.text("Relatório Financeiro Pessoal", 20, 30)

  // Period
  pdf.setFontSize(12)
  const periodText =
    filters.period === "month" ? "Último mês" : filters.period === "3months" ? "Últimos 3 meses" : "Último ano"
  pdf.text(`Período: ${periodText}`, 20, 50)
  pdf.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 20, 60)

  // Financial Summary
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpenses

  pdf.setFontSize(14)
  pdf.text("RESUMO FINANCEIRO", 20, 80)
  pdf.setFontSize(12)
  pdf.text(`Receitas: R$ ${totalIncome.toFixed(2)}`, 20, 95)
  pdf.text(`Despesas: R$ ${totalExpenses.toFixed(2)}`, 20, 105)
  pdf.text(`Saldo: R$ ${balance.toFixed(2)}`, 20, 115)

  // Transactions
  pdf.setFontSize(14)
  pdf.text("TRANSAÇÕES", 20, 135)

  let y = 150
  pdf.setFontSize(10)

  transactions.slice(0, 20).forEach((transaction) => {
    if (y > 270) {
      pdf.addPage()
      y = 30
    }

    const sign = transaction.type === "income" ? "+" : "-"
    const text = `${transaction.date} | ${sign}R$ ${transaction.amount.toFixed(2)} | ${transaction.category} | ${transaction.description}`
    pdf.text(text, 20, y)
    y += 8
  })

  // Goals
  if (goals.length > 0) {
    if (y > 200) {
      pdf.addPage()
      y = 30
    }

    pdf.setFontSize(14)
    pdf.text("METAS FINANCEIRAS", 20, y)
    y += 15

    pdf.setFontSize(10)
    goals.forEach((goal) => {
      if (y > 270) {
        pdf.addPage()
        y = 30
      }

      const progress = ((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)
      pdf.text(
        `${goal.name}: R$ ${goal.currentAmount.toFixed(2)} / R$ ${goal.targetAmount.toFixed(2)} (${progress}%)`,
        20,
        y,
      )
      y += 8
    })
  }

  pdf.save(`relatorio-financeiro-${new Date().toISOString().split("T")[0]}.pdf`)
}
