import { useState, useEffect } from 'react'; // ✅ Importar useEffect
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Gift, Leaf, Sparkles, Tag, CheckCircle2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export interface Reward {
  id: string;
  name: string;
  brand: string;
  description: string;
  points: number;
  category: 'restaurant' | 'cafe' | 'retail' | 'entertainment';
  image: string;
  discount?: string;
  validity?: string;
}

interface RewardsProps {
  balance: number;
  onRedeem: (reward: Reward) => void;
}

const rewards: Reward[] = [
  // ... (Tu lista de premios se mantiene igual)
  {
    id: '1',
    name: 'Descuento S/20 en tu compra',
    brand: 'Bembos',
    description: 'Vale de descuento de S/20 en cualquier combo. Válido en todas las tiendas.',
    points: 500,
    category: 'restaurant',
    image: 'https://images.unsplash.com/photo-1688246780164-00c01647e78c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBmb29kfGVufDF8fHx8MTc2MTU0NDUwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    discount: '20% OFF',
    validity: '30 días'
  },
  {
    id: '2',
    name: 'Pizza Familiar Gratis',
    brand: "Papa John's",
    description: 'Pizza familiar de cualquier sabor al llevar una pizza grande.',
    points: 800,
    category: 'restaurant',
    image: 'https://images.unsplash.com/photo-1681567604770-0dc826c870ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMGZvb2R8ZW58MXx8fHwxNzYxNTg1NTY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    discount: '2x1',
    validity: '30 días'
  },
  {
    id: '3',
    name: 'Combo Clásico',
    brand: 'KFC',
    description: '3 piezas de pollo + papas regulares + gaseosa mediana.',
    points: 600,
    category: 'restaurant',
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxmcmllZCUyMGNoaWNrZW58ZW58MXx8fHwxNzYxNTYzNTYzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    discount: 'Gratis',
    validity: '15 días'
  },
  {
    id: '4',
    name: 'Bebida Grande Gratis',
    brand: 'Starbucks',
    description: 'Cualquier bebida grande de tu elección. Incluye personalizaciones.',
    points: 400,
    category: 'cafe',
    image: 'https://images.unsplash.com/photo-1533776992670-a72f4c28235e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBjdXB8ZW58MXx8fHwxNzYxNjAzNDIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    discount: 'Gratis',
    validity: '30 días'
  },
  {
    id: '5',
    name: 'Postre de Helado',
    brand: 'Bembos',
    description: 'Helado mediano de cualquier sabor con topping.',
    points: 250,
    category: 'restaurant',
    image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxpY2UlMjBjcmVhbXxlbnwxfHx8fDE3NjE1NTM2ODB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    discount: 'Gratis',
    validity: '15 días'
  },
  {
    id: '6',
    name: 'Vale de Descuento S/30',
    brand: 'Tiendas Retail',
    description: 'Vale de S/30 en compras mayores a S/100 en tiendas participantes.',
    points: 350,
    category: 'retail',
    image: 'https://images.unsplash.com/photo-1526178613552-2b45c6c302f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG9wcGluZyUyMGRpc2NvdW50fGVufDF8fHx8MTc2MTYyOTAxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    discount: 'S/30',
    validity: '60 días'
  },
  {
    id: '7',
    name: 'Combo Premium',
    brand: 'Bembos',
    description: 'Hamburguesa premium + papas grandes + bebida grande + postre.',
    points: 700,
    category: 'restaurant',
    image: 'https://images.unsplash.com/photo-1688246780164-00c01647e78c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxidXJnZXIlMjBmb29kfGVufDF8fHx8MTc2MTU0NDUwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    discount: '30% OFF',
    validity: '30 días'
  },
  {
    id: '8',
    name: 'Café + Pastel',
    brand: 'Starbucks',
    description: 'Café mediano de tu elección + pastel del día.',
    points: 300,
    category: 'cafe',
    image: 'https://images.unsplash.com/photo-1533776992670-a72f4c28235e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBjdXB8ZW58MXx8fHwxNzYxNjAzNDIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    discount: '25% OFF',
    validity: '30 días'
  }
];

