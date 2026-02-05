import { useEffect, useState } from 'react';
import { Search, Plus, ArrowUpDown, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { cn } from '../utils/cn';
import { Modal } from '../components/Modal';
import { useNavigation } from '../context/NavigationContext';

type SortField = 'date' | 'cost' | 'distance' | 'profit';
type SortOrder = 'asc' | 'desc';

export function OrdersPage() {
  const { orders, addOrder, updateOrder, deleteOrder } = useData();
  const { action, clearAction } = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<null | typeof orders[number]>(null);
  const [form, setForm] = useState({
    date: '',
    client: '',
    route: '',
    distance: '',
    cost: '',
    fuelExpense: '',
  });
  const itemsPerPage = 5;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredOrders = orders
    .filter(order => 
      order.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.route.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' 
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const showStart = filteredOrders.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const showEnd = Math.min(currentPage * itemsPerPage, filteredOrders.length);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortField, sortOrder]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const totalIncome = orders.reduce((sum, o) => sum + o.cost, 0);
  const totalProfit = orders.reduce((sum, o) => sum + o.profit, 0);
  const totalDistance = orders.reduce((sum, o) => sum + o.distance, 0);

  useEffect(() => {
    if (action === 'addOrder') {
      handleOpenModal();
      clearAction();
    }
  }, [action, clearAction]);

  const resetForm = () => {
    setForm({
      date: new Date().toISOString().slice(0, 10),
      client: '',
      route: '',
      distance: '',
      cost: '',
      fuelExpense: '',
    });
  };

  const handleOpenModal = (order?: typeof orders[number]) => {
    if (order) {
      setEditingOrder(order);
      setForm({
        date: order.date,
        client: order.client,
        route: order.route,
        distance: String(order.distance),
        cost: String(order.cost),
        fuelExpense: String(order.fuelExpense),
      });
    } else {
      setEditingOrder(null);
      resetForm();
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.date || !form.client || !form.route) return;
    const distance = Number(form.distance) || 0;
    const cost = Number(form.cost) || 0;
    const fuelExpense = Number(form.fuelExpense) || 0;
    const profit = cost - fuelExpense;
    if (editingOrder) {
      updateOrder({
        ...editingOrder,
        date: form.date,
        client: form.client,
        route: form.route,
        distance,
        cost,
        fuelExpense,
        profit,
      });
    } else {
      addOrder({
        id: crypto.randomUUID(),
        date: form.date,
        client: form.client,
        route: form.route,
        distance,
        cost,
        fuelExpense,
        profit,
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            История заказов
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Всего заказов: {orders.length}
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Добавить заказ</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Общая выручка</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {totalIncome.toLocaleString('ru-RU')} ₽
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Чистая прибыль</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            {totalProfit.toLocaleString('ru-RU')} ₽
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Пробег</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {totalDistance.toLocaleString('ru-RU')} км
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Поиск по клиенту или маршруту..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <button 
                    onClick={() => handleSort('date')}
                    className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    Дата <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Клиент / Маршрут
                </th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <button 
                    onClick={() => handleSort('distance')}
                    className="flex items-center gap-1 ml-auto hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    Расстояние <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <button 
                    onClick={() => handleSort('cost')}
                    className="flex items-center gap-1 ml-auto hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    Стоимость <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Топливо
                </th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <button 
                    onClick={() => handleSort('profit')}
                    className="flex items-center gap-1 ml-auto hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    Прибыль <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {paginatedOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    Заказы не найдены.
                  </td>
                </tr>
              )}
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {new Date(order.date).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{order.client}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{order.route}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white">
                    {order.distance.toLocaleString('ru-RU')} км
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-gray-900 dark:text-white">
                    {order.cost.toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-red-600 dark:text-red-400">
                    -{order.fuelExpense.toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-green-600 dark:text-green-400">
                    +{order.profit.toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(order)}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-gray-100 dark:divide-gray-700">
          {paginatedOrders.length === 0 && (
            <p className="p-4 text-sm text-gray-500 dark:text-gray-400">
              Заказы не найдены.
            </p>
          )}
          {paginatedOrders.map((order) => (
            <div key={order.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{order.client}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{order.route}</p>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(order.date).toLocaleDateString('ru-RU')}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  {order.distance.toLocaleString('ru-RU')} км
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-gray-900 dark:text-white font-medium">
                    {order.cost.toLocaleString('ru-RU')} ₽
                  </span>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    +{order.profit.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenModal(order)}
                  className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm"
                >
                  Редактировать
                </button>
                <button
                  onClick={() => deleteOrder(order.id)}
                  className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Показано {showStart}-{showEnd} из {filteredOrders.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={cn(
                "p-2 rounded-lg transition-colors",
                currentPage === 1
                  ? "text-gray-300 dark:text-gray-600"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={cn(
                "p-2 rounded-lg transition-colors",
                currentPage === totalPages
                  ? "text-gray-300 dark:text-gray-600"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <Modal
        title={editingOrder ? 'Редактировать заказ' : 'Новый заказ'}
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
          <input
            type="text"
            placeholder="Клиент"
            value={form.client}
            onChange={(e) => setForm(prev => ({ ...prev, client: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            placeholder="Маршрут"
            value={form.route}
            onChange={(e) => setForm(prev => ({ ...prev, route: e.target.value }))}
            className="sm:col-span-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          <input
            type="number"
            placeholder="Расстояние (км)"
            value={form.distance}
            onChange={(e) => setForm(prev => ({ ...prev, distance: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          <input
            type="number"
            placeholder="Стоимость (₽)"
            value={form.cost}
            onChange={(e) => setForm(prev => ({ ...prev, cost: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          <input
            type="number"
            placeholder="Топливо (₽)"
            value={form.fuelExpense}
            onChange={(e) => setForm(prev => ({ ...prev, fuelExpense: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          <div className="sm:col-span-2 text-sm text-gray-500 dark:text-gray-400">
            Прибыль рассчитывается автоматически: стоимость минус топливо.
          </div>
        </div>
      </Modal>
    </div>
  );
}
