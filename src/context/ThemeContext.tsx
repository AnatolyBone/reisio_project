import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, Settings } from '../types';

interface ThemeContextType {
  theme: Theme;
  settings: Settings;
  setTheme: (theme: Theme) => void;
  updateSettings: (settings: Partial<Settings>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const stored = localStorage.getItem('fa_settings');
    if (stored) {
      try {
        return JSON.parse(stored) as Settings;
      } catch {
        return { theme: 'light', notifications: true, reportPeriod: 'monthly' };
      }
    }
    return { theme: 'light', notifications: true, reportPeriod: 'monthly' };
  });

  useEffect(() => {
    const token = localStorage.getItem('fa_token');
    const API_BASE = import.meta.env.VITE_API_BASE || '/api';
    if (!token) return;
    fetch(`${API_BASE}/settings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setSettings({
            theme: data.settings.theme,
            notifications: data.settings.notifications,
            reportPeriod: data.settings.reportPeriod,
          });
        }
      });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'neutral');
    root.classList.add(settings.theme);
    localStorage.setItem('fa_settings', JSON.stringify(settings));
    const token = localStorage.getItem('fa_token');
    const API_BASE = import.meta.env.VITE_API_BASE || '/api';
    if (token) {
      fetch(`${API_BASE}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
    }
  }, [settings]);

  const setTheme = (theme: Theme) => {
    setSettings(prev => ({ ...prev, theme }));
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <ThemeContext.Provider value={{ theme: settings.theme, settings, setTheme, updateSettings }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
