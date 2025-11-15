import { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { QRScanner } from './components/QRScanner';
import { History } from './components/History';
import { Profile } from './components/Profile';
import { Rewards, Reward } from './components/Rewards';
import { BottomNav } from './components/BottomNav';
import { Toaster } from './components/ui/sonner';
import Login from './components/Login';
import PushNotificationsHandler from './components/PushNotificationsHandler'; // <-- 1. IMPORTAR

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingLogin, setIsCheckingLogin] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'scan' | 'history' | 'profile' | 'rewards'>('home');
  const [balance, setBalance] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const detectSystemTheme = () => {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
      } else {
        setTheme('light');
      }
    };

    
    detectSystemTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handleThemeChange);

    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const usuarioId = localStorage.getItem("usuario_id");
    if (usuarioId) setIsLoggedIn(true);
    setIsCheckingLogin(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("usuario_id");
    setIsLoggedIn(false);
  };

  const handleRedeem = (reward: Reward) => {
    // Puedes enviar esta acción a tu API también si lo necesitas
    setBalance(prev => prev - reward.points);
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home onNavigateToRewards={() => setCurrentView('rewards')} />;
      case 'scan':
        return <QRScanner />;
      case 'history':
        return <History />;
      case 'profile':
        return (
          <Profile
            onLogout={handleLogout}
            theme={theme}
            onToggleTheme={handleToggleTheme}
          />
        );
      case 'rewards':
        return <Rewards balance={balance} onRedeem={handleRedeem} />;
      default:
        return <Home onNavigateToRewards={() => setCurrentView('rewards')} />;
    }
  };

  if (isCheckingLogin)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900">
        Cargando...
      </div>
    );

  if (!isLoggedIn)
    return (
      <Login
        onLoginSuccess={(usuarioId: string) => {
          localStorage.setItem("usuario_id", usuarioId);
          setIsLoggedIn(true);
        }}
      />
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 dark:from-gray-900 dark:to-gray-800">
      <PushNotificationsHandler /> {/* <-- 2. AÑADIR EL GESTOR */}
      <div className="max-w-md mx-auto min-h-screen flex flex-col shadow-xl dark:shadow-gray-900">
        <div className="flex-1 overflow-auto pb-20 bg-humo dark:bg-gray-900">
          {renderView()}
        </div>
        <BottomNav currentView={currentView} onNavigate={setCurrentView} />
      </div>
      <Toaster />
    </div>
  );
}