export function Rewards({ balance, onRedeem }: RewardsProps) {
  const API_URL = "https://ecopoints.hvd.lat/api/";
  const idusuario = localStorage.getItem("usuario_id");
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [redeemedReward, setRedeemedReward] = useState<Reward | null>(null);
  const [botellas, setBotellas] = useState("");

  const handleRedeemClick = (reward: Reward) => {
    // Asegurarse de que 'botellas' es un número para la comparación.
    const currentPoints = parseFloat(botellas) || 0;
    if (currentPoints >= reward.points) { // ✅ Usar currentPoints
      setSelectedReward(reward);
    } else {
      toast.error('No tienes suficientes ecopoints');
    }
  };

  const obtenerPuntos = async (idusuario: string) => {
    try {
      const response = await fetch(`${API_URL}/obtenerPuntos?usuario_id=${idusuario}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setBotellas(data.puntos);
    } catch (error) {
      console.error("Error al obtener puntos:", error);
    }
  };

  // ✅ CORRECCIÓN: Usar useEffect para llamadas asíncronas al montar el componente
  useEffect(() => {
    if (idusuario) {
      obtenerPuntos(idusuario);
    }
  }, [idusuario]);

  // Se eliminó la línea `obtenerPuntos(idusuario!) as unknown as number;`

  const confirmRedeem = () => {
    if (selectedReward) {
      onRedeem(selectedReward);
      setRedeemedReward(selectedReward);
      setSelectedReward(null);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setRedeemedReward(null);
      }, 3000);
    }
  };

  const categoryLabels = {
    restaurant: 'Restaurantes',
    cafe: 'Cafeterías',
    retail: 'Retail',
    entertainment: 'Entretenimiento'
  };

  const RewardCard = ({ reward }: { reward: Reward }) => {
    // Usar los puntos de `botellas` para la verificación
    const currentPoints = parseFloat(botellas) || 0;
    const canAfford = currentPoints >= reward.points;

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          <div className="aspect-video bg-gray-200 overflow-hidden">
            <ImageWithFallback
              src={reward.image}
              alt={reward.name}
              className="w-full h-full object-cover"
            />
          </div>
          {reward.discount && (
            <Badge className="absolute top-2 right-2 bg-red-500 text-white">
              {reward.discount}
            </Badge>
          )}
        </div>
        <div className="p-4 space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-gray-500">{reward.brand}</span>
            </div>
            <h3 className="text-gray-900">{reward.name}</h3>
            <p className="text-gray-500 line-clamp-2">{reward.description}</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-1">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span className="text-gray-900">{reward.points}</span>
              <span className="text-gray-500">pts</span>
            </div>
            <Button
              size="sm"
              onClick={() => handleRedeemClick(reward)}
              disabled={!canAfford}
              className={canAfford ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              {canAfford ? 'Canjear' : 'Insuficiente'}
            </Button>
          </div>

          {reward.validity && (
            <p className="text-gray-400">Válido por {reward.validity}</p>
          )}
        </div>
      </Card>
    );
  };

  // ... (Resto de la función filterRewardsByCategory) ...
  const filterRewardsByCategory = (category?: string) => {
    if (!category || category === 'all') return rewards;
    return rewards.filter(r => r.category === category);
  };


  return (
    <div className="p-6 space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Premios</h1>
        <p className="text-gray-500">
          Canjea tus ecopoints por premios increíbles
        </p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 mb-1">Tus ecopoints</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl">{botellas.toLocaleString()}</span>
              <span className="text-emerald-100">puntos</span>
            </div>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Gift className="w-8 h-8" />
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="restaurant">Comida</TabsTrigger>
          <TabsTrigger value="cafe">Café</TabsTrigger>
          <TabsTrigger value="retail">Retail</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 gap-4">
            {filterRewardsByCategory('all').map(reward => (
              <RewardCard key={reward.id} reward={reward} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="restaurant" className="mt-6">
          <div className="grid grid-cols-1 gap-4">
            {filterRewardsByCategory('restaurant').map(reward => (
              <RewardCard key={reward.id} reward={reward} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cafe" className="mt-6">
          <div className="grid grid-cols-1 gap-4">
            {filterRewardsByCategory('cafe').map(reward => (
              <RewardCard key={reward.id} reward={reward} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="retail" className="mt-6">
          <div className="grid grid-cols-1 gap-4">
            {filterRewardsByCategory('retail').map(reward => (
              <RewardCard key={reward.id} reward={reward} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={!!selectedReward} onOpenChange={(open: boolean) => !open && setSelectedReward(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar canje</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de canjear tus ecopoints por este premio?
            </DialogDescription>
          </DialogHeader>

          {selectedReward && (
            <div className="space-y-4">
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={selectedReward.image}
                  alt={selectedReward.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-gray-500">{selectedReward.brand}</p>
                <h3 className="text-gray-900">{selectedReward.name}</h3>
                <p className="text-gray-600 mt-2">{selectedReward.description}</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Costo:</span>
                <div className="flex items-center gap-1">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                  <span className="text-gray-900">{selectedReward.points} puntos</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                <span className="text-gray-700">Tu saldo después:</span>
                <span className="text-gray-900">{(parseFloat(botellas) || 0) - selectedReward.points} puntos</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReward(null)}>
              Cancelar
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={confirmRedeem}
            >
              Confirmar canje
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader> {/* ✅ CORRECCIÓN: Agregar DialogHeader y DialogTitle para A11y */}
            <DialogTitle>Canje Exitoso</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4 py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mx-auto"
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </motion.div>
            <div>
              <h2 className="text-gray-900 mb-2">¡Canje exitoso!</h2>
              <p className="text-gray-600">
                Has canjeado {redeemedReward?.points} ecopoints
              </p>
            </div>
            {redeemedReward && (
              <Card className="p-4 bg-emerald-50">
                <p className="text-emerald-900">
                  {redeemedReward.brand} - {redeemedReward.name}
                </p>
                <p className="text-emerald-700 mt-1">
                  Revisa tu historial para ver el código de canje
                </p>
              </Card>
            )}
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setShowSuccess(false)}
            >
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}