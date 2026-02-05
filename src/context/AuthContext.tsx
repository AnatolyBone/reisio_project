import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

export interface AuthUser {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
}

export interface UserProfile {
  displayName: string;
  role: string;
  company?: string;
}


interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile;
  isAdmin: boolean;
  loginWithManualId: (id: number, name: string) => void;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'fa_user';
const PROFILE_KEY = 'fa_profile';
const TOKEN_KEY = 'fa_token';
const IS_ADMIN_KEY = 'fa_is_admin';

const getTelegramUser = (): AuthUser | null => {
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  if (!tgUser?.id || !tgUser.first_name) {
    return null;
  }
  return {
    id: tgUser.id,
    firstName: tgUser.first_name,
    lastName: tgUser.last_name,
    username: tgUser.username,
    photoUrl: tgUser.photo_url,
  };
};

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile>({
    displayName: 'Пользователь',
    role: 'Водитель',
    company: '',
  });
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    window.Telegram?.WebApp?.ready?.();
    window.Telegram?.WebApp?.expand?.();
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    const storedProfile = localStorage.getItem(PROFILE_KEY);
    if (storedProfile) {
      try {
        setProfile(JSON.parse(storedProfile));
      } catch {
        setProfile(prev => prev);
      }
    }

    const storedIsAdmin = localStorage.getItem(IS_ADMIN_KEY);
    if (storedIsAdmin) {
      setIsAdmin(storedIsAdmin === 'true');
    }

    const telegramUser = getTelegramUser();
    if (telegramUser) {
      const initData = window.Telegram?.WebApp?.initData;
      if (initData) {
        fetch(`${API_BASE}/auth-telegram`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.token) {
              localStorage.setItem(TOKEN_KEY, data.token);
              setUser({
                id: data.user.id,
                firstName: data.user.firstName,
                lastName: data.user.lastName,
                username: data.user.username,
                photoUrl: data.user.photoUrl,
              });
              const nextProfile = {
                displayName: data.user.displayName,
                role: data.user.role,
                company: data.user.company || '',
              };
              setProfile(nextProfile);
              localStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile));
              localStorage.setItem(USER_KEY, JSON.stringify(data.user));
              localStorage.setItem(IS_ADMIN_KEY, String(!!data.isAdmin));
              setIsAdmin(!!data.isAdmin);
            }
          });
      }
      return;
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const isAdminMemo = useMemo(() => {
    if (!user) return false;
    return isAdmin;
  }, [isAdmin, user]);

  const loginWithManualId = (id: number, name: string) => {
    fetch(`${API_BASE}/auth-telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ manualId: id, name }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem(TOKEN_KEY, data.token);
          setUser({
            id: data.user.id,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            username: data.user.username,
            photoUrl: data.user.photoUrl,
          });
          const nextProfile = {
            displayName: data.user.displayName,
            role: data.user.role,
            company: data.user.company || '',
          };
          setProfile(nextProfile);
          localStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile));
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          localStorage.setItem(IS_ADMIN_KEY, String(!!data.isAdmin));
          setIsAdmin(!!data.isAdmin);
        }
      });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(IS_ADMIN_KEY);
    setIsAdmin(false);
  };

  const updateProfile = (next: Partial<UserProfile>) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    fetch(`${API_BASE}/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(next),
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          const updated = {
            displayName: data.user.displayName,
            role: data.user.role,
            company: data.user.company || '',
          };
          setProfile(updated);
          localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
        }
      });
  };

  const addAdmin = (id: number) => {
    setAdminIds(prev => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      localStorage.setItem(ADMINS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const removeAdmin = (id: number) => {
    setAdminIds(prev => {
      const updated = prev.filter(adminId => adminId !== id);
      const next = updated.length ? updated : DEFAULT_ADMIN_IDS;
      localStorage.setItem(ADMINS_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin: isAdminMemo,
        loginWithManualId,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
