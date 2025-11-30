import { useState } from 'react';
import { Switch } from "./ui/switch";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
    Bell,
    Mail,
    X,
    AlertCircle,
    Shield,
    HelpCircle,
    ChevronRight,
    Leaf,
    Moon,
    Sun,
    MessageSquare,
    Phone,
    Lock,
    Eye,
    EyeOff,
    Key,
    Smartphone,
    FileText,
    ExternalLink,
    Send,
    Building,
    CreditCard,
    UserCheck,
    MapPin,
    Globe,
    Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";

// --- Tipos de Props ---
interface ConfiguracionProps {
    theme?: 'light' | 'dark';
    onToggleTheme?: () => void;
    onClose?: () => void;
}

interface NotificacionesProps {
    onClose?: () => void;
}

interface PrivacidadSeguridadProps {
    onClose?: () => void;
}

interface AyudaSoporteProps {
    onClose?: () => void;
}

interface RegistroEmpresaProps {
    onClose?: () => void;
}

// --- Componente de Fila de Información (InfoItem) ---
interface InfoItemWebProps {
    Icon: React.ElementType;
    title: string;
    isLast?: boolean;
}

const InfoItemWeb = ({ Icon, title, isLast = false }: InfoItemWebProps) => {
    return (
        <>
            <div className="flex items-center py-4 px-4">
                <Icon className="w-5 h-5 mr-4 text-emerald-600 dark:text-emerald-400" />
                <div className="flex-1">
                    <p className="text-sm font-semibold mb-0.5 text-gray-900 dark:text-white">{title}</p>
                    <p className="text-base italic text-emerald-600 dark:text-emerald-400 font-bold">Información Requerida</p>
                </div>
            </div>
            {!isLast && <Separator className="mx-4 dark:bg-gray-700" />}
        </>
    );
};

// ... imports y tipos anteriores se mantienen igual ...

// ----------------------------------------------------------------------
//                        SECCIÓN: REGISTRO DE EMPRESA
// ----------------------------------------------------------------------

