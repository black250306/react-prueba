import { Transaction } from '../App';
import { useEffect, useState } from "react";
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ArrowUpRight, Gift, Leaf, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeProps {
  onNavigateToRewards: () => void;
}

export function Home({ onNavigateToRewards }: HomeProps) {
  const API_URL = "https://ecopoints.hvd.lat/api/";
  const idusuario = localStorage.getItem("usuario_id");
  const [botellas, setBotellas] = useState("");

  type Transaction = {
    id: string;
    type: "scan" | "redeem";
    description: string;
    location: string;
    points: number;
    date: string;
  };

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  const obtenerHistorial = async () => {
    try {
      const response = await fetch(`${API_URL}/obtenerHistorial?usuario_id=${idusuario}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: Transaction[] = await response.json();
      setRecentTransactions(data);
    } catch (error) {
      console.error("Error al obtener historial:", error);
    }
  };

  useEffect(() => {
    obtenerHistorial();
  }, [idusuario]);

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

  obtenerPuntos(idusuario!) as unknown as number;



  return (
    <div className="p-6 space-y-6 --tw-inset-shadow-alpha">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500">Hola,</p>
          <h1 className="text-gray-900">{localStorage.getItem("usuario_nombre")}</h1>
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
          <Leaf className="w-6 h-6 text-white" />
        </div>
      </div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-6 border-0">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5" />
              <span className="text-emerald-100">Balance disponible</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl">{botellas.toLocaleString()}</span>
                <span className="text-xl text-emerald-100">ecopoints</span>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                className="flex-1 bg-white text-emerald-600 hover:bg-emerald-50"
                onClick={onNavigateToRewards}
              >
                <Gift className="w-4 h-4 mr-2" />
                Canjear
              </Button>
              <Button
                className="flex-1 bg-emerald-600 border border-white/30 text-white hover:bg-emerald-800"
                onClick={onNavigateToRewards}
              >
                Ver premios
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900">Actividad reciente</h2>
          <button className="text-emerald-600 flex items-center gap-1">
            Ver todo
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <motion.div
              key={transaction.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === 'scan'
                      ? 'bg-emerald-100'
                      : 'bg-orange-100'
                      }`}>
                      {transaction.type === 'scan' ? (
                        <Leaf className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Gift className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-gray-900">{transaction.description}</p>
                      <p className="text-gray-500">{transaction.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`${transaction.type === 'scan'
                      ? 'text-emerald-600'
                      : 'text-orange-600'
                      }`}>
                      {transaction.type === 'scan' ? '+' : ''}{transaction.points}
                    </p>
                    <p className="text-gray-500">
                      {new Date(transaction.date.replace(" ", "T")).toLocaleDateString("es-PE", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
