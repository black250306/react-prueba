import { Transaction } from '../App';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Leaf, Gift, History as HistoryIcon } from 'lucide-react';

interface HistoryProps {
  transactions: Transaction[];
}

export function History({ transactions }: HistoryProps) {
  const scans = transactions.filter(t => t.type === 'scan');
  const redeems = transactions.filter(t => t.type === 'redeem');

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Hoy ${date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  };

  const TransactionList = ({ items }: { items: Transaction[] }) => (
    <div className="space-y-3">
      {items.length === 0 ? (
        <Card className="p-8 text-center">
          <HistoryIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay transacciones</p>
        </Card>
      ) : (
        items.map((transaction) => (
          <Card key={transaction.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  transaction.type === 'scan' 
                    ? 'bg-emerald-100' 
                    : 'bg-orange-100'
                }`}>
                  {transaction.type === 'scan' ? (
                    <Leaf className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Gift className="w-5 h-5 text-orange-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900">{transaction.description}</p>
                  {transaction.location && (
                    <p className="text-gray-500">{transaction.location}</p>
                  )}
                  <p className="text-gray-400">
                    {formatDate(transaction.date)}
                  </p>
                </div>
              </div>
              <div className="text-right ml-3">
                <Badge 
                  variant={transaction.type === 'scan' ? 'default' : 'destructive'}
                  className={transaction.type === 'scan' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : ''}
                >
                  {transaction.type === 'scan' ? '+' : ''}{transaction.points}
                </Badge>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Historial</h1>
        <p className="text-gray-500">
          Revisa todas tus transacciones
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-emerald-50">
          <div className="space-y-1">
            <p className="text-emerald-700">Total ganado</p>
            <p className="text-emerald-900">
              +{scans.reduce((sum, t) => sum + t.points, 0)} pts
            </p>
          </div>
        </Card>
        <Card className="p-4 bg-orange-50">
          <div className="space-y-1">
            <p className="text-orange-700">Total canjeado</p>
            <p className="text-orange-900">
              {Math.abs(redeems.reduce((sum, t) => sum + t.points, 0))} pts
            </p>
          </div>
        </Card>
      </div>

      {/* Transactions Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="scans">Escaneos</TabsTrigger>
          <TabsTrigger value="redeems">Canjes</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <TransactionList items={transactions} />
        </TabsContent>
        <TabsContent value="scans" className="mt-4">
          <TransactionList items={scans} />
        </TabsContent>
        <TabsContent value="redeems" className="mt-4">
          <TransactionList items={redeems} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
