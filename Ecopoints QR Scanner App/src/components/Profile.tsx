import { Card } from './ui/card';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
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

interface ProfileProps {
  balance: number;
  totalScans: number;
  onViewStation?: () => void;
}

export function Profile({ balance, totalScans, onViewStation }: ProfileProps) {
  const level = Math.floor(totalScans / 5) + 1;
  const nextLevelScans = (level * 5) - totalScans;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full border-4 border-white flex items-center justify-center">
            <Award className="w-4 h-4 text-yellow-800" />
          </div>
        </div>
        <h1 className="text-gray-900 mb-1">Juan Perez</h1>
        <p className="text-gray-500">Juan.Perez@email.com</p>
        <Badge className="mt-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
          Nivel {level} - Eco Warrior
        </Badge>
      </div>

      {/* Stats */}
      <Card className="p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Leaf className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-gray-900">{balance}</p>
            <p className="text-gray-500">Puntos</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-gray-900">{totalScans}</p>
            <p className="text-gray-500">Escaneos</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
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
            <p className="text-gray-900">{nextLevelScans} escaneos más</p>
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
        {/* Demo: Ver pantalla de estación */}
        <Card className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
          <p className="text-gray-700 mb-3">🎯 Vista de Desarrollador</p>
          <Button 
            onClick={onViewStation}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <QrCode className="w-5 h-5 mr-2" />
            Ver Estación de Reciclaje
          </Button>
          <p className="text-gray-500 mt-2">Visualiza la pantalla que genera códigos QR</p>
        </Card>
        
        <MenuButton icon={<Settings className="w-5 h-5" />} label="Configuración" />
        <MenuButton icon={<Bell className="w-5 h-5" />} label="Notificaciones" />
        <MenuButton icon={<Shield className="w-5 h-5" />} label="Privacidad y seguridad" />
        <Separator className="my-4" />
        <MenuButton icon={<HelpCircle className="w-5 h-5" />} label="Ayuda y soporte" />
        <MenuButton 
          icon={<LogOut className="w-5 h-5" />} 
          label="Cerrar sesión" 
          className="text-red-600"
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

function MenuButton({ 
  icon, 
  label, 
  className = '' 
}: { 
  icon: React.ReactNode; 
  label: string; 
  className?: string;
}) {
  return (
    <Button 
      variant="ghost" 
      className={`w-full justify-between hover:bg-gray-50 ${className}`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      <ChevronRight className="w-5 h-5" />
    </Button>
  );
}