export function RegistroEmpresa({ onClose }: RegistroEmpresaProps) {
    const handleEmailPress = () => {
        const email = 'soporteecopoints@gmail.com';
        const subject = 'Consulta de Registro de Cuenta Empresa';

        const body = `Estimado equipo de Ecopoints,\n\nEscribo para solicitar ayuda o información adicional sobre el registro de mi cuenta empresa. \n\nMis datos requeridos son:\n
* Nombre Legal de la Empresa: 
* RUC/ID Fiscal: 
* Representante Legal: 
* Email de Contacto: 
* Teléfono de Contacto: 
* Dirección Fiscal Completa: 
* Web URL de la Empresa: 
* Logo de la Empresa (PNG/JPG): 
`;

        const mailtoLink = `mailto:${email}?subject=${subject}&body=${encodeURIComponent(body)}`;
        
        try {
            window.open(mailtoLink, '_self');
            toast.info("Abriendo tu aplicación de correo...");
        } catch (error) {
            console.error('Failed to open mail link:', error);
            toast.error("No se pudo abrir la aplicación de correo. Por favor, envía un email a: soporteecopoints@gmail.com");
        }
    };

    return (
        <div className="p-6 space-y-6 dark:bg-gray-900 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cuenta Empresa</h1>
                    
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="dark:text-white dark:hover:bg-gray-800 rounded-full"
                >
                    <X className="w-5 h-5" />
                </Button>
            </div>

            {/* TARJETA DE INTRODUCCIÓN MEJORADA - COLORES OPTIMIZADOS */}
            <Card className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 dark:from-gray-900 dark:to-gray-950 border-emerald-200 dark:border-gray-700 shadow-lg">
                <div className="flex items-start gap-4">
                    <div className="bg-emerald-100 dark:bg-emerald-900 p-3 rounded-xl">
                        <Leaf className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-emerald-900 dark:text-white">
                            ¡Únete a Ecopoints y Lidera el Cambio!
                        </h2>
                        <p className="text-emerald-700 dark:text-gray-300 mt-2 font-medium">
                            Asegura el impacto ambiental de tu empresa y apoya la lucha contra la contaminación.
                        </p>
                        <div className="mt-3 p-3 bg-white/80 dark:bg-gray-900/90 rounded-lg border border-emerald-200 dark:border-gray-600">
                            <p className="text-sm text-emerald-800 dark:text-gray-200">
                                Para activar tu perfil como <strong className="dark:text-white">Empresa Colaboradora</strong>, debes completar la siguiente información.
                                <span className="text-red-600 dark:text-red-400 font-bold"> Todos los campos son obligatorios.</span>
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* SECCIÓN DE INFORMACIÓN LEGAL Y CONTACTO */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                        <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Información Legal y Contacto</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Datos requeridos para verificación</p>
                    </div>
                </div>
                
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        <InfoItemWeb Icon={Building} title="Nombre Legal de la Empresa *" />
                        <InfoItemWeb Icon={CreditCard} title="RUC/ID Fiscal *" />
                        <InfoItemWeb Icon={UserCheck} title="Representante Legal *" />
                        <InfoItemWeb Icon={Mail} title="Email de Contacto *" />
                        <InfoItemWeb Icon={Phone} title="Teléfono de Contacto *" />
                        <InfoItemWeb Icon={MapPin} title="Dirección Fiscal Completa *" />
                        <InfoItemWeb Icon={Globe} title="Web URL de la Empresa *" />
                        <InfoItemWeb Icon={ImageIcon} title="Logo de la Empresa (PNG/JPG) *" isLast />
                    </div>
                </Card>
            </div>

            {/* BOTÓN DE ACCIÓN */}
            <div className="pt-4">
                <Button 
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white flex items-center justify-center rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                    onClick={handleEmailPress}
                    size="lg"
                >
                    <Mail className="w-5 h-5 mr-3" />
                    <span className="text-base font-bold">Enviar Correo a Soporte</span>
                </Button>
            </div>
            
            {/* NOTA INFORMATIVA - COLORES MEJORADOS */}
            <Card className="p-4 bg-amber-50 border-amber-200 dark:bg-amber-900 dark:border-amber-800">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-amber-800 dark:text-amber-100 text-sm font-medium">
                            Al enviar el correo, nuestro equipo de soporte validará los datos y te contactará para finalizar la activación de tu cuenta.
                        </p>
                        <p className="text-amber-700 dark:text-amber-200 text-xs mt-2">
                            Tiempo estimado de respuesta: 24-48 horas
                        </p>
                    </div>
                </div>
            </Card>

            <Card className="p-4 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="text-blue-900 dark:text-blue-100 text-sm font-semibold mb-1">
                            ¿Necesitas ayuda con los documentos?
                        </h3>
                        <p className="text-blue-800 dark:text-blue-300 text-sm">
                            Asegúrate de que todos los documentos estén actualizados y sean legibles. 
                            Para consultas adicionales, contacta a nuestro equipo legal.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

// ... el resto de los componentes se mantienen igual ...


// ----------------------------------------------------------------------
//                        SECCIÓN: CONFIGURACIÓN
// ----------------------------------------------------------------------

export function Configuracion({ theme = 'light', onToggleTheme, onClose }: ConfiguracionProps) {
    return (
        <div className="p-6 space-y-6 dark:bg-gray-900 min-h-screen">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración</h1>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="dark:text-white dark:hover:bg-gray-800 rounded-full"
                >
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Apariencia</h2>
                <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {theme === 'dark' ? (
                                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            ) : (
                                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            )}
                            <div>
                                <p className="text-gray-900 dark:text-white font-medium">Modo oscuro</p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Ahorra batería y reduce el brillo</p>
                            </div>
                        </div>
                        <Switch
                            checked={theme === 'dark'}
                            onCheckedChange={onToggleTheme}
                        />
                    </div>
                </Card>
            </div>

            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Acerca de</h2>
                <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 mb-2">Versión 1.0.0</p>
                    <p className="text-gray-500 dark:text-gray-400">© 2025 EcoPoints</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-4">
                        Una aplicación para incentivar el reciclaje y cuidar nuestro planeta.
                    </p>
                </Card>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
//                        SECCIÓN: NOTIFICACIONES
// ----------------------------------------------------------------------

export function Notificaciones({ onClose }: NotificacionesProps) {
    const [notificationSettings, setNotificationSettings] = useState({
        newRewards: true,
        recyclingReminders: true,
        achievements: true,
        promotions: false,
        weeklyReport: true,
        emailNotifications: true,
        pushNotifications: true,
        soundEnabled: true
    });

    return (
        <div className="p-6 space-y-6 dark:bg-gray-900 min-h-screen">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notificaciones</h1>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="dark:text-white dark:hover:bg-gray-800 rounded-full"
                >
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notificaciones Push</h2>
                <Card className="p-4 space-y-4 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <div>
                                <p className="text-gray-900 dark:text-white font-medium">Activar notificaciones</p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Recibe alertas en tu dispositivo</p>
                            </div>
                        </div>
                        <Switch
                            checked={notificationSettings.pushNotifications}
                            onCheckedChange={(checked) => {
                                setNotificationSettings({ ...notificationSettings, pushNotifications: checked });
                                toast.success(checked ? 'Notificaciones activadas' : 'Notificaciones desactivadas');
                            }}
                        />
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-900 dark:text-white font-medium">Sonido</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Reproducir sonido al recibir notificaciones</p>
                        </div>
                        <Switch
                            checked={notificationSettings.soundEnabled}
                            onCheckedChange={(checked) =>
                                setNotificationSettings({ ...notificationSettings, soundEnabled: checked })
                            }
                        />
                    </div>
                </Card>
            </div>

            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tipos de notificaciones</h2>
                <Card className="p-4 space-y-4 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-900 dark:text-white font-medium">Nuevas recompensas</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Cuando hay nuevos premios disponibles</p>
                        </div>
                        <Switch
                            checked={notificationSettings.newRewards}
                            onCheckedChange={(checked) =>
                                setNotificationSettings({ ...notificationSettings, newRewards: checked })
                            }
                        />
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-900 dark:text-white font-medium">Recordatorios de reciclaje</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Notificaciones semanales para reciclar</p>
                        </div>
                        <Switch
                            checked={notificationSettings.recyclingReminders}
                            onCheckedChange={(checked) =>
                                setNotificationSettings({ ...notificationSettings, recyclingReminders: checked })
                            }
                        />
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-900 dark:text-white font-medium">Logros desbloqueados</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Celebra tus nuevos logros</p>
                        </div>
                        <Switch
                            checked={notificationSettings.achievements}
                            onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, achievements: checked })
                            }
                        />
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-900 dark:text-white font-medium">Promociones</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Ofertas especiales y descuentos</p>
                        </div>
                        <Switch
                            checked={notificationSettings.promotions}
                            onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, promotions: checked })
                            }
                        />
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-900 dark:text-white font-medium">Reporte semanal</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Resumen de tu actividad ecológica</p>
                        </div>
                        <Switch
                            checked={notificationSettings.weeklyReport}
                            onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, weeklyReport: checked })
                            }
                        />
                    </div>
                </Card>
            </div>

            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Correo electrónico</h2>
                <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <div>
                                <p className="text-gray-900 dark:text-white font-medium">Notificaciones por email</p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Recibe resúmenes por correo</p>
                            </div>
                        </div>
                        <Switch
                            checked={notificationSettings.emailNotifications}
                            onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                            }
                        />
                    </div>
                </Card>
            </div>

            <Card className="p-4 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-emerald-700 dark:text-emerald-300 text-sm">
                            Las notificaciones te ayudan a mantener tus hábitos de reciclaje y no perderte ninguna recompensa.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

