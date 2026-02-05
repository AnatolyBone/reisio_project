import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { FinancesPage } from './pages/FinancesPage';
import { OrdersPage } from './pages/OrdersPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminPage } from './pages/AdminPage';
import { AuthPage } from './pages/AuthPage';
import { CostPage } from './pages/CostPage';

function AppContent() {
  const { user, isAdmin } = useAuth();
  const { currentPage, navigate } = useNavigation();

  if (!user) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'finances':
        return <FinancesPage />;
      case 'orders':
        return <OrdersPage />;
      case 'expenses':
        return <ExpensesPage />;
      case 'payments':
        return <PaymentsPage />;
      case 'costs':
        return <CostPage />;
      case 'settings':
        return <SettingsPage />;
      case 'admin':
        return isAdmin ? <AdminPage /> : <HomePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={navigate} isAdmin={isAdmin}>
      {renderPage()}
    </Layout>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <NavigationProvider>
            <AppContent />
          </NavigationProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
