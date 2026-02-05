import { useEffect, useState } from 'react';
import { Fuel, Wrench, AlertTriangle, Car, CreditCard, Users, MoreHorizontal, Plus, Pencil, Trash2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../context/DataContext';
import { cn } from '../utils/cn';
import { Modal } from '../components/Modal';
import { useNavigation } from '../context/NavigationContext';

type ExpenseType = 'all' | 'fuel' | 'maintenance' | 'fine' | 'repair' | 'leasing' | 'salary' | 'other';

const expenseTypes: { id: ExpenseType; label: string; icon: typeof Fuel; color: string }[] = [
  { id: 'all', label: 'Все', icon: MoreHorizontal, color: 'gray' },
  { id: 'fuel', label: 'Топливо', icon: Fuel, color: 'amber' },
  { id: 'maintenance', label: 'ТО', icon: Wrench, color: 'blue' },
  { id: 'fine', label: 'Штрафы', icon: AlertTriangle, color: 'red' },
  { id: 'repair', label: 'Ремонт', icon: Car, color: 'green' },
  { id: 'leasing', label: 'Лизинг', icon: CreditCard, color: 'purple' },
  { id: 'salary', label: 'Зарплаты', icon: Users, color: 'cyan' },
  { id: 'other', label: 'Прочее', icon: MoreHorizontal, color: 'gray' },
];

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  red: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
  green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
  cyan: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800' },
  gray: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-600' },
};

export function ExpensesPage() {
  const { expenses, expensesByCategory, addExpense, updateExpense, deleteExpense } = useData();
  const { action, clearAction } = useNavigation();
  const [selectedType, setSelectedType] = useState<ExpenseType>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<null | typeof expenses[number]>(null);
  const [form, setForm] = useState({
    date: '',
    type: 'fuel' as ExpenseType,
    amount: '',
    liters: '',
    pricePerLiter: '',
    description: '',
  });

  const filteredExpenses = selectedType === 'all' 
    ? expenses 
    : expenses.filter(e => e.type === selectedType);

  const totalExpenses = expensesByCategory.reduce((sum, c) => sum + c.value, 0);

  useEffect(() => {
    if (action === 'addExpense' || action === 'addFuel') {
      handleOpenModal();
      if (action === 'addFuel') {
        setForm(prev => ({ ...prev, type: 'fuel' }));
      }
      clearAction();
    }
  }, [action, clearAction]);

  const resetForm = () => {
    setForm({
      date: new Date().toISOString().slice(0, 10),
      type: 'fuel',
      amount: '',
      liters: '',
      pricePerLiter: '',
      description: '',
    });
  };

  const handleOpenModal = (expense?: typeof expenses[number]) => {
    if (expense) {
      setEditingExpense(expense);
      setForm({
        date: expense.date,
        type: expense.type,
        amount: String(expense.amount),
        liters: expense.liters ? String(expense.liters) : '',
        pricePerLiter: expense.pricePerLiter ? String(expense.pricePerLiter) : '',
        description: expense.description,
      });
    } else {
      setEditingExpense(null);
      resetForm();
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.date || !form.description) return;
    const amount = Number(form.amount) || 0;
    const liters = form.liters ? Number(form.liters) : undefined;
    const pricePerLiter = form.pricePerLiter ? Number(form.pricePerLiter) : undefined;
    const computedAmount =
      form.type === 'fuel' && liters && pricePerLiter ? liters * pricePerLiter : amount;
    if (editingExpense) {
      updateExpense({
        ...editingExpense,
        date: form.date,
        type: form.type,
        amount: computedAmount,
        description: form.description,
        liters,
        pricePerLiter,
      });
    } else {
      addExpense({
        id: crypto.randomUUID(),
        date: form.date,
        type: form.type,
        amount: computedAmount,
        description: form.description,
        liters,
        pricePerLiter,
      });
    }
    setModalOpen(false);
  };

  const getExpenseIcon = (type: string) => {
    const expenseType = expenseTypes.find(t => t.id === type);
    return expenseType?.icon || MoreHorizontal;
  };

  const getExpenseColor = (type: string) => {
    const expenseType = expenseTypes.find(t => t.id === type);
    return expenseType?.color || 'gray';
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          Расходы и заправки
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Контроль всех расходов
        </p>
      </div>

      {/* Total Expenses Card */}
      <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 text-white">
        <p className="text-red-100 mb-1">Общие расходы за месяц</p>
        <p className="text-3xl font-bold mb-4">
          {totalExpenses.toLocaleString('ru-RU')} ₽
        </p>
        <div className="grid grid-cols-3 gap-4">
          {expensesByCategory.slice(0, 3).map((cat) => (
            <div key={cat.name} className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-red-100">{cat.name}</p>
              <p className="font-semibold">{(cat.value / 1000).toFixed(0)}K ₽</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">
        {expenseTypes.map((type) => {
          const Icon = type.icon;
          const isActive = selectedType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all border",
                isActive
                  ? `${colorClasses[type.color].bg} ${colorClasses[type.color].text} ${colorClasses[type.color].border}`
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{type.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Добавить расход
        </button>
      </div>

      {/* Fuel Consumption Chart */}
      <div className="bg-white dark:bg-gray-800 neutral:bg-stone-50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
          Расход топлива
        </h2>
        <div className="h-48 lg:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={expenses.filter(e => e.type === 'fuel').slice(0, 5).map((e) => ({
              date: new Date(e.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
              liters: Math.round((e.liters ?? e.amount / (e.pricePerLiter || 60))),
              cost: e.amount,
            }))}>
              <defs>
                <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={(value) => `${value}л`}
              />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'liters' ? `${value} л` : `${Number(value).toLocaleString('ru-RU')} ₽`,
                  name === 'liters' ? 'Литры' : 'Стоимость'
                ]}
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="liters" 
                stroke="#f59e0b" 
                strokeWidth={2}
                fill="url(#colorFuel)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white dark:bg-gray-800 neutral:bg-stone-50 rounded-2xl border border-gray-100 dark:border-gray-700">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            История расходов
          </h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {filteredExpenses.length === 0 && (
            <p className="p-4 text-sm text-gray-500 dark:text-gray-400">
              Расходы не найдены.
            </p>
          )}
          {filteredExpenses.map((expense) => {
            const Icon = getExpenseIcon(expense.type);
            const color = getExpenseColor(expense.type);
            return (
              <div key={expense.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
                <div className={cn("p-2.5 rounded-xl", colorClasses[color].bg, colorClasses[color].text)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {expense.description}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(expense.date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long'
                    })}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                  <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                    -{expense.amount.toLocaleString('ru-RU')} ₽
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(expense)}
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        title={editingExpense ? 'Редактировать расход' : 'Новый расход'}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Сохранить
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          <select
            value={form.type}
            onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value as ExpenseType }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            {expenseTypes.filter(type => type.id !== 'all').map(type => (
              <option key={type.id} value={type.id}>{type.label}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Сумма (₽)"
            value={form.amount}
            onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          {form.type === 'fuel' && (
            <>
              <input
                type="number"
                placeholder="Литры"
                value={form.liters}
                onChange={(e) => setForm(prev => ({ ...prev, liters: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
              <input
                type="number"
                placeholder="Цена за литр"
                value={form.pricePerLiter}
                onChange={(e) => setForm(prev => ({ ...prev, pricePerLiter: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </>
          )}
          <input
            type="text"
            placeholder="Описание"
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            className="sm:col-span-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
      </Modal>
    </div>
  );
}
