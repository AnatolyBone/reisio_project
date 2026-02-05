import { Sun, Moon, Monitor, Bell, BellOff, Calendar, User, MessageSquare, Edit2, LifeBuoy } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { Theme } from '../types';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { useEffect, useState } from 'react';

export function SettingsPage() {
  const { theme, settings, setTheme, updateSettings } = useTheme();
  const { profile, updateProfile } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportForm, setSupportForm] = useState({ subject: '', message: '' });
  const [profileForm, setProfileForm] = useState({
    displayName: profile.displayName,
    role: profile.role,
    company: profile.company || '',
  });

  useEffect(() => {
    setProfileForm({
      displayName: profile.displayName,
      role: profile.role,
      company: profile.company || '',
    });
  }, [profile]);

  const themes: { id: Theme; label: string; icon: typeof Sun; description: string }[] = [
    { id: 'light', label: 'Светлая', icon: Sun, description: 'Яркий дневной режим' },
    { id: 'dark', label: 'Тёмная', icon: Moon, description: 'Комфортный ночной режим' },
    { id: 'neutral', label: 'Нейтральная', icon: Monitor, description: 'Мягкие оттенки' },
  ];

  const periods: { id: 'weekly' | 'monthly' | 'quarterly'; label: string }[] = [
    { id: 'weekly', label: 'Неделя' },
    { id: 'monthly', label: 'Месяц' },
    { id: 'quarterly', label: 'Квартал' },
  ];

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          Настройки
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Персонализация приложения
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile.displayName}</h2>
              <p className="text-blue-100">{profile.role}</p>
              {profile.company && <p className="text-blue-100 text-sm">{profile.company}</p>}
            </div>
          </div>
          <button
            onClick={() => setProfileOpen(true)}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-3 gap-4">
          <div>
            <p className="text-blue-100 text-sm">Заказов</p>
            <p className="text-lg font-semibold">124</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Пробег</p>
            <p className="text-lg font-semibold">45.2K км</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Рейтинг</p>
            <p className="text-lg font-semibold">4.9 ⭐</p>
          </div>
        </div>
      </div>

      {/* Theme Selection */}
      <div className="bg-white dark:bg-gray-800 neutral:bg-stone-50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
          Тема оформления
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themes.map((t) => {
            const Icon = t.icon;
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                  isActive
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                <div className={cn(
                  "p-3 rounded-xl",
                  isActive 
                    ? "bg-blue-500 text-white" 
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className={cn(
                    "font-medium",
                    isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"
                  )}>
                    {t.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-800 neutral:bg-stone-50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
          Уведомления
        </h2>
        <div className="space-y-4">
          <button
            onClick={() => updateSettings({ notifications: !settings.notifications })}
            className="flex items-center justify-between w-full p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              {settings.notifications ? (
                <Bell className="w-5 h-5 text-green-500" />
              ) : (
                <BellOff className="w-5 h-5 text-gray-400" />
              )}
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">
                  Push-уведомления
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Напоминания о платежах и ТО
                </p>
              </div>
            </div>
            <div className={cn(
              "w-12 h-7 rounded-full transition-colors relative",
              settings.notifications ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
            )}>
              <div className={cn(
                "absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform",
                settings.notifications ? "translate-x-6" : "translate-x-1"
              )} />
            </div>
          </button>

          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                Telegram бот
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Настройка уведомлений через бота
              </p>
            </div>
            <button
              onClick={() => {
                const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME as string | undefined;
                if (!botUsername) return;
                const tgLink = `https://t.me/${botUsername}?startapp=finance`;
                if (window.Telegram?.WebApp?.openTelegramLink) {
                  window.Telegram.WebApp.openTelegramLink(tgLink);
                } else {
                  window.open(tgLink, '_blank');
                }
              }}
              className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              Открыть
            </button>
          </div>
        </div>
      </div>

      {/* Report Period */}
      <div className="bg-white dark:bg-gray-800 neutral:bg-stone-50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            Период отчётности
          </div>
        </h2>
        <div className="flex gap-2">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => updateSettings({ reportPeriod: p.id })}
              className={cn(
                "flex-1 py-3 rounded-xl font-medium transition-all",
                settings.reportPeriod === p.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Support */}
      <div className="bg-white dark:bg-gray-800 neutral:bg-stone-50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
          Поддержка
        </h2>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LifeBuoy className="w-5 h-5 text-blue-500" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Создать тикет</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Напишите вопрос, и администратор ответит.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSupportOpen(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Написать
          </button>
        </div>
      </div>

      {/* App Info */}
      <div className="text-center py-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Версия 1.0.0 • Telegram Mini App
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          © 2024 Финансовый помощник для грузоперевозчиков
        </p>
      </div>

      <Modal
        title="Редактировать профиль"
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setProfileOpen(false)}
              className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300"
            >
              Отмена
            </button>
            <button
              onClick={() => {
                updateProfile(profileForm);
                setProfileOpen(false);
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Сохранить
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <input
            type="text"
            value={profileForm.displayName}
            onChange={(e) => setProfileForm(prev => ({ ...prev, displayName: e.target.value }))}
            placeholder="Имя"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            value={profileForm.role}
            onChange={(e) => setProfileForm(prev => ({ ...prev, role: e.target.value }))}
            placeholder="Роль"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            value={profileForm.company}
            onChange={(e) => setProfileForm(prev => ({ ...prev, company: e.target.value }))}
            placeholder="Компания"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
      </Modal>

      <Modal
        title="Поддержка"
        isOpen={supportOpen}
        onClose={() => setSupportOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setSupportOpen(false)}
              className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300"
            >
              Отмена
            </button>
            <button
              onClick={() => {
                const token = localStorage.getItem('fa_token');
                if (!token) return;
                fetch(`${import.meta.env.VITE_API_BASE || '/api'}/support`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify(supportForm),
                }).then(() => {
                  setSupportForm({ subject: '', message: '' });
                  setSupportOpen(false);
                });
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Отправить
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <input
            type="text"
            value={supportForm.subject}
            onChange={(e) => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Тема"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          <textarea
            value={supportForm.message}
            onChange={(e) => setSupportForm(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Сообщение"
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
      </Modal>
    </div>
  );
}
