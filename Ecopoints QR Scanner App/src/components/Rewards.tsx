import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Gift, Leaf, Sparkles, Tag, CheckCircle2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// Definición de la interfaz Reward, incluyendo campos opcionales para el canje.
export interface Reward {
  id: string;
  name: string;
  brand: string;
  description: string;
  points: number;
  category: 'restaurant' | 'cafe' | 'retail' | 'entertainment' | string;
  image: string;
  discount?: string;
  validity?: string;
  // Campos agregados temporalmente para el diálogo de éxito
  codigo_entrega?: string;
}

interface RewardsProps {
  balance: number; // Mantenido por si se usa fuera del componente, aunque 'botellas' lo reemplaza
  onRedeem: (reward: Reward) => void;
}

export function Rewards({ onRedeem }: RewardsProps) {
  //  1. CONFIGURACIÓN DE ENDPOINTS
  const API_BASE_URL = "https://ecopoints.hvd.lat/";
  const LISTAR_CONVENIOS_ENDPOINT = "listarConvenios";
  const REGISTRAR_CANJE_ENDPOINT = "canjearPuntos";
  const OBTENER_PUNTOS_ENDPOINT = "obtenerPuntos";

  const idusuario = localStorage.getItem("usuario_id");

  // 2. ESTADOS
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loadingRewards, setLoadingRewards] = useState(true);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [redeemedReward, setRedeemedReward] = useState<Reward | null>(null);
  const [botellas, setBotellas] = useState("0"); // Puntos del usuario (como string)

  // --- Funciones de Llamada a la API ---

  // Función para obtener los puntos del usuario
  const obtenerPuntos = async () => {
    if (!idusuario) return;
    try {
      // URL: https://ecopoints.hvd.lat/obtenerPuntos?usuario_id=...
      const response = await fetch(`${API_BASE_URL}${OBTENER_PUNTOS_ENDPOINT}?usuario_id=${idusuario}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setBotellas(data.puntos ? data.puntos.toString() : "0");
    } catch (error) {
      console.error("Error al obtener puntos:", error);
      setBotellas("0");
    }
  };

  // ✅ Función para obtener la lista de convenios
  const listarConvenios = async () => {
    setLoadingRewards(true);
    try {
      // URL: https://ecopoints.hvd.lat/listarConvenios
      const response = await fetch(`${API_BASE_URL}${LISTAR_CONVENIOS_ENDPOINT}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Mapeo basado en las columnas de tu tabla 'convenios'
      const mappedRewards: Reward[] = data.map((item: any) => ({
        id: item.id.toString(),
        name: item.titulo || 'Convenio sin título',
        brand: item.empresa_id ? `Empresa ID: ${item.empresa_id}` : 'Marca Desconocida',
        description: item.descripcion || 'Sin descripción',
        points: parseInt(item.puntos_requeridos) || 0,

        // Asume que 'categoria', 'url_imagen', 'descuento' y 'vigencia' 
        // son retornados por el script PHP que genera el JSON.
        category: item.categoria || 'other',
        image: item.url_imagen || 'https://images.unsplash.com/photo-1542831371-29b0f74f9d13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9jayUyMG1lYWx8ZW58MXx8fHwxNzYzMTk2NzU5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        discount: item.descuento || undefined,
        validity: item.vigencia || undefined,
      }));

      setRewards(mappedRewards);
    } catch (error) {
      console.error("Error al obtener convenios:", error);
      toast.error('No se pudieron cargar los premios.');
      setRewards([]);
    } finally {
      setLoadingRewards(false);
    }
  };


  // ✅ Función para registrar el canje
  const registrarCanje = async (reward: Reward) => {
    if (!idusuario) {
      toast.error("Error: Sesión de usuario no encontrada.");
      return;
    }

    // Cerramos el diálogo de confirmación mientras se procesa la solicitud
    setSelectedReward(null);

    try {
      // URL: https://ecopoints.hvd.lat/canjearPuntos (POST)
      const response = await fetch(`${API_BASE_URL}${REGISTRAR_CANJE_ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario_id: idusuario,
          convenio_id: reward.id,
        }),
      });

      const data = await response.json();

      // Manejo de errores basado en tu PHP (status 400 o propiedad 'error')
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Fallo desconocido al registrar el canje.');
      }

      // Canje Exitoso
      onRedeem(reward);

      setRedeemedReward({
        ...reward,
        codigo_entrega: data.codigo_entrega,
      });

      setShowSuccess(true);

      obtenerPuntos();
      listarConvenios();

      setTimeout(() => {
        setShowSuccess(false);
        setRedeemedReward(null);
      }, 5000);

    } catch (error: any) {
      console.error("Error al registrar el canje:", error);
      toast.error(error.message || 'Error de conexión. Inténtalo más tarde.');
      // Si hay error, permitimos que el usuario lo intente de nuevo
      setSelectedReward(reward);
    }
  };
  useEffect(() => {
    listarConvenios();
    if (idusuario) {
      obtenerPuntos();
    }
  }, [idusuario]);

  // --- Lógica y Handlers ---

  const handleRedeemClick = (reward: Reward) => {
    const currentPoints = parseFloat(botellas) || 0;
    if (currentPoints >= reward.points) {
      setSelectedReward(reward);
    } else {
      toast.error('No tienes suficientes ecopoints');
    }
  };

  const confirmRedeem = () => {
    if (selectedReward) {
      // Llama a la función de registro real en la API
      registrarCanje(selectedReward);
    }
  };

  const filterRewardsByCategory = (category?: string) => {
    if (!category || category === 'all') return rewards;
    return rewards.filter(r => r.category.toLowerCase() === category.toLowerCase());
  };

  // --- Componente RewardCard (sin cambios funcionales) ---

  const RewardCard = ({ reward }: { reward: Reward }) => {
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

  // --- JSX de Renderizado ---

  return (
    <div className="p-6 space-y-6 pb-24">

      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2 dark:text-white ">Premios</h1>
        <p className="text-black dark:text-white/80">
          Canjea tus ecopoints por premios increíbles
        </p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 mb-1">Tus ecopoints</p>
            <div className="flex items-baseline gap-2">
              {botellas !== "0"
                ? (
                  <>
                    <span className="text-3xl font-semibold">{parseFloat(botellas).toLocaleString()}</span>
                    <span className="text-emerald-100">puntos</span>
                  </>
                )
                : (
                  <span className="text-sm text-emerald-100 italic">Cargando...</span>
                )
              }
            </div>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Gift className="w-8 h-8" />
          </div>
        </div>
      </Card>

      {/* Tabs y Contenido */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="restaurant">Comida</TabsTrigger>
          <TabsTrigger value="cafe">Café</TabsTrigger>
          <TabsTrigger value="retail">Retail</TabsTrigger>
        </TabsList>

        {loadingRewards ? (
          <div className="text-center p-8 text-gray-500 italic">Cargando premios...</div>
        ) : rewards.length === 0 ? (
          <div className="text-center p-8 text-gray-500 italic">No se encontraron premios disponibles.</div>
        ) : (
          <>
            {/* Contenido para 'Todos' */}
            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 gap-4">
                {filterRewardsByCategory('all').map(reward => (
                  <RewardCard key={reward.id} reward={reward} />
                ))}
              </div>
            </TabsContent>

            {/* Contenido para 'restaurant' */}
            <TabsContent value="restaurant" className="mt-6">
              <div className="grid grid-cols-1 gap-4">
                {filterRewardsByCategory('restaurant').map(reward => (
                  <RewardCard key={reward.id} reward={reward} />
                ))}
              </div>
            </TabsContent>

            {/* Contenido para 'cafe' */}
            <TabsContent value="cafe" className="mt-6">
              <div className="grid grid-cols-1 gap-4">
                {filterRewardsByCategory('cafe').map(reward => (
                  <RewardCard key={reward.id} reward={reward} />
                ))}
              </div>
            </TabsContent>

            {/* Contenido para 'retail' */}
            <TabsContent value="retail" className="mt-6">
              <div className="grid grid-cols-1 gap-4">
                {filterRewardsByCategory('retail').map(reward => (
                  <RewardCard key={reward.id} reward={reward} />
                ))}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Dialogo de Confirmación (Se mantiene igual) */}
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
              onClick={confirmRedeem} // Llama a confirmRedeem -> registrarCanje
            >
              Confirmar canje
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ✅ Dialogo de Éxito Corregido para mostrar el código de canje */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
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
              <Card className="p-4 bg-emerald-50 border border-emerald-200">
                <p className="text-emerald-900 font-semibold mb-1">
                  {redeemedReward.brand} - {redeemedReward.name}
                </p>

                {redeemedReward.codigo_entrega && (
                  <div className="bg-white p-3 rounded-lg mt-2 shadow-inner border border-gray-100">
                    <p className="text-sm text-gray-500">Tu código de canje:</p>
                    <p className="text-xl font-mono text-emerald-700 break-words font-bold">
                      {redeemedReward.codigo_entrega}
                    </p>
                  </div>
                )}

                <p className="text-emerald-700 mt-3 text-sm">
                  ¡Guarda este código! Es único y personal.
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