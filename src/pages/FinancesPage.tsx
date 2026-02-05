import { useMemo, useState } from 'react';
import { Download, Filter, FileSpreadsheet, FileText } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { cn } from '../utils/cn';
import { useData } from '../context/DataContext';
import { buildExpenseCategories } from '../utils/analytics';
import { parseISO, startOfMonth, addMonths, format, isSameMonth } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Modal } from '../components/Modal';
import { Expense } from '../types';

type Period = 'week' | 'month' | 'quarter' | 'year';

export function FinancesPage() {
  const { orders, expenses } = useData();
  const [period, setPeriod] = useState<Period>('month');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [orderQuery, setOrderQuery] = useState('');
  const [selectedExpenseTypes, setSelectedExpenseTypes] = useState<Expense['type'][]>([
    'fuel',
    'maintenance',
    'fine',
    'repair',
    'leasing',
    'salary',
    'other',
  ]);
  const [monthFrom, setMonthFrom] = useState('');
  const [monthTo, setMonthTo] = useState('');
  const expenseTypeLabels: Record<Expense['type'], string> = {
    fuel: 'Топливо',
    maintenance: 'ТО',
    fine: 'Штрафы',
    repair: 'Ремонт',
    leasing: 'Лизинг',
    salary: 'Зарплаты',
    other: 'Прочее',
  };

  const periods: { id: Period; label: string }[] = [
    { id: 'week', label: 'Неделя' },
    { id: 'month', label: 'Месяц' },
    { id: 'quarter', label: 'Квартал' },
    { id: 'year', label: 'Год' },
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesQuery =
        order.client.toLowerCase().includes(orderQuery.toLowerCase()) ||
        order.route.toLowerCase().includes(orderQuery.toLowerCase());
      if (!matchesQuery) return false;
      if (!monthFrom && !monthTo) return true;
      const orderDate = parseISO(order.date);
      const fromDate = monthFrom ? parseISO(`${monthFrom}-01`) : null;
      const toDate = monthTo ? parseISO(`${monthTo}-01`) : null;
      if (fromDate && orderDate < fromDate) return false;
      if (toDate && orderDate > addMonths(toDate, 1)) return false;
      return true;
    });
  }, [orders, orderQuery, monthFrom, monthTo]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      if (!selectedExpenseTypes.includes(expense.type)) return false;
      if (!monthFrom && !monthTo) return true;
      const expenseDate = parseISO(expense.date);
      const fromDate = monthFrom ? parseISO(`${monthFrom}-01`) : null;
      const toDate = monthTo ? parseISO(`${monthTo}-01`) : null;
      if (fromDate && expenseDate < fromDate) return false;
      if (toDate && expenseDate > addMonths(toDate, 1)) return false;
      return true;
    });
  }, [expenses, selectedExpenseTypes, monthFrom, monthTo]);

  const availableMonths = useMemo(() => {
    const allDates = [...orders.map(o => o.date), ...expenses.map(e => e.date)];
    const months = Array.from(new Set(allDates.map(date => date.slice(0, 7))));
    return months.sort();
  }, [orders, expenses]);

  const filteredSeries = useMemo(() => {
    if (!monthFrom && !monthTo) {
      const monthsBack = period === 'week' ? 1 : period === 'month' ? 6 : period === 'quarter' ? 9 : 12;
      const now = startOfMonth(new Date());
      return Array.from({ length: monthsBack }).map((_, index) => {
        const monthDate = addMonths(now, -(monthsBack - 1 - index));
        const income = filteredOrders
          .filter(order => isSameMonth(parseISO(order.date), monthDate))
          .reduce((sum, order) => sum + order.cost, 0);
        const expenseTotal = filteredExpenses
          .filter(expense => isSameMonth(parseISO(expense.date), monthDate))
          .reduce((sum, expense) => sum + expense.amount, 0);
        return {
          month: format(monthDate, 'LLL', { locale: ru }).replace('.', ''),
          income,
          expenses: expenseTotal,
        };
      });
    }
    if (!availableMonths.length) return [];
    const from = monthFrom ? parseISO(`${monthFrom}-01`) : parseISO(`${availableMonths[0]}-01`);
    const to = monthTo ? parseISO(`${monthTo}-01`) : from;
    const monthsCount = Math.max(1, (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth()) + 1);
    return Array.from({ length: monthsCount }).map((_, index) => {
      const monthDate = addMonths(from, index);
      const income = filteredOrders
        .filter(order => isSameMonth(parseISO(order.date), monthDate))
        .reduce((sum, order) => sum + order.cost, 0);
      const expenseTotal = filteredExpenses
        .filter(expense => isSameMonth(parseISO(expense.date), monthDate))
        .reduce((sum, expense) => sum + expense.amount, 0);
      return {
        month: format(monthDate, 'LLL', { locale: ru }).replace('.', ''),
        income,
        expenses: expenseTotal,
      };
    });
  }, [availableMonths, filteredOrders, filteredExpenses, monthFrom, monthTo, period]);

  const expensesByCategory = useMemo(
    () => buildExpenseCategories(filteredExpenses),
    [filteredExpenses]
  );

  const totalIncome = filteredSeries.reduce((sum, d) => sum + d.income, 0);
  const totalExpenses = filteredSeries.reduce((sum, d) => sum + d.expenses, 0);
  const totalProfit = totalIncome - totalExpenses;

  const handleExportCsv = () => {
    const lines = [
      ['Дата', 'Тип', 'Описание', 'Сумма'].join(';'),
      ...filteredExpenses.map(expense => [
        expense.date,
        expense.type,
        expense.description,
        expense.amount,
      ].join(';')),
      '',
      ['Дата', 'Клиент', 'Маршрут', 'Стоимость', 'Расход топлива', 'Прибыль'].join(';'),
      ...filteredOrders.map(order => [
        order.date,
        order.client,
        order.route,
        order.cost,
        order.fuelExpense,
        order.profit,
      ].join(';')),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'finance-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Финансовая сводка
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Анализ доходов и расходов
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Фильтр</span>
          </button>
          <button
            onClick={() => setExportOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Экспорт</span>
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {periods.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              period === p.id
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 border border-green-100 dark:border-green-800">
          <p className="text-sm text-green-600 dark:text-green-400 mb-1">Общий доход</p>
          <p className="text-xl lg:text-2xl font-bold text-green-700 dark:text-green-300">
            {(totalIncome / 1000000).toFixed(2)}M ₽
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 border border-red-100 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400 mb-1">Общие расходы</p>
          <p className="text-xl lg:text-2xl font-bold text-red-700 dark:text-red-300">
            {(totalExpenses / 1000000).toFixed(2)}M ₽
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-800">
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Чистая прибыль</p>
          <p className="text-xl lg:text-2xl font-bold text-blue-700 dark:text-blue-300">
            {(totalProfit / 1000000).toFixed(2)}M ₽
          </p>
        </div>
      </div>

      {/* Income/Expenses Chart */}
      <div className="bg-white dark:bg-gray-800 neutral:bg-stone-50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Доходы и расходы по месяцам
          </h2>
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => setChartType('bar')}
              className={cn(
                "px-3 py-1.5 rounded text-xs font-medium transition-all",
                chartType === 'bar'
                  ? "bg-white dark:bg-gray-600 shadow-sm"
                  : "text-gray-600 dark:text-gray-400"
              )}
            >
              Столбцы
            </button>
            <button
              onClick={() => setChartType('line')}
              className={cn(
                "px-3 py-1.5 rounded text-xs font-medium transition-all",
                chartType === 'line'
                  ? "bg-white dark:bg-gray-600 shadow-sm"
                  : "text-gray-600 dark:text-gray-400"
              )}
            >
              Линии
            </button>
          </div>
        </div>
        <div className="h-64 lg:h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={filteredSeries} barGap={8}>
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickFormatter={(value) => `${value / 1000}K`}
                />
                <Tooltip 
                  formatter={(value) => [`${Number(value).toLocaleString('ru-RU')} ₽`]}
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Доход" />
                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Расходы" />
              </BarChart>
            ) : (
              <LineChart data={filteredSeries}>
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickFormatter={(value) => `${value / 1000}K`}
                />
                <Tooltip 
                  formatter={(value) => [`${Number(value).toLocaleString('ru-RU')} ₽`]}
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 0 }}
                  name="Доход" 
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', strokeWidth: 0 }}
                  name="Расходы" 
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Доходы</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Расходы</span>
          </div>
        </div>
      </div>

      {/* Expenses by Category */}
      <div className="bg-white dark:bg-gray-800 neutral:bg-stone-50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-6">
          Структура расходов
        </h2>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="w-full lg:w-1/2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${Number(value).toLocaleString('ru-RU')} ₽`]}
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full lg:w-1/2 space-y-3">
            {expensesByCategory.map((category) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-gray-700 dark:text-gray-300">{category.name}</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {category.value.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        title="Фильтры"
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setFiltersOpen(false)}
              className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300"
            >
              Закрыть
            </button>
            <button
              onClick={() => {
                setOrderQuery('');
                setMonthFrom('');
                setMonthTo('');
                setSelectedExpenseTypes(['fuel','maintenance','fine','repair','leasing','salary','other']);
                setFiltersOpen(false);
              }}
              className="px-4 py-2 rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900"
            >
              Сбросить
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">Поиск по заказам</label>
            <input
              type="text"
              placeholder="Клиент или маршрут"
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              className="mt-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">Месяц от</label>
              <select
                value={monthFrom}
                onChange={(e) => setMonthFrom(e.target.value)}
                className="mt-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="">Любой</option>
                {availableMonths.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">Месяц до</label>
              <select
                value={monthTo}
                onChange={(e) => setMonthTo(e.target.value)}
                className="mt-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="">Любой</option>
                {availableMonths.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">Типы расходов</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {(['fuel','maintenance','fine','repair','leasing','salary','other'] as Expense['type'][]).map(type => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedExpenseTypes(prev => 
                      prev.includes(type as Expense['type'])
                        ? prev.filter(item => item !== type)
                        : [...prev, type as Expense['type']]
                    );
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm border",
                    selectedExpenseTypes.includes(type as Expense['type'])
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600"
                  )}
                >
                  {expenseTypeLabels[type]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <FileSpreadsheet className="w-4 h-4" />
            Экспорт выгружает текущий фильтр.
            <FileText className="w-4 h-4 ml-2" />
            PDF доступен через печать браузера.
          </div>
        </div>
      </Modal>

      <Modal
        title="Экспорт отчета"
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setExportOpen(false)}
              className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300"
            >
              Закрыть
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <button
            onClick={() => {
              handleExportCsv();
              setExportOpen(false);
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
          >
            Экспорт в CSV (Excel)
            <FileSpreadsheet className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              window.print();
              setExportOpen(false);
            }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
          >
            Экспорт в PDF (печать)
            <FileText className="w-4 h-4" />
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Экспорт учитывает текущие фильтры.
          </p>
        </div>
      </Modal>
    </div>
  );
}
