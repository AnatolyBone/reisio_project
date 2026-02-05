import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Order, Expense, Payment, Reminder, KPIData } from '../types';
import {
  buildExpenseCategories,
  buildMonthlySeries,
  calculateKPI,
} from '../utils/analytics';
import { useAuth } from './AuthContext';

interface AppData {
  orders: Order[];
  expenses: Expense[];
  payments: Payment[];
  reminders: Reminder[];
}

interface DataContextType {
  orders: Order[];
  expenses: Expense[];
  payments: Payment[];
  reminders: Reminder[];
  kpi: KPIData;
  monthlyIncomeData: { month: string; income: number; expenses: number }[];
  expensesByCategory: { name: string; value: number; color: string }[];
  addOrder: (order: Order) => void;
  updateOrder: (order: Order) => void;
  deleteOrder: (id: string) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  addPayment: (payment: Payment) => void;
  updatePayment: (payment: Payment) => void;
  deletePayment: (id: string) => void;
  addReminder: (reminder: Reminder) => void;
  updateReminder: (reminder: Reminder) => void;
  deleteReminder: (id: string) => void;
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const DATA_KEY = 'fa_data_v1';

const getInitialData = (): AppData => ({
  orders: [],
  expenses: [],
  payments: [],
  reminders: [],
});

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = useState<AppData>(getInitialData);

  useEffect(() => {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    const token = localStorage.getItem('fa_token');
    if (!token || !user) return;
    const migrated = localStorage.getItem('fa_migrated');
    if (!migrated) {
      fetch(`${import.meta.env.VITE_API_BASE || '/api'}/import-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }).then(() => {
        localStorage.setItem('fa_migrated', 'true');
      });
    }
  }, [user, data]);

  useEffect(() => {
    const token = localStorage.getItem('fa_token');
    if (!token || !user) return;
    const API_BASE = import.meta.env.VITE_API_BASE || '/api';
    Promise.all([
      fetch(`${API_BASE}/orders`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_BASE}/expenses`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_BASE}/payments`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_BASE}/reminders`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([ordersData, expensesData, paymentsData, remindersData]) => {
      setData({
        orders: Array.isArray(ordersData?.orders) ? ordersData.orders : [],
        expenses: Array.isArray(expensesData?.expenses) ? expensesData.expenses : [],
        payments: Array.isArray(paymentsData?.payments) ? paymentsData.payments : [],
        reminders: Array.isArray(remindersData?.reminders) ? remindersData.reminders : [],
      });
    });
  }, [user]);

  const kpi = useMemo(() => calculateKPI(data.orders, data.expenses), [data.orders, data.expenses]);
  const monthlyIncomeData = useMemo(
    () => buildMonthlySeries(data.orders, data.expenses, 6),
    [data.orders, data.expenses]
  );
  const expensesByCategory = useMemo(
    () => buildExpenseCategories(data.expenses),
    [data.expenses]
  );

