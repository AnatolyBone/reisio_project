import { createContext, useContext, useState, ReactNode } from 'react';

export type NavigationAction = 'addOrder' | 'addExpense' | 'addFuel' | 'addPayment' | 'addReminder' | null;

interface NavigationContextType {
  currentPage: string;
  action: NavigationAction;
  navigate: (page: string, action?: NavigationAction) => void;
  clearAction: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState('home');
  const [action, setAction] = useState<NavigationAction>(null);

  const navigate = (page: string, nextAction: NavigationAction = null) => {
    setCurrentPage(page);
    setAction(nextAction);
  };

  const clearAction = () => setAction(null);

  return (
    <NavigationContext.Provider value={{ currentPage, action, navigate, clearAction }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
