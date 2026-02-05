import { Order, Expense, Payment, Reminder, KPIData } from '../types';

export const mockUser = {
  name: 'Александр',
  role: 'driver' as const,
};

export const mockKPI: KPIData = {
  weeklyIncome: 185000,
  monthlyIncome: 742000,
  weeklyExpenses: 68000,
  monthlyExpenses: 285000,
  budgetRemaining: 457000,
  totalProfit: 457000,
};

export const mockOrders: Order[] = [
  { id: '1', date: '2024-01-15', client: 'ООО Логистик', route: 'Москва - Санкт-Петербург', distance: 720, cost: 45000, fuelExpense: 12000, profit: 33000 },
  { id: '2', date: '2024-01-14', client: 'ИП Сидоров', route: 'Казань - Нижний Новгород', distance: 390, cost: 28000, fuelExpense: 7500, profit: 20500 },
  { id: '3', date: '2024-01-13', client: 'АО ТрансЭкспресс', route: 'Москва - Воронеж', distance: 520, cost: 35000, fuelExpense: 9800, profit: 25200 },
  { id: '4', date: '2024-01-12', client: 'ООО Грузовик', route: 'Тула - Рязань', distance: 180, cost: 15000, fuelExpense: 3500, profit: 11500 },
  { id: '5', date: '2024-01-11', client: 'ООО Север', route: 'Москва - Ярославль', distance: 280, cost: 22000, fuelExpense: 5200, profit: 16800 },
  { id: '6', date: '2024-01-10', client: 'ИП Кузнецов', route: 'Владимир - Иваново', distance: 110, cost: 12000, fuelExpense: 2200, profit: 9800 },
  { id: '7', date: '2024-01-09', client: 'ООО Логистик', route: 'Санкт-Петербург - Москва', distance: 720, cost: 48000, fuelExpense: 12500, profit: 35500 },
  { id: '8', date: '2024-01-08', client: 'АО Карго', route: 'Москва - Тверь', distance: 170, cost: 14000, fuelExpense: 3200, profit: 10800 },
];

export const mockExpenses: Expense[] = [
  { id: '1', date: '2024-01-15', type: 'fuel', amount: 12000, description: 'Заправка АЗС Лукойл' },
  { id: '2', date: '2024-01-14', type: 'fuel', amount: 8500, description: 'Заправка АЗС Газпром' },
  { id: '3', date: '2024-01-13', type: 'maintenance', amount: 15000, description: 'Замена масла и фильтров' },
  { id: '4', date: '2024-01-12', type: 'fine', amount: 3000, description: 'Штраф за превышение скорости' },
  { id: '5', date: '2024-01-10', type: 'leasing', amount: 85000, description: 'Ежемесячный платеж' },
  { id: '6', date: '2024-01-08', type: 'repair', amount: 25000, description: 'Ремонт тормозной системы' },
  { id: '7', date: '2024-01-07', type: 'fuel', amount: 11000, description: 'Заправка АЗС Роснефть' },
  { id: '8', date: '2024-01-05', type: 'salary', amount: 50000, description: 'Зарплата водителю' },
];

export const mockPayments: Payment[] = [
  { id: '1', date: '2024-01-25', type: 'leasing', amount: 85000, status: 'pending', description: 'Лизинг MAN TGX' },
  { id: '2', date: '2024-01-20', type: 'insurance', amount: 12000, status: 'pending', description: 'ОСАГО' },
  { id: '3', date: '2024-02-10', type: 'leasing', amount: 85000, status: 'pending', description: 'Лизинг MAN TGX' },
  { id: '4', date: '2024-01-05', type: 'leasing', amount: 85000, status: 'paid', description: 'Лизинг MAN TGX' },
  { id: '5', date: '2023-12-25', type: 'tax', amount: 25000, status: 'overdue', description: 'Транспортный налог' },
  { id: '6', date: '2024-02-01', type: 'insurance', amount: 45000, status: 'pending', description: 'КАСКО' },
];

export const mockReminders: Reminder[] = [
  { id: '1', type: 'leasing', title: 'Платёж по лизингу', dueDate: '2024-01-25', amount: 85000 },
  { id: '2', type: 'maintenance', title: 'ТО-2 через 500 км', dueDate: '2024-01-28' },
  { id: '3', type: 'fine', title: 'Оплата штрафа', dueDate: '2024-01-22', amount: 3000 },
  { id: '4', type: 'insurance', title: 'Продление ОСАГО', dueDate: '2024-02-15', amount: 12000 },
];

export const monthlyIncomeData = [
  { month: 'Авг', income: 580000, expenses: 220000 },
  { month: 'Сен', income: 620000, expenses: 245000 },
  { month: 'Окт', income: 710000, expenses: 280000 },
  { month: 'Ноя', income: 685000, expenses: 260000 },
  { month: 'Дек', income: 790000, expenses: 310000 },
  { month: 'Янв', income: 742000, expenses: 285000 },
];

export const expensesByCategory = [
  { name: 'Топливо', value: 125000, color: '#f59e0b' },
  { name: 'Лизинг', value: 85000, color: '#6366f1' },
  { name: 'ТО и ремонт', value: 40000, color: '#10b981' },
  { name: 'Зарплаты', value: 50000, color: '#3b82f6' },
  { name: 'Штрафы', value: 5000, color: '#ef4444' },
  { name: 'Прочее', value: 15000, color: '#8b5cf6' },
];

export const fuelConsumptionData = [
  { date: '01.01', liters: 320, cost: 18500 },
  { date: '05.01', liters: 285, cost: 16400 },
  { date: '08.01', liters: 410, cost: 23600 },
  { date: '12.01', liters: 350, cost: 20200 },
  { date: '15.01', liters: 290, cost: 16700 },
];
