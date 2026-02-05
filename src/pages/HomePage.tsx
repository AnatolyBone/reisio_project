import {
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
  Bell,
  ArrowRight,
  Fuel,
  Truck,
  CalendarClock
} from 'lucide-react';
import { KPICard } from '../components/KPICard';
import { ReminderCard } from '../components/ReminderCard';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigation } from '../context/NavigationContext';
import { isSameDay, isSameWeek, isSameMonth, parseISO } from 'date-fns';
import { getAverageFuelPer100Km, getNearestPayment } from '../utils/analytics';

export function HomePage() {
  const { profile } = useAuth();
  const { kpi, reminders, monthlyIncomeData, orders, expenses, payments } = useData();
  const { navigate } = useNavigation();
  const today = new Date();

  const todayIncome = orders
    .filter(order => isSameDay(parseISO(order.date), today))
    .reduce((sum, order) => sum + order.cost, 0);
  const weekIncome = orders
    .filter(order => isSameWeek(parseISO(order.date), today, { weekStartsOn: 1 }))
    .reduce((sum, order) => sum + order.cost, 0);
  const monthIncome = orders
    .filter(order => isSameMonth(parseISO(order.date), today))
    .reduce((sum, order) => sum + order.cost, 0);
  const tripsMonth = orders.filter(order => isSameMonth(parseISO(order.date), today)).length;
  const avgFuel = getAverageFuelPer100Km(
    orders.filter(order => isSameMonth(parseISO(order.date), today)),
    expenses.filter(expense => isSameMonth(parseISO(expense.date), today) && expense.type === 'fuel')
  );
  const ближайшийПлатеж = getNearestPayment(payments);

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          Добро пожаловать, {profile.displayName}! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Обзор ваших финансов на сегодня
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Доход за сегодня"
          value={`${(todayIncome / 1000).toFixed(0)}K ₽`}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="success"
        />
        <KPICard
          title="Доход за неделю"
          value={`${(weekIncome / 1000).toFixed(0)}K ₽`}
          icon={<DollarSign className="w-5 h-5" />}
          variant="default"
        />
        <KPICard
          title="Доход за месяц"
          value={`${(monthIncome / 1000).toFixed(0)}K ₽`}
          icon={<Wallet className="w-5 h-5" />}
          variant="warning"
        />
        <KPICard
          title="Расходы за месяц"
          value={`${(kpi.monthlyExpenses / 1000).toFixed(0)}K ₽`}
          icon={<TrendingDown className="w-5 h-5" />}
          variant="danger"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Средний расход"
          value={`${avgFuel.toFixed(1)} л/100км`}
          icon={<Fuel className="w-5 h-5" />}
          variant="warning"
        />
        <KPICard
          title="Рейсов за месяц"
          value={tripsMonth}
          icon={<Truck className="w-5 h-5" />}
          variant="default"
        />
        <KPICard
          title="Чистая прибыль"
          value={`${(kpi.totalProfit / 1000).toFixed(0)}K ₽`}
          icon={<DollarSign className="w-5 h-5" />}
          variant="success"
        />
        <KPICard
          title="Ближайший платёж"
          value={
            ближайшийПлатеж
              ? `${new Date(ближайшийПлатеж.date).toLocaleDateString('ru-RU')}`
              : 'Нет'
          }
          icon={<CalendarClock className="w-5 h-5" />}
          variant="danger"
        />
      </div>

      {/* Quick Stats Chart */}
      <div className="bg-white dark:bg-gray-800 neutral:bg-stone-50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 neutral:border-stone-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Динамика доходов</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">За последние 6 месяцев</p>
          </div>
        </div>
        <div className="h-48 lg:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyIncomeData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
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
                formatter={(value) => [`${Number(value).toLocaleString('ru-RU')} ₽`, 'Доход']}
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke="#10b981" 
                strokeWidth={2}
                fill="url(#colorIncome)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reminders */}
      <div className="bg-white dark:bg-gray-800 neutral:bg-stone-50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 neutral:border-stone-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Напоминания</h2>
          </div>
          <button
            onClick={() => navigate('payments')}
            className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            Все <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {reminders.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Напоминаний пока нет.
            </p>
          )}
          {reminders.map((reminder) => (
            <ReminderCard key={reminder.id} reminder={reminder} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => navigate('orders', 'addOrder')}
          className="flex flex-col items-center justify-center gap-2 p-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:shadow-xl transition-shadow"
        >
          <TrendingUp className="w-6 h-6" />
          <span className="font-medium">Добавить рейс</span>
          <span className="text-xs opacity-80">2 тапа</span>
        </button>
        <button
          onClick={() => navigate('expenses', 'addFuel')}
          className="flex flex-col items-center justify-center gap-2 p-5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl text-white shadow-lg shadow-amber-200 dark:shadow-amber-900/30 hover:shadow-xl transition-shadow"
        >
          <Fuel className="w-6 h-6" />
          <span className="font-medium">Заправка</span>
          <span className="text-xs opacity-80">2 тапа</span>
        </button>
        <button
          onClick={() => navigate('payments', 'addPayment')}
          className="flex flex-col items-center justify-center gap-2 p-5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 hover:shadow-xl transition-shadow"
        >
          <Wallet className="w-6 h-6" />
          <span className="font-medium">Платёж</span>
          <span className="text-xs opacity-80">2 тапа</span>
        </button>
      </div>
    </div>
  );
}
