import { useState } from "react";
import { toast } from "sonner";

interface LoginProps {
  onLoginSuccess: (usuarioId: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);

  // Cambia esto por la ruta exacta de tu backend 👇
  const API_URL = "http://localhost:8000/Backend_ecopoints_api-main/index.php";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isRegister ? "registrarUsuario" : "logeoUsuario";

    try {
      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isRegister
            ? { nombre, email, password }
            : { email, password }
        ),
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        toast.error(data.error || "Error en el servidor");
        return;
      }

      if (isRegister) {
        toast.success("Registro exitoso. Ahora inicia sesión.");
        setIsRegister(false);
        setEmail("");
        setPassword("");
        setNombre("");
      } else {
        toast.success("Inicio de sesión exitoso");
        localStorage.setItem("usuario_id", data.id);
        onLoginSuccess(data.id);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión con el servidor");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-emerald-100 to-white">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 text-center">
        <h2 className="text-2xl font-bold text-emerald-700 mb-4">
          {isRegister ? "Crear cuenta" : "Iniciar sesión"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {isRegister && (
            <input
              type="text"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="border p-2 rounded-md focus:ring-2 focus:ring-emerald-400"
              required
            />
          )}

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded-md focus:ring-2 focus:ring-emerald-400"
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded-md focus:ring-2 focus:ring-emerald-400"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 transition"
          >
            {loading ? "Cargando..." : isRegister ? "Registrarse" : "Entrar"}
          </button>
        </form>

        <p className="mt-4 text-sm">
          {isRegister ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-emerald-600 hover:underline"
          >
            {isRegister ? "Inicia sesión" : "Regístrate"}
          </button>
        </p>
      </div>
    </div>
  );
}
