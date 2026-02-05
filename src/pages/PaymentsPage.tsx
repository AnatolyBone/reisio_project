import { useEffect, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, Clock, Plus, Pencil, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { cn } from '../utils/cn';
import { Modal } from '../components/Modal';
import { useNavigation } from '../context/NavigationContext';

export function PaymentsPage() {
  const {
    payments,
    reminders,
    addPayment,
    updatePayment,
    deletePayment,
    addReminder,
    updateReminder,
    deleteReminder,
  } = useData();
  const { action, clearAction } = useNavigation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<null | typeof payments[number]>(null);
  const [form, setForm] = useState({
    date: '',
    type: 'leasing',
    amount: '',
    status: 'pending',
    description: '',
  });
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<null | typeof reminders[number]>(null);
  const [reminderForm, setReminderForm] = useState({
    title: '',
    type: 'leasing',
    dueDate: '',
    amount: '',
  });

  useEffect(() => {
    if (action === 'addPayment') {
      handleOpenModal();
      clearAction();
    }
  }, [action, clearAction]);

  const resetForm = () => {
    setForm({
      date: new Date().toISOString().slice(0, 10),
      type: 'leasing',
      amount: '',
      status: 'pending',
      description: '',
    });
  };

  const handleOpenModal = (payment?: typeof payments[number]) => {
    if (payment) {
      setEditingPayment(payment);
      setForm({
        date: payment.date,
        type: payment.type,
        amount: String(payment.amount),
        status: payment.status,
        description: payment.description,
      });
    } else {
      setEditingPayment(null);
      resetForm();
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.date || !form.description) return;
    const amount = Number(form.amount) || 0;
    if (editingPayment) {
      updatePayment({
        ...editingPayment,
        date: form.date,
        type: form.type as typeof editingPayment.type,
        amount,
        status: form.status as typeof editingPayment.status,
        description: form.description,
      });
    } else {
      addPayment({
        id: crypto.randomUUID(),
        date: form.date,
        type: form.type as typeof payments[number]['type'],
        amount,
        status: form.status as typeof payments[number]['status'],
        description: form.description,
      });
    }
    setModalOpen(false);
  };

  const resetReminderForm = () => {
    setReminderForm({
      title: '',
      type: 'leasing',
      dueDate: new Date().toISOString().slice(0, 10),
      amount: '',
    });
  };

  const handleOpenReminderModal = (reminder?: typeof reminders[number]) => {
    if (reminder) {
      setEditingReminder(reminder);
      setReminderForm({
        title: reminder.title,
        type: reminder.type,
        dueDate: reminder.dueDate,
        amount: reminder.amount ? String(reminder.amount) : '',
      });
    } else {
      setEditingReminder(null);
      resetReminderForm();
    }
    setReminderModalOpen(true);
  };

  const handleSaveReminder = () => {
    if (!reminderForm.title || !reminderForm.dueDate) return;
    const amount = reminderForm.amount ? Number(reminderForm.amount) : undefined;
    if (editingReminder) {
      updateReminder({
        ...editingReminder,
        title: reminderForm.title,
        type: reminderForm.type as typeof editingReminder.type,
        dueDate: reminderForm.dueDate,
        amount,
      });
    } else {
      addReminder({
        id: crypto.randomUUID(),
        title: reminderForm.title,
        type: reminderForm.type as typeof reminders[number]['type'],
        dueDate: reminderForm.dueDate,
        amount,
      });
    }
    setReminderModalOpen(false);
  };

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);

  const getPaymentsForDay = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return payments.filter(p => p.date === dateStr);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const overduePayments = payments.filter(p => p.status === 'overdue');
  const paidPayments = payments.filter(p => p.status === 'paid');

  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = overduePayments.reduce((sum, p) => sum + p.amount, 0);

  const statusConfig = {
    pending: { 
      icon: Clock, 
      label: 'Ожидает', 
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      textColor: 'text-amber-600 dark:text-amber-400',
      dotColor: 'bg-amber-500'
    },
    paid: { 
      icon: CheckCircle2, 
      label: 'Оплачено', 
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-600 dark:text-green-400',
      dotColor: 'bg-green-500'
    },
    overdue: { 
      icon: AlertCircle, 
      label: 'Просрочено', 
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      textColor: 'text-red-600 dark:text-red-400',
      dotColor: 'bg-red-500'
    },
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          Лизинг и платежи
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Календарь предстоящих платежей
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-100 dark:border-amber-800">
          <Clock className="w-5 h-5 text-amber-500 mb-2" />
          <p className="text-sm text-amber-600 dark:text-amber-400">Ожидает оплаты</p>
          <p className="text-xl font-bold text-amber-700 dark:text-amber-300">
            {pendingPayments.length} платежей
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            {totalPending.toLocaleString('ru-RU')} ₽
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-100 dark:border-red-800">
          <AlertCircle className="w-5 h-5 text-red-500 mb-2" />
          <p className="text-sm text-red-600 dark:text-red-400">Просрочено</p>
          <p className="text-xl font-bold text-red-700 dark:text-red-300">
            {overduePayments.length} платежей
          </p>
          <p className="text-sm text-red-600 dark:text-red-400">
            {totalOverdue.toLocaleString('ru-RU')} ₽
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800">
          <CheckCircle2 className="w-5 h-5 text-green-500 mb-2" />
          <p className="text-sm text-green-600 dark:text-green-400">Оплачено</p>
          <p className="text-xl font-bold text-green-700 dark:text-green-300">
            {paidPayments.length} платежей
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
          <Calendar className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-sm text-blue-600 dark:text-blue-400">Всего</p>
          <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
            {payments.length} платежей
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Добавить платеж
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-gray-800 neutral:bg-stone-50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <button 
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startingDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayPayments = getPaymentsForDay(day);
            const hasOverdue = dayPayments.some(p => p.status === 'overdue');
            const hasPending = dayPayments.some(p => p.status === 'pending');
            const hasPaid = dayPayments.some(p => p.status === 'paid');
            const isToday = new Date().getDate() === day && 
              new Date().getMonth() === currentMonth.getMonth() &&
              new Date().getFullYear() === currentMonth.getFullYear();

            return (
              <div
                key={day}
                className={cn(
                  "aspect-square flex flex-col items-center justify-center rounded-lg relative",
                  isToday && "bg-blue-100 dark:bg-blue-900/30",
                  dayPayments.length > 0 && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                <span className={cn(
                  "text-sm",
                  isToday ? "font-bold text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"
                )}>
                  {day}
                </span>
                {dayPayments.length > 0 && (
                  <div className="flex gap-0.5 mt-1">
                    {hasOverdue && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                    {hasPending && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                    {hasPaid && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white dark:bg-gray-800 neutral:bg-stone-50 rounded-2xl border border-gray-100 dark:border-gray-700">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Предстоящие платежи
          </h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {payments.length === 0 && (
            <p className="p-4 text-sm text-gray-500 dark:text-gray-400">
              Платежей пока нет.
            </p>
          )}
          {payments.map((payment) => {
            const config = statusConfig[payment.status];
            const Icon = config.icon;
            return (
              <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
                <div className={cn("p-2.5 rounded-xl", config.bgColor, config.textColor)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {payment.description}
                    </p>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      config.bgColor, config.textColor
                    )}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(payment.date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {payment.amount.toLocaleString('ru-RU')} ₽
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(payment)}
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deletePayment(payment.id)}
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

      <div className="bg-white dark:bg-gray-800 neutral:bg-stone-50 rounded-2xl border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Напоминания
          </h2>
          <button
            onClick={() => handleOpenReminderModal()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600"
          >
            <Plus className="w-4 h-4" />
            Добавить
          </button>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {reminders.length === 0 && (
            <p className="p-4 text-sm text-gray-500 dark:text-gray-400">
              Напоминаний нет.
            </p>
          )}
          {reminders.map(reminder => {
            const dueDate = new Date(reminder.dueDate);
            const daysLeft = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            const statusColor =
              daysLeft < 0
                ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                : daysLeft <= 3
                ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400';
            return (
            <div key={reminder.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white">{reminder.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(reminder.dueDate).toLocaleDateString('ru-RU')} • {reminder.type}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusColor)}>
                  {daysLeft < 0 ? 'Просрочено' : daysLeft <= 3 ? 'Скоро' : 'ОК'}
                </span>
                {reminder.amount && (
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {reminder.amount.toLocaleString('ru-RU')} ₽
                  </p>
                )}
                <button
                  onClick={() => handleOpenReminderModal(reminder)}
                  className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteReminder(reminder.id)}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
          })}
        </div>
      </div>

      <Modal
        title={editingPayment ? 'Редактировать платеж' : 'Новый платеж'}
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
            onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            <option value="leasing">Лизинг</option>
            <option value="insurance">Страхование</option>
            <option value="tax">Налоги</option>
            <option value="other">Другое</option>
          </select>
          <select
            value={form.status}
            onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            <option value="pending">Ожидает</option>
            <option value="paid">Оплачено</option>
            <option value="overdue">Просрочено</option>
          </select>
          <input
            type="number"
            placeholder="Сумма (₽)"
            value={form.amount}
            onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            placeholder="Описание"
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            className="sm:col-span-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
      </Modal>

      <Modal
        title={editingReminder ? 'Редактировать напоминание' : 'Новое напоминание'}
        isOpen={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setReminderModalOpen(false)}
              className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300"
            >
              Отмена
            </button>
            <button
              onClick={handleSaveReminder}
              className="px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600"
            >
              Сохранить
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Название"
            value={reminderForm.title}
            onChange={(e) => setReminderForm(prev => ({ ...prev, title: e.target.value }))}
            className="sm:col-span-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          <select
            value={reminderForm.type}
            onChange={(e) => setReminderForm(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            <option value="leasing">Лизинг</option>
            <option value="maintenance">ТО</option>
            <option value="fine">Штраф</option>
            <option value="insurance">Страхование</option>
          </select>
          <input
            type="date"
            value={reminderForm.dueDate}
            onChange={(e) => setReminderForm(prev => ({ ...prev, dueDate: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          <input
            type="number"
            placeholder="Сумма (опционально)"
            value={reminderForm.amount}
            onChange={(e) => setReminderForm(prev => ({ ...prev, amount: e.target.value }))}
            className="sm:col-span-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
      </Modal>
    </div>
  );
}
