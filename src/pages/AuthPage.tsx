import { useMemo, useState } from 'react';
import { ShieldCheck, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const getBotUsername = () => import.meta.env.VITE_TELEGRAM_BOT_USERNAME as string | undefined;

export function AuthPage() {
  const { loginWithManualId } = useAuth();
  const [manualId, setManualId] = useState('');
  const [manualName, setManualName] = useState('');
  const allowManual = import.meta.env.VITE_ALLOW_MANUAL_LOGIN === 'true' || import.meta.env.DEV;

  const botUsername = getBotUsername();
  const tgLink = useMemo(() => {
    if (!botUsername) return '';
    return `https://t.me/${botUsername}?startapp=finance`;
  }, [botUsername]);

  const handleManualLogin = () => {
    const parsed = Number(manualId);
    if (!parsed || Number.isNaN(parsed)) {
      return;
    }
    loginWithManualId(parsed, manualName || 'Пользователь');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 space-y-6">
        <div className="space-y-2 text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Авторизация через Telegram
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Для хранения данных и восстановления профиля требуется вход через Telegram.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              if (tgLink && window.Telegram?.WebApp?.openTelegramLink) {
                window.Telegram.WebApp.openTelegramLink(tgLink);
              } else if (tgLink) {
                window.open(tgLink, '_blank');
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            <Smartphone className="w-5 h-5" />
            Открыть в Telegram
          </button>
          {!botUsername && (
            <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
              Добавьте переменную VITE_TELEGRAM_BOT_USERNAME для ссылки на бота.
            </p>
          )}
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-5 space-y-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Веб-доступ вне Telegram (например, для теста или админки).
          </p>
          {allowManual ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Telegram ID"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Имя"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <button
                onClick={handleManualLogin}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-medium"
              >
                Войти по ID
              </button>
            </>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Ручной вход отключён в продакшене.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
