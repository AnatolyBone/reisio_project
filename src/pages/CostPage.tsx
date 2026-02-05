import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Wallet, Fuel, CreditCard, Wrench, TrendingUp, Calculator } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useVehicles } from '../context/VehiclesContext';
import { cn } from '../utils/cn';
import { parseISO, isSameMonth, isSameWeek } from 'date-fns';

type Period = 'week' | 'month';

function calcTrip(rate: number, distance: number, vehicle: { fuelConsumptionPer100: number; fuelPricePerLiter: number; depreciationPer1000: number; foodParkingPer1000: number }) {
  if (distance <= 0) return null;
  const fuelCost = (distance / 100) * vehicle.fuelConsumptionPer100 * vehicle.fuelPricePerLiter;
  const depreciation = (distance / 1000) * vehicle.depreciationPer1000;
  const foodParking = (distance / 1000) * vehicle.foodParkingPer1000;
  const totalCost = fuelCost + depreciation + foodParking;
  const net = rate - totalCost;
  const perKm = net / distance;
  return { fuelCost: Math.round(fuelCost), depreciation: Math.round(depreciation), foodParking: Math.round(foodParking), totalCost: Math.round(totalCost), net: Math.round(net), perKm: Math.round(perKm * 10) / 10 };
}

export function CostPage() {
  const { orders, expenses } = useData();
  const { vehicles } = useVehicles();
  const [period, setPeriod] = useState<Period>('month');
  const [rate, setRate] = useState('');
  const [distance, setDistance] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const today = new Date();

  const selectedVehicle = vehicleId ? vehicles.find((v) => v.id === vehicleId) : vehicles[0] ?? null;
  const rateNum = Number(rate) || 0;
  const distanceNum = Number(distance) || 0;
  const tripResult = selectedVehicle && rateNum > 0 && distanceNum > 0 ? calcTrip(rateNum, distanceNum, selectedVehicle) : null;
  const isProfitable = tripResult ? tripResult.net > 0 : null;

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
      {/* Калькулятор «Стоит ли брать груз?» */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Стоит ли брать груз?
          </h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Введите ставку и расстояние — учтём топливо, амортизацию и еду/стоянки.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {vehicles.length > 0 && (
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Авто</label>
              <select
                value={vehicleId || (vehicles[0]?.id ?? '')}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Ставка, ₽</label>
            <input
              type="number"
              min="0"
              placeholder="50 000"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Расстояние, км</label>
            <input
              type="number"
              min="0"
              placeholder="1000"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        {vehicles.length === 0 && (
          <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
            Добавьте авто в разделе «Мои авто», чтобы считать.
          </p>
        )}
        {tripResult && (
          <div className="rounded-xl bg-gray-50 dark:bg-gray-900/50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Топливо</span>
              <span className="text-red-600 dark:text-red-400">−{tripResult.fuelCost.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Амортизация</span>
              <span className="text-red-600 dark:text-red-400">−{tripResult.depreciation.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Еда/Стоянки</span>
              <span className="text-red-600 dark:text-red-400">−{tripResult.foodParking.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-700 dark:text-gray-300">Итого чистыми</span>
              <span className={tripResult.net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                {tripResult.net.toLocaleString('ru-RU')} ₽ ({tripResult.perKm} ₽/км)
              </span>
            </div>
            <div className="flex items-center gap-2 pt-2">
              {isProfitable ? (
                <>
                  <span className="text-2xl">🟢</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Выгодно</span>
                </>
              ) : tripResult !== null ? (
                <>
                  <span className="text-2xl">🔴</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">Невыгодно</span>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>

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
