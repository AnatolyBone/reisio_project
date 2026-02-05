import { ReactNode, useMemo, useState } from 'react';
import { 
  Home, 
  BarChart3,
  Calculator,
  Truck, 
  Car,
  Fuel, 
  Calendar, 
  Settings,
  Menu,
  X,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { cn } from '../utils/cn';
import { Modal } from './Modal';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  isAdmin?: boolean;
}

const baseNavItems = [
  { id: 'home', label: 'Главная', icon: Home },
  { id: 'finances', label: 'Финансы', icon: BarChart3 },
  { id: 'costs', label: 'Себестоимость', icon: Calculator },
  { id: 'vehicles', label: 'Мои авто', icon: Car },
  { id: 'orders', label: 'Заказы', icon: Truck },
  { id: 'expenses', label: 'Расходы', icon: Fuel },
  { id: 'payments', label: 'Платежи', icon: Calendar },
  { id: 'settings', label: 'Настройки', icon: Settings },
];

export function Layout({ children, currentPage, onNavigate, isAdmin = false }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const navItems = useMemo(() => {
    if (!isAdmin) return baseNavItems;
    return [...baseNavItems, { id: 'admin', label: 'Админка', icon: ShieldCheck }];
  }, [isAdmin]);
  const bottomNavItems = useMemo(
    () => navItems.filter(item => ['home', 'finances', 'costs', 'vehicles', 'orders', 'payments'].includes(item.id)),
    [navItems]
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 neutral:bg-stone-100">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 neutral:bg-stone-50 border-b border-gray-200 dark:border-gray-700 neutral:border-stone-200 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-gray-900 dark:text-white">ФинПомощник</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHelpOpen(true)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-3 gap-2 pt-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-xl transition-all",
                    currentPage === item.id
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </nav>
        )}
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-gray-800 neutral:bg-stone-50 border-r border-gray-200 dark:border-gray-700 neutral:border-stone-200">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white">ФинПомощник</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Грузоперевозки</p>
            </div>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all text-left",
                  currentPage === item.id
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 min-w-0">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 neutral:bg-stone-50 border-t border-gray-200 dark:border-gray-700 lg:hidden z-50">
        <div className="flex justify-around py-2">
          {bottomNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all",
                currentPage === item.id
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <Modal
        title="Помощь"
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        footer={
          <div className="flex justify-end">
            <button
              onClick={() => setHelpOpen(false)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Понятно
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <p>1. Добавьте рейс или расход — данные сразу появятся в отчётах.</p>
          <p>2. «Мои авто» — настройте профиль машины (расход, амортизация).</p>
          <p>3. «Стоит ли брать груз?» — введите ставку и км, получите вердикт: выгодно или нет.</p>
          <p>4. Напоминания и платежи держат под контролем обязательства.</p>
          <p>5. В боте есть кнопка «Стоит ли груз?» — тот же расчёт из Telegram.</p>
        </div>
      </Modal>
    </div>
  );
}
