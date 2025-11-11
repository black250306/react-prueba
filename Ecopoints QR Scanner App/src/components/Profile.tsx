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
  QrCode,
  ArrowLeft
} from 'lucide-react';

// Importa los componentes de las secciones
import {
  Configuracion,
  Notificaciones,
  PrivacidadSeguridad,
  AyudaSoporte
} from './ProfileSections';

// --- Tipos ---
type Transaction = {
  id: string;
  type: "scan" | "redeem";
  description: string;
  location: string;
  points: number;
  date: string;
};

interface ProfileProps {
  onViewStation?: () => void;
  onLogout?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

// -------------------------------------------------------
// COMPONENTE PRINCIPAL
// -------------------------------------------------------

export function Profile({ onViewStation, onLogout, theme = 'light', onToggleTheme }: ProfileProps) {
  const API_URL = "https://ecopoints.hvd.lat/api/";
  const idusuario = localStorage.getItem("usuario_id");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const [botellas, setBotellas] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Obtener puntos ---
  const obtenerPuntos = async () => {
    if (!idusuario) return;
    try {
      const response = await fetch(`${API_URL}/obtenerPuntos?usuario_id=${idusuario}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setBotellas(Number(data.puntos));
    } catch {
      setBotellas(0);
    }
  };

  // --- Obtener historial ---
  const obtenerHistorial = async () => {
    if (!idusuario) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/obtenerHistorial?usuario_id=${idusuario}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: Transaction[] = await response.json();
      setTransactions(data);
    } catch {
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (idusuario) {
      obtenerPuntos();
      obtenerHistorial();
    } else {
      setIsLoading(false);
      setBotellas(0);
    }
  }, [idusuario]);

  // --- Cálculos CORREGIDOS ---
  const escaneos = transactions.filter(t => t.type === 'scan');
  const totalScans = escaneos.length;

  // Definir los niveles y sus requisitos de escaneos
  const niveles = [
    { nivel: 1, escaneosRequeridos: 0, nombre: "Eco Novice" },
    { nivel: 2, escaneosRequeridos: 10, nombre: "Eco Warrior" },
    { nivel: 3, escaneosRequeridos: 50, nombre: "Eco Hero" },
    { nivel: 4, escaneosRequeridos: 100, nombre: "Eco Champion" },
    { nivel: 5, escaneosRequeridos: 500, nombre: "Eco Master" },
    { nivel: 6, escaneosRequeridos: 1000, nombre: "Eco Legend" },
    { nivel: 7, escaneosRequeridos: 5000, nombre: "Eco Guardian" }
  ];

  // Calcular el nivel actual
  const calcularNivel = (escaneos: number) => {
    for (let i = niveles.length - 1; i >= 0; i--) {
      if (escaneos >= niveles[i].escaneosRequeridos) {
        return niveles[i];
      }
    }
    return niveles[0];
  };

  const nivelActual = calcularNivel(totalScans);
  const level = nivelActual.nivel;

  // Calcular el siguiente nivel y escaneos faltantes
  const siguienteNivel = niveles.find(n => n.nivel === level + 1);
  const escaneosFaltantes = siguienteNivel
    ? siguienteNivel.escaneosRequeridos - totalScans
    : 0;

  // Calcular progreso para la barra (porcentaje hacia el siguiente nivel)
  const calcularProgreso = () => {
    if (!siguienteNivel) return 100; // Si es el nivel máximo

    const nivelAnterior = niveles.find(n => n.nivel === level);
    const escaneosEnEsteNivel = totalScans - (nivelAnterior?.escaneosRequeridos || 0);
    const escaneosNecesariosParaSubir = siguienteNivel.escaneosRequeridos - (nivelAnterior?.escaneosRequeridos || 0);

    return (escaneosEnEsteNivel / escaneosNecesariosParaSubir) * 100;
  };

  const progreso = calcularProgreso();

  const getLevelBadge = () => {
    return `Nivel ${level} - ${nivelActual.nombre}`;
  };

  // --- Subpantallas usando los componentes importados ---
  if (activeSection === "configuracion") {
    return (
      <Configuracion
        onClose={() => setActiveSection(null)}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />
    );
  }

  if (activeSection === "notificaciones") {
    return (
      <Notificaciones
        onClose={() => setActiveSection(null)}
      />
    );
  }

  if (activeSection === "privacidad") {
    return (
      <PrivacidadSeguridad
        onClose={() => setActiveSection(null)}
      />
    );
  }

  if (activeSection === "ayuda") {
    return (
      <AyudaSoporte
        onClose={() => setActiveSection(null)}
      />
    );
  }

  // --- Pantalla principal ---
  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center">
            <Award className="w-4 h-4 text-yellow-800" />
          </div>
        </div>
        <h1 className="text-gray-900 dark:text-white mb-1">{localStorage.getItem("usuario_nombre")}</h1>
        <p className="text-gray-500 dark:text-gray-400">{localStorage.getItem("usuario_correo")}</p>
        <Badge className="mt-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-300">
          {getLevelBadge()}
        </Badge>
      </div>

      {/* Estadísticas */}
      <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <Stat icon={<Leaf className="w-6 h-6 text-emerald-600" />} label="Puntos" value={botellas ?? '...'} />
          <Stat icon={<TrendingUp className="w-6 h-6 text-blue-600" />} label="Escaneos" value={isLoading ? '...' : totalScans} />
          <Stat icon={<Award className="w-6 h-6 text-purple-600" />} label="Nivel" value={level} />
        </div>
      </Card>

      {/* Progreso CORREGIDO */}
      <Card className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950 dark:to-blue-950 dark:border-gray-700">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-gray-700 dark:text-gray-300">Próximo nivel</p>
            <p className="text-gray-900 dark:text-white">
              {isLoading ? '...' :
                siguienteNivel
                  ? `${escaneosFaltantes} escaneo${escaneosFaltantes !== 1 ? 's' : ''} más`
                  : '¡Nivel máximo alcanzado!'}
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all"
              style={{ width: `${progreso}%` }}
            />
          </div>
          {siguienteNivel && (
            <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
              Hacia {siguienteNivel.nombre}
            </p>
          )}
        </div>
      </Card>

      {/* Opciones */}
      <div className="space-y-2">

        <Separator className="my-2" />

        <MenuButton icon={<QrCode className="w-5 h-5" />} label="Puntos de recoleccion" onClick={() => setActiveSection("")} />
        <MenuButton icon={<Settings className="w-5 h-5" />} label="Configuración" onClick={() => setActiveSection("configuracion")} />
        <MenuButton icon={<Bell className="w-5 h-5" />} label="Notificaciones" onClick={() => setActiveSection("notificaciones")} />
        <MenuButton icon={<Shield className="w-5 h-5" />} label="Privacidad y seguridad" onClick={() => setActiveSection("privacidad")} />
        <Separator className="my-4" />
        <MenuButton icon={<HelpCircle className="w-5 h-5" />} label="Ayuda y soporte" onClick={() => setActiveSection("ayuda")} />
        <MenuButtonsa icon={<LogOut className="w-5 h-5" />} label="Cerrar sesión" className="text-red-600" onClick={onLogout} />
      </div>

      <div className="text-center pt-4">
        <p className="text-gray-400">EcoPoints v1.0.0</p>
        <p className="text-gray-400">© 2025 EcoPoints. Todos los derechos reservados.</p>
      </div>
    </div>
  );
}

// -------------------------------------------------------
// SUBCOMPONENTES (solo los que usa Profile)
// -------------------------------------------------------

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: any }) {
  return (
    <div>
      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
        {icon}
      </div>
      <p className="text-gray-900 dark:text-white">{value}</p>
      <p className="text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

function MenuButton({ icon, label, className = '', onClick }: { icon: React.ReactNode; label: string; className?: string; onClick?: () => void }) {
  return (
    <Button variant="ghost" className={`w-full justify-between hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white ${className}`} onClick={onClick}>
      <div className="flex items-center gap-3">{icon}<span>{label}</span></div>
      <ChevronRight className="w-5 h-5" />
    </Button>
  );
}
function MenuButtonsa({ icon, label, className = '', onClick }: { icon: React.ReactNode; label: string; className?: string; onClick?: () => void }) {
  return (
    <Button variant="ghost" className={`w-full justify-between hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white ${className}`} onClick={onClick}>
      <div className="flex items-center gap-3 text-red-600">{icon}<span>{label}</span></div>
      <ChevronRight className="w-5 h-5" />
    </Button>
  );
}