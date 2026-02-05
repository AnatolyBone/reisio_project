import { Order, Expense, Payment, Reminder } from '../types';

export const seedOrders: Order[] = [
  { id: '1', date: '2024-01-15', client: 'ООО Логистик', route: 'Москва - Санкт-Петербург', distance: 720, cost: 45000, fuelExpense: 12000, profit: 33000 },
  { id: '2', date: '2024-01-14', client: 'ИП Сидоров', route: 'Казань - Нижний Новгород', distance: 390, cost: 28000, fuelExpense: 7500, profit: 20500 },
  { id: '3', date: '2024-01-13', client: 'АО ТрансЭкспресс', route: 'Москва - Воронеж', distance: 520, cost: 35000, fuelExpense: 9800, profit: 25200 },
  { id: '4', date: '2024-01-12', client: 'ООО Грузовик', route: 'Тула - Рязань', distance: 180, cost: 15000, fuelExpense: 3500, profit: 11500 },
  { id: '5', date: '2024-01-11', client: 'ООО Север', route: 'Москва - Ярославль', distance: 280, cost: 22000, fuelExpense: 5200, profit: 16800 },
  { id: '6', date: '2024-01-10', client: 'ИП Кузнецов', route: 'Владимир - Иваново', distance: 110, cost: 12000, fuelExpense: 2200, profit: 9800 },
  { id: '7', date: '2024-01-09', client: 'ООО Логистик', route: 'Санкт-Петербург - Москва', distance: 720, cost: 48000, fuelExpense: 12500, profit: 35500 },
  { id: '8', date: '2024-01-08', client: 'АО Карго', route: 'Москва - Тверь', distance: 170, cost: 14000, fuelExpense: 3200, profit: 10800 },
];

export const seedExpenses: Expense[] = [
  { id: '1', date: '2024-01-15', type: 'fuel', amount: 12000, description: 'Заправка АЗС Лукойл', liters: 200, pricePerLiter: 60 },
  { id: '2', date: '2024-01-14', type: 'fuel', amount: 8500, description: 'Заправка АЗС Газпром', liters: 140, pricePerLiter: 60 },
  { id: '3', date: '2024-01-13', type: 'maintenance', amount: 15000, description: 'Замена масла и фильтров' },
  { id: '4', date: '2024-01-12', type: 'fine', amount: 3000, description: 'Штраф за превышение скорости' },
  { id: '5', date: '2024-01-10', type: 'leasing', amount: 85000, description: 'Ежемесячный платеж' },
  { id: '6', date: '2024-01-08', type: 'repair', amount: 25000, description: 'Ремонт тормозной системы' },
  { id: '7', date: '2024-01-07', type: 'fuel', amount: 11000, description: 'Заправка АЗС Роснефть', liters: 180, pricePerLiter: 61 },
  { id: '8', date: '2024-01-05', type: 'salary', amount: 50000, description: 'Зарплата водителю' },
];

export const seedPayments: Payment[] = [
  { id: '1', date: '2024-01-25', type: 'leasing', amount: 85000, status: 'pending', description: 'Лизинг MAN TGX' },
  { id: '2', date: '2024-01-20', type: 'insurance', amount: 12000, status: 'pending', description: 'ОСАГО' },
  { id: '3', date: '2024-02-10', type: 'leasing', amount: 85000, status: 'pending', description: 'Лизинг MAN TGX' },
  { id: '4', date: '2024-01-05', type: 'leasing', amount: 85000, status: 'paid', description: 'Лизинг MAN TGX' },
  { id: '5', date: '2023-12-25', type: 'tax', amount: 25000, status: 'overdue', description: 'Транспортный налог' },
  { id: '6', date: '2024-02-01', type: 'insurance', amount: 45000, status: 'pending', description: 'КАСКО' },
];

export const seedReminders: Reminder[] = [
  { id: '1', type: 'leasing', title: 'Платёж по лизингу', dueDate: '2024-01-25', amount: 85000 },
  { id: '2', type: 'maintenance', title: 'ТО-2 через 500 км', dueDate: '2024-01-28' },
  { id: '3', type: 'fine', title: 'Оплата штрафа', dueDate: '2024-01-22', amount: 3000 },
  { id: '4', type: 'insurance', title: 'Продление ОСАГО', dueDate: '2024-02-15', amount: 12000 },
];
