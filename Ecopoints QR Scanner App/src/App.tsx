import { useState } from 'react';
import { Home } from './components/Home';
import { QRScanner } from './components/QRScanner';
import { History } from './components/History';
import { Profile } from './components/Profile';
import { Rewards, Reward } from './components/Rewards';
import { RecyclingStation } from './components/RecyclingStation';
import { BottomNav } from './components/BottomNav';
import { Toaster } from './components/ui/sonner';

export interface Transaction {
  id: string;
  type: 'scan' | 'redeem';
  points: number;
  description: string;
  date: Date;
  location?: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'scan' | 'history' | 'profile' | 'rewards' | 'station'>('home');
  const [balance, setBalance] = useState(850);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'scan',
      points: 50,
      description: 'Reciclaje de botellas',
      date: new Date(2025, 9, 27, 14, 30),
      location: 'EcoPoint Miraflores'
    },
    {
      id: '2',
      type: 'scan',
      points: 100,
      description: 'Reciclaje de papel',
      date: new Date(2025, 9, 26, 10, 15),
      location: 'EcoPoint San Isidro'
    },
    {
      id: '3',
      type: 'redeem',
      points: -200,
      description: 'Canje por descuento',
      date: new Date(2025, 9, 25, 16, 45),
      location: 'Tienda Verde'
    },
    {
      id: '4',
      type: 'scan',
      points: 75,
      description: 'Reciclaje de latas',
      date: new Date(2025, 9, 24, 12, 20),
      location: 'EcoPoint Surco'
    }
  ]);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date()
    };
    setTransactions(prev => [newTransaction, ...prev]);
    setBalance(prev => prev + transaction.points);
  };

  const handleRedeem = (reward: Reward) => {
    addTransaction({
      type: 'redeem',
      points: -reward.points,
      description: `${reward.brand} - ${reward.name}`,
      location: 'Canje online'
    });
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home balance={balance} recentTransactions={transactions.slice(0, 3)} onNavigateToRewards={() => setCurrentView('rewards')} />;
      case 'scan':
        return <QRScanner onScanSuccess={addTransaction} />;
      case 'history':
        return <History transactions={transactions} />;
      case 'profile':
        return <Profile balance={balance} totalScans={transactions.filter(t => t.type === 'scan').length} onViewStation={() => setCurrentView('station')} />;
      case 'rewards':
        return <Rewards balance={balance} onRedeem={handleRedeem} />;
      case 'station':
        return <RecyclingStation />;
      default:
        return <Home balance={balance} recentTransactions={transactions.slice(0, 3)} onNavigateToRewards={() => setCurrentView('rewards')} />;
    }
  };

  // Show station view in fullscreen without navigation
  if (currentView === 'station') {
    return (
      <>
        <RecyclingStation onClose={() => setCurrentView('profile')} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-md mx-auto min-h-screen flex flex-col bg-white shadow-xl">
        <div className="flex-1 overflow-auto pb-20">
          {renderView()}
        </div>
        <BottomNav currentView={currentView} onNavigate={setCurrentView} />
      </div>
      <Toaster />
    </div>
  );
}
