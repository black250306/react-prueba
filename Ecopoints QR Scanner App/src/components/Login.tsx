import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Leaf, User, Mail, Lock, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface LoginProps {
  onLoginSuccess: (usuarioId: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const API_URL = "https://ecopoints.hvd.lat/api/";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isLogin ? "logeoUsuario" : "registrarUsuario";

    try {
      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isLogin
            ? { email: formData.email, password: formData.password }
            : { nombre: formData.nombre, email: formData.email, password: formData.password }
        ),
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        toast.error(data.error || "Error en el servidor");
        return;
      }

      if (isLogin) {
        toast.success("Inicio de sesión exitoso");
        localStorage.setItem("usuario_id", data.id);
        localStorage.setItem("usuario_nombre", data.nombre);
        localStorage.setItem("usuario_correo", data.correo);
        onLoginSuccess(data.id);
      } else {
        toast.success("Registro exitoso. Ahora inicia sesión.");
        setIsLogin(true);
        setFormData({ nombre: "", email: "", password: "" });
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión con el servidor");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 "
        >
          <div className="inline-flex items-center justify-center w-32 h-32 bg-white rounded-full shadow-lg mb-2 ">
            <Leaf className="w-16 h-16 text-emerald-600" />
          </div>
          <h1 className="text-white  mb-2 text-4xl font-medium">EcoPoints</h1>
          <p className="text-emerald-100 font-medium mb-4">Recicla, gana puntos y cambia el mundo</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className=" bg-white rounded-2xl shadow-2xl p-8"
        >
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-blue p-1 rounded-lg">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-md transition-all ${isLogin ? 'bg-blue-700 text-emerald-600 dark:text-emerald-400  shadow' : 'text-white'}`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-md transition-all ${!isLogin ? 'bg-blue-700 text-emerald-600 dark:text-emerald-400  shadow' : 'text-white'}`}
            >
              Registrarse
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {!isLogin && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2"
              >
                <Label htmlFor="name">Nombre completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="name"
                    name="nombre"
                    type="text"
                    placeholder="María Rodriguez"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="pl-8"
                    required={!isLogin}
                  />
                </div>
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-8"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-8"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-2 rounded-md hover:from-emerald-600 hover:to-emerald-700 flex items-center justify-center"
            >
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Procesando...</> : isLogin ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          </form>

          {isLogin && (
            <div className="mt-4 text-center">
              <button className="text-emerald-600 hover:underline">¿Olvidaste tu contraseña?</button>
            </div>
          )}

          <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-emerald-700 text-center">
              ♻️ Únete a nuestra comunidad de {isLogin ? "recicladores" : "más de 1,000 usuarios"} comprometidos con el planeta
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6 text-emerald-100"
        >
          <p>Al continuar, aceptas nuestros términos y condiciones</p>
        </motion.div>
      </div>
    </div>
  );
}