  const addOrder = (order: Order) => {
    const token = localStorage.getItem('fa_token');
    const API_BASE = import.meta.env.VITE_API_BASE || '/api';
    if (!token) return;
    fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(order),
    })
      .then(res => res.json())
      .then(data => {
        if (data.order) {
          setData(prev => ({ ...prev, orders: [data.order, ...prev.orders] }));
        }
      });
  };
  const updateOrder = (order: Order) => {
    const token = localStorage.getItem('fa_token');
    const API_BASE = import.meta.env.VITE_API_BASE || '/api';
    if (!token) return;
    fetch(`${API_BASE}/orders`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(order),
    })
      .then(res => res.json())
      .then(data => {
        if (data.order) {
          setData(prev => ({
            ...prev,
            orders: prev.orders.map(item => (item.id === data.order.id ? data.order : item)),
          }));
        }
      });
  };
  const deleteOrder = (id: string) => {
    const token = localStorage.getItem('fa_token');
    const API_BASE = import.meta.env.VITE_API_BASE || '/api';
    if (!token) return;
    fetch(`${API_BASE}/orders`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    }).then(() => {
      setData(prev => ({ ...prev, orders: prev.orders.filter(item => item.id !== id) }));
    });
  };

  const addExpense = (expense: Expense) => {
    const token = localStorage.getItem('fa_token');
    const API_BASE = import.meta.env.VITE_API_BASE || '/api';
    if (!token) return;
    fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(expense),
    })
      .then(res => res.json())
      .then(data => {
        if (data.expense) {
          setData(prev => ({ ...prev, expenses: [data.expense, ...prev.expenses] }));
        }
      });
  };
  const updateExpense = (expense: Expense) => {
    const token = localStorage.getItem('fa_token');
    const API_BASE = import.meta.env.VITE_API_BASE || '/api';
    if (!token) return;
    fetch(`${API_BASE}/expenses`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(expense),
    })
      .then(res => res.json())
      .then(data => {
        if (data.expense) {
          setData(prev => ({
            ...prev,
            expenses: prev.expenses.map(item => (item.id === data.expense.id ? data.expense : item)),
          }));
        }
      });
  };
  const deleteExpense = (id: string) => {
    const token = localStorage.getItem('fa_token');
    const API_BASE = import.meta.env.VITE_API_BASE || '/api';
    if (!token) return;
    fetch(`${API_BASE}/expenses`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    }).then(() => {
      setData(prev => ({ ...prev, expenses: prev.expenses.filter(item => item.id !== id) }));
    });
  };

  const addPayment = (payment: Payment) => {
    const token = localStorage.getItem('fa_token');
    const API_BASE = import.meta.env.VITE_API_BASE || '/api';
    if (!token) return;
    fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payment),
    })
      .then(res => res.json())
      .then(data => {
        if (data.payment) {
          setData(prev => ({ ...prev, payments: [data.payment, ...prev.payments] }));
        }
      });
  };
  const updatePayment = (payment: Payment) => {
    const token = localStorage.getItem('fa_token');
    const API_BASE = import.meta.env.VITE_API_BASE || '/api';
    if (!token) return;
    fetch(`${API_BASE}/payments`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payment),
    })
      .then(res => res.json())
      .then(data => {
        if (data.payment) {
          setData(prev => ({
            ...prev,
            payments: prev.payments.map(item => (item.id === data.payment.id ? data.payment : item)),
          }));
        }
      });
  };
  const deletePayment = (id: string) => {
    const token = localStorage.getItem('fa_token');
    const API_BASE = import.meta.env.VITE_API_BASE || '/api';
    if (!token) return;
    fetch(`${API_BASE}/payments`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    }).then(() => {
      setData(prev => ({ ...prev, payments: prev.payments.filter(item => item.id !== id) }));
    });
  };

  const fetchReminders = () => {
    const token = localStorage.getItem('fa_token');
    const API_BASE = import.meta.env.VITE_API_BASE || '/api';
    if (!token || !user) return;
    fetch(`${API_BASE}/reminders`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data?.reminders) ? data.reminders : [];
        setData(prev => ({ ...prev, reminders: list }));
      });
  };

  const addReminder = (reminder: Reminder) => {
    const token = localStorage.getItem('fa_token');
    const API_BASE = import.meta.env.VITE_API_BASE || '/api';
    if (!token) return;
    fetch(`${API_BASE}/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(reminder),
    })
      .then(res => res.json())
      .then(data => {
        if (data.reminder) {
          setData(prev => ({ ...prev, reminders: [data.reminder, ...prev.reminders] }));
        }
        fetchReminders();
      })
      .catch(() => fetchReminders());
  };
  const updateReminder = (reminder: Reminder) => {
    const token = localStorage.getItem('fa_token');
    const API_BASE = import.meta.env.VITE_API_BASE || '/api';
    if (!token) return;
    fetch(`${API_BASE}/reminders`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(reminder),
    })
      .then(res => res.json())
      .then(data => {
        if (data.reminder) {
          setData(prev => ({
            ...prev,
            reminders: prev.reminders.map(item => (item.id === data.reminder.id ? data.reminder : item)),
          }));
        }
        fetchReminders();
      })
      .catch(() => fetchReminders());
  };
  const deleteReminder = (id: string) => {
    const token = localStorage.getItem('fa_token');
    const API_BASE = import.meta.env.VITE_API_BASE || '/api';
    if (!token) return;
    fetch(`${API_BASE}/reminders`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    }).then(() => {
      setData(prev => ({ ...prev, reminders: prev.reminders.filter(item => item.id !== id) }));
      fetchReminders();
    }).catch(() => fetchReminders());
  };

  const resetData = () => setData(getInitialData());

  return (
    <DataContext.Provider
      value={{
        orders: data.orders,
        expenses: data.expenses,
        payments: data.payments,
        reminders: data.reminders,
        kpi,
        monthlyIncomeData,
        expensesByCategory,
        addOrder,
        updateOrder,
        deleteOrder,
        addExpense,
        updateExpense,
        deleteExpense,
        addPayment,
        updatePayment,
        deletePayment,
        addReminder,
        updateReminder,
        deleteReminder,
        resetData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
