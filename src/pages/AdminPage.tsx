import { useEffect, useState } from 'react';
import { Shield, UserPlus, Users, Trash2, ClipboardList, Plus, Bell, Activity } from 'lucide-react';
import { cn } from '../utils/cn';
import { Modal } from '../components/Modal';

interface Template {
  id: string;
  title: string;
  type: string;
  text: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export function AdminPage() {
  const token = localStorage.getItem('fa_token');
  const [newAdminId, setNewAdminId] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateForm, setTemplateForm] = useState({ title: '', type: 'payment', text: '' });
  const [userPlans, setUserPlans] = useState<Record<number, 'paid' | 'free'>>({});
  const [reminderSettings, setReminderSettings] = useState({ enabled: true, daysBefore: 3 });
  const [admins, setAdmins] = useState<{ userId: number }[]>([]);
  const [knownUsers, setKnownUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch(`${API_BASE}/admin-admins`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_BASE}/admin-users`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_BASE}/admin-templates`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_BASE}/admin-reminders`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([adminsData, usersData, templatesData, remindersData]) => {
      setAdmins(adminsData.admins || []);
      setKnownUsers(usersData.users || []);
      setTemplates(templatesData.templates || []);
      if (remindersData.settings) {
        setReminderSettings({
          enabled: remindersData.settings.enabled,
          daysBefore: remindersData.settings.daysBefore,
        });
      }
      const plans: Record<number, 'paid' | 'free'> = {};
      (usersData.users || []).forEach((userItem: any) => {
        if (userItem.plan?.plan) {
          plans[userItem.id] = userItem.plan.plan;
        }
      });
      setUserPlans(plans);
    });
  }, [token]);

  const updatePlan = (id: number, plan: 'paid' | 'free') => {
    setUserPlans(prev => {
      return { ...prev, [id]: plan };
    });
  };

  const handleAddAdmin = () => {
    const parsed = Number(newAdminId);
    if (!parsed || Number.isNaN(parsed)) return;
    if (!token) return;
    fetch(`${API_BASE}/admin-admins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId: parsed }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.admin) {
          setAdmins(prev => [...prev, data.admin]);
          setNewAdminId('');
        }
      });
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setTemplateForm({ title: template.title, type: template.type, text: template.text });
    setTemplateModalOpen(true);
  };

  const handleSaveTemplate = () => {
    if (!templateForm.title.trim()) return;
    if (!token) return;
    if (editingTemplate) {
      fetch(`${API_BASE}/admin-templates`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: editingTemplate.id, ...templateForm }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.template) {
            const updated = templates.map(item =>
              item.id === editingTemplate.id ? data.template : item
            );
            setTemplates(updated);
          }
        });
    } else {
      fetch(`${API_BASE}/admin-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(templateForm),
      })
        .then(res => res.json())
        .then(data => {
          if (data.template) {
            setTemplates(prev => [data.template, ...prev]);
          }
        });
    }
    setTemplateModalOpen(false);
    setEditingTemplate(null);
    setTemplateForm({ title: '', type: 'payment', text: '' });
  };

  const handleDeleteTemplate = (id: string) => {
    if (!token) return;
    fetch(`${API_BASE}/admin-templates`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    }).then(() => {
      setTemplates(templates.filter(item => item.id !== id));
    });
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          Веб-админка
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Управление администраторами, пользователями и шаблонами
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 neutral:bg-stone-50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Администраторы</h2>
          </div>
          <div className="space-y-3">
            {admins.map(admin => (
              <div key={admin.userId} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">ID {admin.userId}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Доступ к админке</p>
                </div>
                <button
                  onClick={() => {
                    if (!token) return;
                    fetch(`${API_BASE}/admin-admins`, {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ userId: admin.userId }),
                    }).then(() => {
                      setAdmins(prev => prev.filter(item => item.userId !== admin.userId));
                    });
                  }}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              type="number"
              value={newAdminId}
              onChange={(e) => setNewAdminId(e.target.value)}
              placeholder="Telegram ID"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
            <button
              onClick={handleAddAdmin}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 neutral:bg-stone-50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-emerald-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Пользователи</h2>
          </div>
          <div className="space-y-3">
            {knownUsers.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Нет данных о пользователях.
              </p>
            )}
            {knownUsers.map(user => (
              <div key={user.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40">
                <p className="font-medium text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ID {user.id} {user.username ? `• @${user.username}` : ''}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Последний вход: {new Date(user.lastLogin).toLocaleString('ru-RU')}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (!token) return;
                      fetch(`${API_BASE}/admin-plans`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ userId: user.id, plan: 'paid' }),
                      }).then(() => updatePlan(user.id, 'paid'));
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border",
                      userPlans[user.id] === 'paid'
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600"
                    )}
                  >
                    Платный
                  </button>
                  <button
                    onClick={() => {
                      if (!token) return;
                      fetch(`${API_BASE}/admin-plans`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ userId: user.id, plan: 'free' }),
                      }).then(() => updatePlan(user.id, 'free'));
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border",
                      userPlans[user.id] === 'free'
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600"
                    )}
                  >
                    Бесплатный
                  </button>
                  <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 ml-auto">
                    <Activity className="w-3 h-3" />
                    Активность
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 neutral:bg-stone-50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-amber-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Настройки напоминаний</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button
            onClick={() => {
              const next = { ...reminderSettings, enabled: !reminderSettings.enabled };
              setReminderSettings(next);
              if (token) {
                fetch(`${API_BASE}/admin-reminders`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify(next),
                });
              }
            }}
            className={cn(
              "px-4 py-2 rounded-lg font-medium",
              reminderSettings.enabled
                ? "bg-emerald-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            )}
          >
            {reminderSettings.enabled ? 'Напоминания включены' : 'Напоминания выключены'}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">За сколько дней напоминать</span>
            <input
              type="number"
              min={1}
              value={reminderSettings.daysBefore}
              onChange={(e) => {
                const next = { ...reminderSettings, daysBefore: Number(e.target.value) || 1 };
                setReminderSettings(next);
                if (token) {
                  fetch(`${API_BASE}/admin-reminders`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(next),
                  });
                }
              }}
              className="w-20 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 neutral:bg-stone-50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-purple-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Шаблоны сообщений</h2>
          </div>
          <button
            onClick={() => {
              setEditingTemplate(null);
              setTemplateForm({ title: '', type: 'payment', text: '' });
              setTemplateModalOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            Добавить
          </button>
        </div>
        <div className="space-y-3">
          {templates.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Нет шаблонов. Создайте новый для напоминаний бота.
            </p>
          )}
          {templates.map(template => (
            <div key={template.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{template.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {template.type}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    {template.text}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium",
                      "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                    )}
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        title={editingTemplate ? 'Редактировать шаблон' : 'Новый шаблон'}
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setTemplateModalOpen(false)}
              className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300"
            >
              Отмена
            </button>
            <button
              onClick={handleSaveTemplate}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
            >
              Сохранить
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <input
            type="text"
            value={templateForm.title}
            onChange={(e) => setTemplateForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Название"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          <select
            value={templateForm.type}
            onChange={(e) => setTemplateForm(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            <option value="payment">Платеж</option>
            <option value="maintenance">ТО</option>
            <option value="fine">Штраф</option>
            <option value="custom">Другое</option>
          </select>
          <textarea
            value={templateForm.text}
            onChange={(e) => setTemplateForm(prev => ({ ...prev, text: e.target.value }))}
            placeholder="Текст сообщения"
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
      </Modal>
    </div>
  );
}
