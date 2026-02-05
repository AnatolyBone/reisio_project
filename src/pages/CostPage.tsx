import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Wallet, Fuel, CreditCard, Wrench, TrendingUp } from 'lucide-react';
import { useData } from '../context/DataContext';
import { cn } from '../utils/cn';
import { parseISO, isSameMonth, isSameWeek } from 'date-fns';

type Period = 'week' | 'month';

export function CostPage() {
  const { orders, expenses } = useData();
  const [period, setPeriod] = useState<Period>('month');
  const today = new Date();

  const filteredOrders = useMemo(() => {
    return orders.filter(order =>
      period === 'week'
        ? isSameWeek(parseISO(order.date), today, { weekStartsOn: 1 })
        : isSameMonth(parseISO(order.date), today)
    );
  }, [orders, period, today]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense =>
      period === 'week'
        ? isSameWeek(parseISO(expense.date), today, { weekStartsOn: 1 })
        : isSameMonth(parseISO(expense.date), today)
    );
  }, [expenses, period, today]);

  const totalIncome = filteredOrders.reduce((sum, order) => sum + order.cost, 0);
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalProfit = totalIncome - totalExpenses;

  const byType = filteredExpenses.reduce<Record<string, number>>((acc, expense) => {
    acc[expense.type] = (acc[expense.type] || 0) + expense.amount;
    return acc;
  }, {});

  const breakdown = [
    { name: 'Топливо', value: byType.fuel || 0, color: '#f59e0b', icon: Fuel },
    { name: 'Лизинг', value: byType.leasing || 0, color: '#6366f1', icon: CreditCard },
    { name: 'ТО и ремонт', value: (byType.maintenance || 0) + (byType.repair || 0), color: '#10b981', icon: Wrench },
    { name: 'Прочие', value: (byType.fine || 0) + (byType.salary || 0) + (byType.other || 0), color: '#8b5cf6', icon: Wallet },
  ];

  const periodLabel = period === 'week' ? 'Неделя' : 'Месяц';

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Себестоимость
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Ключевые затраты и чистая прибыль
          </p>
        </div>
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
          {(['week', 'month'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                period === p
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              {p === 'week' ? 'Неделя' : 'Месяц'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Доходы ({periodLabel})</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {totalIncome.toLocaleString('ru-RU')} ₽
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Расходы ({periodLabel})</p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">
            {totalExpenses.toLocaleString('ru-RU')} ₽
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Чистая прибыль</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {totalProfit.toLocaleString('ru-RU')} ₽
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Себестоимость рейса</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {filteredOrders.length ? Math.round(totalExpenses / filteredOrders.length).toLocaleString('ru-RU') : 0} ₽
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 neutral:bg-stone-50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-6">
          Структура себестоимости
        </h2>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="w-full lg:w-1/2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${Number(value).toLocaleString('ru-RU')} ₽`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full lg:w-1/2 space-y-3">
            {breakdown.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${item.color}20` }}>
                      <Icon className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.value.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-6 h-6" />
          <h3 className="text-lg font-semibold">Фокус на прибыли</h3>
        </div>
        <p className="text-emerald-100 text-sm">
          Основная магия в Mini App: контролируйте себестоимость и сразу видите чистую прибыль.
        </p>
      </div>
    </div>
  );
}
