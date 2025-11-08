import { Card } from './ui/card';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { useEffect, useState } from "react";
import {
  User,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Award,
  Leaf,
  TrendingUp,
  QrCode
} from 'lucide-react';

// --- Definiciones de Tipos ---
type Transaction = {
  id: string;
  type: "scan" | "redeem";
  description: string;
  location: string;
  points: number;
  date: string;
};

interface ProfileProps {
  // Eliminamos 'balance' y 'totalScans' de props ya que los calcularemos internamente
  onViewStation?: () => void;
  onLogout?: () => void;
}

// ----------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ----------------------------------------------------------------

export function Profile({ onViewStation, onLogout }: ProfileProps) {
  const API_URL = "https://ecopoints.hvd.lat/api/";
  const idusuario = localStorage.getItem("usuario_id");

  // ✅ ESTADO INTERNO: Puntos del usuario (Balance)
  const [botellas, setBotellas] = useState<number | null>(null);

  // ✅ ESTADO INTERNO: Historial de transacciones
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- LÓGICA DE OBTENCIÓN DE DATOS ---

  // Función para obtener el Balance (Puntos)
  const obtenerPuntos = async () => {
    if (!idusuario) return;
    try {
      const response = await fetch(`${API_URL}/obtenerPuntos?usuario_id=${idusuario}`, {
        method: "GET",
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      // Aseguramos que se guarda como número o se convierte a número si viene como string
      setBotellas(Number(data.puntos));
    } catch (error) {
      console.error("Error al obtener puntos:", error);
      setBotellas(0); // Establecer a 0 en caso de error
    }
  };

  // Función para obtener el Historial (Escaneos/Canjes)
  const obtenerHistorial = async () => {
    if (!idusuario) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/obtenerHistorial?usuario_id=${idusuario}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: Transaction[] = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error al obtener historial:", error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ HOOK: Llamar a las funciones al montar el componente
  useEffect(() => {
    if (idusuario) {
      obtenerPuntos();
      obtenerHistorial();
    } else {
      setIsLoading(false);
      setBotellas(0);
    }
  }, [idusuario]);

  // --- CÁLCULOS DERIVADOS ---

  // Filtramos los escaneos (transacciones de tipo 'scan')
  const escaneos = transactions.filter(t => t.type === 'scan');
  const totalScans = escaneos.length;

  // Lógica de Nivel basada en escaneos (totalScans)
  const level = Math.floor(totalScans / 5) + 1;
  const nextLevelScans = (level * 5) - totalScans;

  // Manejo de carga de puntos para la visualización
  const currentPoints = botellas !== null ? botellas : '...';
  const displayScans = isLoading ? '...' : totalScans;

  // Lógica para la Badge (basada en el ejemplo anterior)
  const getLevelBadge = (points: number | null) => {
    if (points === null) return 'Cargando...';
    if (points < 60) return 'Nivel 1 - Eco Novice'; // Cambié la etiqueta Novice/Warrior/Hero para que tenga sentido con los niveles
    if (points < 100) return 'Nivel 2 - Eco Warrior';
    return 'Nivel 3 - Eco Hero';
  };


  return (
    <div className="p-6 space-y-6">

      <div className="text-center">
        {/* Header y Nivel */}
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full border-4 border-white flex items-center justify-center">
            <Award className="w-4 h-4 text-yellow-800" />
          </div>
        </div>
        <h1 className="text-gray-900 mb-1">{localStorage.getItem("usuario_nombre")}</h1>
        <p className="text-gray-500">{localStorage.getItem("usuario_correo")}</p>
        <Badge className="mt-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
          {getLevelBadge(botellas)}
        </Badge>
      </div>

      {/* Stats */}
      <Card className="p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Leaf className="w-6 h-6 text-emerald-600" />
            </div>
            {/* Puntos */}
            <p className="text-gray-900">{botellas === null ? '...' : botellas.toLocaleString()}</p>
            <p className="text-gray-500">Puntos</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            {/* Escaneos Totales */}
            <p className="text-gray-900">{displayScans}</p>
            <p className="text-gray-500">Escaneos</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            {/* Nivel */}
            <p className="text-gray-900">{level}</p>
            <p className="text-gray-500">Nivel</p>
          </div>
        </div>
      </Card>

      {/* Progress to next level */}
      <Card className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-gray-700">Próximo nivel</p>
            {/* Próximos escaneos */}
            <p className="text-gray-900">{isLoading ? '...' : `${nextLevelScans} escaneos más`}</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all"
              style={{ width: `${((totalScans % 5) / 5) * 100}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Menu Items */}
      <div className="space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-between hover:bg-gray-50"
          onClick={onViewStation}
        >
          <div className="flex items-center gap-3">
            <QrCode className="w-5 h-5" />
            <span>Puntos de recolección</span>
          </div>
          <ChevronRight className="w-5 h-5" />
        </Button>
        <Separator className="my-2" /> {/* Separador adicional si es necesario */}
        <MenuButton icon={<Settings className="w-5 h-5" />} label="Configuración" />
        <MenuButton icon={<Bell className="w-5 h-5" />} label="Notificaciones" />
        <MenuButton icon={<Shield className="w-5 h-5" />} label="Privacidad y seguridad" />
        <Separator className="my-4" />
        <MenuButton icon={<HelpCircle className="w-5 h-5" />} label="Ayuda y soporte" />
        <MenuButton
          icon={<LogOut className="w-5 h-5" />}
          label="Cerrar sesión"
          className="text-red-600"
          onClick={onLogout}
        />
      </div>

      {/* App Info */}
      <div className="text-center pt-4">
        <p className="text-gray-400">EcoPoints v1.0.0</p>
        <p className="text-gray-400">© 2025 EcoPoints. Todos los derechos reservados.</p>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// COMPONENTE AUXILIAR (Se mantiene igual)
// ----------------------------------------------------------------

function MenuButton({
  icon,
  label,
  className = '',
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Button
      variant="ghost"
      className={`w-full justify-between hover:bg-gray-50 ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      <ChevronRight className="w-5 h-5" />
    </Button>
  );
}