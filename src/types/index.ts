export interface Order {
  id: string;
  date: string;
  client: string;
  route: string;
  distance: number;
  cost: number;
  fuelExpense: number;
  profit: number;
}

export interface Expense {
  id: string;
  date: string;
  type: 'fuel' | 'maintenance' | 'fine' | 'repair' | 'leasing' | 'salary' | 'other';
  amount: number;
  description: string;
  liters?: number;
  pricePerLiter?: number;
}

export interface Payment {
  id: string;
  date: string;
  type: 'leasing' | 'insurance' | 'tax' | 'repair' | 'other';
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  description: string;
}

export interface Reminder {
  id: string;
  type: 'leasing' | 'maintenance' | 'fine' | 'insurance';
  title: string;
  dueDate: string;
  amount?: number;
}

export interface KPIData {
  weeklyIncome: number;
  monthlyIncome: number;
  weeklyExpenses: number;
  monthlyExpenses: number;
  budgetRemaining: number;
  totalProfit: number;
}

export type Theme = 'light' | 'dark' | 'neutral';

export interface Settings {
  theme: Theme;
  notifications: boolean;
  reportPeriod: 'weekly' | 'monthly' | 'quarterly';
}
