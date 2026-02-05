import { addMonths, format, isSameMonth, isSameWeek, parseISO, startOfMonth } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Order, Expense, KPIData } from '../types';

const CATEGORY_COLORS: Record<string, string> = {
  fuel: '#f59e0b',
  leasing: '#6366f1',
  maintenance: '#10b981',
  repair: '#22c55e',
  salary: '#3b82f6',
  fine: '#ef4444',
  other: '#8b5cf6',
};

const CATEGORY_LABELS: Record<string, string> = {
  fuel: 'Топливо',
  leasing: 'Лизинг',
  maintenance: 'ТО',
  repair: 'Ремонт',
  salary: 'Зарплаты',
  fine: 'Штрафы',
  other: 'Прочее',
};

export const calculateKPI = (orders: Order[], expenses: Expense[]): KPIData => {
  const now = new Date();
  const weeklyIncome = orders
    .filter(order => isSameWeek(parseISO(order.date), now, { weekStartsOn: 1 }))
    .reduce((sum, order) => sum + order.cost, 0);
  const monthlyIncome = orders
    .filter(order => isSameMonth(parseISO(order.date), now))
    .reduce((sum, order) => sum + order.cost, 0);
  const weeklyExpenses = expenses
    .filter(expense => isSameWeek(parseISO(expense.date), now, { weekStartsOn: 1 }))
    .reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyExpenses = expenses
    .filter(expense => isSameMonth(parseISO(expense.date), now))
    .reduce((sum, expense) => sum + expense.amount, 0);

  const totalProfit = orders.reduce((sum, order) => sum + order.profit, 0) - expenses.reduce((sum, e) => sum + e.amount, 0);
  const budgetRemaining = monthlyIncome - monthlyExpenses;

  return {
    weeklyIncome,
    monthlyIncome,
    weeklyExpenses,
    monthlyExpenses,
    budgetRemaining,
    totalProfit,
  };
};

export const buildMonthlySeries = (
  orders: Order[],
  expenses: Expense[],
  monthsBack: number
) => {
  const now = startOfMonth(new Date());
  return Array.from({ length: monthsBack }).map((_, index) => {
    const monthDate = addMonths(now, -(monthsBack - 1 - index));
    const monthLabel = format(monthDate, 'LLL', { locale: ru });
    const income = orders
      .filter(order => isSameMonth(parseISO(order.date), monthDate))
      .reduce((sum, order) => sum + order.cost, 0);
    const expenseTotal = expenses
      .filter(expense => isSameMonth(parseISO(expense.date), monthDate))
      .reduce((sum, expense) => sum + expense.amount, 0);
    return {
      month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
      income,
      expenses: expenseTotal,
    };
  });
};

export const buildExpenseCategories = (expenses: Expense[]) => {
  const totals = expenses.reduce<Record<string, number>>((acc, expense) => {
    acc[expense.type] = (acc[expense.type] || 0) + expense.amount;
    return acc;
  }, {});

  return Object.entries(totals).map(([type, value]) => ({
    name: CATEGORY_LABELS[type] || 'Прочее',
    value,
    color: CATEGORY_COLORS[type] || CATEGORY_COLORS.other,
  }));
};

export const getFuelLiters = (expense: Expense) => {
  if (expense.type !== 'fuel') return 0;
  if (typeof expense.liters === 'number') return expense.liters;
  const assumedPrice = expense.pricePerLiter || 60;
  return expense.amount / assumedPrice;
};

export const getAverageFuelPer100Km = (orders: Order[], expenses: Expense[]) => {
  const totalDistance = orders.reduce((sum, order) => sum + order.distance, 0);
  if (totalDistance === 0) return 0;
  const totalLiters = expenses.reduce((sum, expense) => sum + getFuelLiters(expense), 0);
  return (totalLiters / totalDistance) * 100;
};

export const getNearestPayment = (payments: { date: string; status: string }[]) => {
  const upcoming = payments
    .filter(payment => payment.status !== 'paid')
    .sort((a, b) => a.date.localeCompare(b.date));
  return upcoming[0] || null;
};
