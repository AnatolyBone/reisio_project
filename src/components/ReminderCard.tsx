import { AlertCircle, Wrench, CreditCard, Shield } from 'lucide-react';
import { Reminder } from '../types';
import { cn } from '../utils/cn';

interface ReminderCardProps {
  reminder: Reminder;
}

const iconMap = {
  leasing: CreditCard,
  maintenance: Wrench,
  fine: AlertCircle,
  insurance: Shield,
};

const colorMap = {
  leasing: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  maintenance: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  fine: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  insurance: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
};

export function ReminderCard({ reminder }: ReminderCardProps) {
  const Icon = iconMap[reminder.type];
  const dueDate = new Date(reminder.dueDate);
  const now = new Date();
  const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysLeft <= 3;

  return (
    <div className={cn(
      "flex items-center gap-4 p-4 rounded-xl border transition-all",
      isUrgent 
        ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
        : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
    )}>
      <div className={cn("p-2.5 rounded-lg", colorMap[reminder.type])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white truncate">{reminder.title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {dueDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
          {daysLeft > 0 && ` • через ${daysLeft} дн.`}
          {daysLeft === 0 && ' • сегодня'}
          {daysLeft < 0 && ` • просрочено на ${Math.abs(daysLeft)} дн.`}
        </p>
      </div>
      {reminder.amount && (
        <div className="text-right">
          <p className="font-semibold text-gray-900 dark:text-white">
            {reminder.amount.toLocaleString('ru-RU')} ₽
          </p>
        </div>
      )}
    </div>
  );
}