// ----------------------------------------------------------------------
//                        SECCIÓN: PRIVACIDAD Y SEGURIDAD
// ----------------------------------------------------------------------

export function PrivacidadSeguridad({ onClose }: PrivacidadSeguridadProps) {
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [privacySettings, setPrivacySettings] = useState({
        twoFactorAuth: false,
        profilePublic: true,
        shareStats: true,
        showInLeaderboard: true,
        location: true,
        dataCollection: true
    });

    const handlePasswordChange = async () => {
        if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
            toast.error('Todos los campos son obligatorios');
            return;
        }

        if (passwordData.new !== passwordData.confirm) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        if (passwordData.new.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (passwordData.new === passwordData.current) {
            toast.error('La nueva contraseña debe ser diferente a la actual');
            return;
        }

        setIsLoading(true);

        try {
            const usuario_id = localStorage.getItem('usuario_id') || '2';

            const requestBody = {
                usuario_id: parseInt(usuario_id),
                contrasena_actual: passwordData.current,
                nueva_contrasena: passwordData.new
            };

            const response = await fetch('https://ecopoints.hvd.lat/api/actualizarContrasena', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.mensaje || 'Contraseña actualizada exitosamente');
                setShowChangePassword(false);
                setPasswordData({ current: '', new: '', confirm: '' });
            } else {
                if (data.error && data.error.includes('incorrecta')) {
                    toast.error('La contraseña actual es incorrecta');
                } else {
                    toast.error(data.error || 'Error al cambiar la contraseña');
                }
            }
        } catch (error) {
            toast.error('Error de conexión. Intenta nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6 dark:bg-gray-900 min-h-screen">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Privacidad y Seguridad</h1>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="dark:text-white dark:hover:bg-gray-800 rounded-full"
                >
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Seguridad de cuenta</h2>
                <Card className="p-4 space-y-4 dark:bg-gray-800 dark:border-gray-700">
                    <Button
                        variant="outline"
                        className="w-full justify-between dark:bg-gray-700 dark:border-gray-600 dark:text-white h-12"
                        onClick={() => setShowChangePassword(!showChangePassword)}
                    >
                        <div className="flex items-center gap-3">
                            <Key className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <span className="font-medium">Cambiar contraseña</span>
                        </div>
                        <ChevronRight className="w-5 h-5" />
                    </Button>

                    {showChangePassword && (
                        <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                            <div className="space-y-2">
                                <Label htmlFor="current-password" className="text-gray-900 dark:text-white">Contraseña actual</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="current-password"
                                        type={showPassword ? "text" : "password"}
                                        className="pl-10 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={passwordData.current}
                                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                        placeholder="Ingresa tu contraseña actual"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="new-password" className="text-gray-900 dark:text-white">Nueva contraseña</Label>
                                <div className="relative">
                                    <Input
                                        id="new-password"
                                        type={showNewPassword ? "text" : "password"}
                                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={passwordData.new}
                                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                        placeholder="Mínimo 6 caracteres"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        disabled={isLoading}
                                    >
                                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm-password" className="text-gray-900 dark:text-white">Confirmar contraseña</Label>
                                <div className="relative">
                                    <Input
                                        id="confirm-password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={passwordData.confirm}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                        placeholder="Repite tu nueva contraseña"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        disabled={isLoading}
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowChangePassword(false);
                                        setPasswordData({ current: '', new: '', confirm: '' });
                                    }}
                                    className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    disabled={isLoading}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handlePasswordChange}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Actualizando...
                                        </div>
                                    ) : (
                                        'Actualizar contraseña'
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    <Separator className="dark:bg-gray-700" />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <div>
                                <p className="text-gray-900 dark:text-white font-medium">Autenticación de dos factores</p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Mayor seguridad para tu cuenta</p>
                            </div>
                        </div>
                        <Switch
                            checked={privacySettings.twoFactorAuth}
                            onCheckedChange={(checked) => {
                                setPrivacySettings({ ...privacySettings, twoFactorAuth: checked });
                                toast.success(checked ? '2FA activado' : '2FA desactivado');
                            }}
                        />
                    </div>
                </Card>
            </div>

            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Privacidad de datos</h2>
                <Card className="p-4 space-y-4 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-900 dark:text-white font-medium">Perfil público</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Otros usuarios pueden ver tu perfil</p>
                        </div>
                        <Switch
                            checked={privacySettings.profilePublic}
                            onCheckedChange={(checked) =>
                                setPrivacySettings({ ...privacySettings, profilePublic: checked })
                            }
                        />
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-900 dark:text-white font-medium">Compartir estadísticas</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Visible en el ranking global</p>
                        </div>
                        <Switch
                            checked={privacySettings.shareStats}
                            onCheckedChange={(checked) =>
                                setPrivacySettings({ ...privacySettings, shareStats: checked })
                            }
                        />
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-900 dark:text-white font-medium">Mostrar en leaderboard</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Aparecer en tablas de posiciones</p>
                        </div>
                        <Switch
                            checked={privacySettings.showInLeaderboard}
                            onCheckedChange={(checked) =>
                                setPrivacySettings({ ...privacySettings, showInLeaderboard: checked })
                            }
                        />
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-900 dark:text-white font-medium">Ubicación</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Para encontrar estaciones cercanas</p>
                        </div>
                        <Switch
                            checked={privacySettings.location}
                            onCheckedChange={(checked) =>
                                setPrivacySettings({ ...privacySettings, location: checked })
                            }
                        />
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-900 dark:text-white font-medium">Recopilación de datos</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Para mejorar la experiencia</p>
                        </div>
                        <Switch
                            checked={privacySettings.dataCollection}
                            onCheckedChange={(checked) =>
                                setPrivacySettings({ ...privacySettings, dataCollection: checked })
                            }
                        />
                    </div>
                </Card>
            </div>

            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gestión de datos</h2>
                <Card className="p-4 space-y-3 dark:bg-gray-800 dark:border-gray-700">
                    <Button
                        variant="outline"
                        className="w-full justify-between h-12 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        onClick={() => toast.success('Descargando tus datos...')}
                    >
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <span className="font-medium">Descargar mis datos</span>
                        </div>
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full justify-between h-12 text-red-600 dark:text-red-400 dark:bg-gray-700 dark:border-gray-600"
                        onClick={() => toast.error('Para eliminar tu cuenta, contacta a soporte')}
                    >
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-medium">Eliminar mi cuenta</span>
                        </div>
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </Card>
            </div>

            <Card className="p-4 bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-blue-700 dark:text-blue-300 text-sm">
                            Tu privacidad es importante. Protegemos tus datos con encriptación de grado bancario.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

// ----------------------------------------------------------------------
//                        SECCIÓN: AYUDA Y SOPORTE
// ----------------------------------------------------------------------

export function AyudaSoporte({ onClose }: AyudaSoporteProps) {
    return (
        <div className="p-6 space-y-6 dark:bg-gray-900 min-h-screen">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ayuda y Soporte</h1>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="dark:text-white dark:hover:bg-gray-800 rounded-full"
                >
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <Card className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3 mb-3">
                    <HelpCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    <h2 className="text-gray-900 dark:text-white font-semibold">¿Necesitas ayuda?</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Estamos aquí para ayudarte. Contáctanos por cualquiera de estos medios.
                </p>
            </Card>

            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contacto</h2>
                <Card className="p-4 space-y-3 dark:bg-gray-800 dark:border-gray-700">
                    <Button
                        variant="outline"
                        className="w-full justify-between h-14 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        onClick={() => toast.success('Abriendo chat...')}
                    >
                        <div className="flex items-center gap-3">
                            <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <div className="text-left">
                                <p className="text-gray-900 dark:text-white font-medium">Chat en vivo</p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Disponible 24/7</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5" />
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full justify-between h-14 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        onClick={() => {
                            window.location.href = 'mailto:soporte@ecopoints.com';
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <div className="text-left">
                                <p className="text-gray-900 dark:text-white font-medium">Email</p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">soporte@ecopoints.com</p>
                            </div>
                        </div>
                        <ExternalLink className="w-5 h-5" />
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full justify-between h-14 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        onClick={() => {
                            window.location.href = 'tel:+51987654321';
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <div className="text-left">
                                <p className="text-gray-900 dark:text-white font-medium">Teléfono</p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">+51 987 654 321</p>
                            </div>
                        </div>
                        <ExternalLink className="w-5 h-5" />
                    </Button>
                </Card>
            </div>

            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preguntas frecuentes</h2>
                <Card className="p-4 space-y-4 dark:bg-gray-800 dark:border-gray-700">
                    <div className="space-y-2">
                        <h3 className="text-gray-900 dark:text-white font-medium">¿Cómo gano puntos?</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Escanea códigos QR en nuestras estaciones de reciclaje. Cada escaneo te otorga entre 10 y 100 puntos según el material reciclado.
                        </p>
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="space-y-2">
                        <h3 className="text-gray-900 dark:text-white font-medium">¿Cómo canjeo mis puntos?</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Ve a la sección de Recompensas, elige el premio que desees y presiona "Canjear". Los códigos se envían a tu email.
                        </p>
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="space-y-2">
                        <h3 className="text-gray-900 dark:text-white font-medium">¿Dónde encuentro estaciones de reciclaje?</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Actualmente tenemos estaciones en Miraflores, San Isidro, Surco y Barranco. Próximamente en más distritos.
                        </p>
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="space-y-2">
                        <h3 className="text-gray-900 dark:text-white font-medium">¿Los puntos expiran?</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            No, tus EcoPoints nunca expiran. Acumúlalos todo el tiempo que quieras.
                        </p>
                    </div>
                </Card>
            </div>

            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tutoriales</h2>
                <Card className="p-4 space-y-3 dark:bg-gray-800 dark:border-gray-700">
                    <Button
                        variant="outline"
                        className="w-full justify-between h-12 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        onClick={() => toast.success('Abriendo tutorial...')}
                    >
                        <span className="font-medium">Cómo escanear códigos QR</span>
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full justify-between h-12 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        onClick={() => toast.success('Abriendo tutorial...')}
                    >
                        <span className="font-medium">Guía de reciclaje correcto</span>
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full justify-between h-12 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        onClick={() => toast.success('Abriendo tutorial...')}
                    >
                        <span className="font-medium">Cómo subir de nivel</span>
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </Card>
            </div>

            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reportar un problema</h2>
                <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        ¿Encontraste un error? Ayúdanos a mejorar reportándolo.
                    </p>
                    <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12"
                        onClick={() => toast.success('Gracias por tu reporte. Nos pondremos en contacto pronto.')}
                    >
                        <Send className="w-4 h-4 mr-2" />
                        <span className="font-medium">Enviar reporte</span>
                    </Button>
                </Card>
            </div>

            <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
                <h3 className="text-gray-900 dark:text-white font-semibold mb-3">Síguenos</h3>
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white h-12"
                        onClick={() => window.open('https://instagram.com', '_blank')}
                    >
                        <span className="font-medium">Instagram</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white h-12"
                        onClick={() => window.open('https://facebook.com', '_blank')}
                    >
                        <span className="font-medium">Facebook</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white h-12"
                        onClick={() => window.open('https://twitter.com', '_blank')}
                    >
                        <span className="font-medium">Twitter</span>
                    </Button>
                    <Button
                        variant="outline"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white h-12"
                        onClick={() => window.open('https://tiktok.com', '_blank')}
                    >
                        <span className="font-medium">TikTok</span>
                    </Button>
                </div>
            </Card>
        </div>
    );
}