"use client";

import { useState } from "react";
import { Plus, MapPin, Search, Play, CheckCircle2, Clock, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LukeRotasPage() {
  const [routes, setRoutes] = useState([
    {
      id: "rota-01",
      name: "Rota Centro & Zona Sul",
      vendorName: "Carlos Eduardo",
      dayOfWeek: "Segunda-feira",
      status: "OPEN",
      totalClients: 14,
      completedVisits: 9,
      totalSales: 4850.0,
    },
    {
      id: "rota-02",
      name: "Rota Zona Leste - Padarias",
      vendorName: "Marcos Souza",
      dayOfWeek: "Segunda-feira",
      status: "CLOSED",
      totalClients: 12,
      completedVisits: 12,
      totalSales: 6320.0,
    },
    {
      id: "rota-03",
      name: "Rota Mercados - Norte",
      vendorName: "Fernanda Lima",
      dayOfWeek: "Terça-feira",
      status: "SCHEDULED",
      totalClients: 16,
      completedVisits: 0,
      totalSales: 0.0,
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const filtered = routes.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-brand-offwhite">Rotas de Venda</h2>
          <p className="text-brand-offwhite/60 text-sm mt-1">
            Acompanhamento em tempo real das rotas de campo da LUKE Brasil.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/luke/rua"
            className="flex items-center space-x-2 bg-brand-blue/30 text-brand-gold border border-brand-gold/40 px-4 py-2.5 rounded-xl font-bold hover:bg-brand-blue/50 transition shadow-md text-sm"
          >
            <span>📱 Abrir Modo Rua</span>
            <ArrowRight size={16} />
          </Link>
          <button className="flex items-center space-x-2 bg-brand-gold text-brand-black px-4 py-2.5 rounded-xl font-extrabold hover:bg-yellow-500 transition shadow-lg text-sm">
            <Plus size={18} />
            <span>Nova Rota</span>
          </button>
        </div>
      </div>

      <div className="bg-brand-graphite rounded-2xl border border-brand-blue/30 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-brand-blue/30 flex justify-between items-center bg-brand-black/50">
          <div className="relative w-full max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-brand-offwhite/40" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 bg-brand-black border border-brand-blue/50 rounded-lg text-sm text-brand-offwhite placeholder-brand-offwhite/30 focus:outline-none focus:ring-1 focus:ring-brand-gold"
              placeholder="Buscar por rota ou vendedor..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-blue/10 border-b border-brand-blue/30 text-brand-offwhite/70 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Nome da Rota</th>
                <th className="p-4 font-medium">Vendedor Responsável</th>
                <th className="p-4 font-medium">Dia</th>
                <th className="p-4 font-medium">Progresso</th>
                <th className="p-4 font-medium">Faturamento</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-blue/10 text-sm">
              {filtered.map((route) => {
                const percentage = Math.round((route.completedVisits / route.totalClients) * 100);
                return (
                  <tr key={route.id} className="hover:bg-brand-blue/5 transition group">
                    <td className="p-4 text-brand-offwhite font-semibold">
                      <div className="flex items-center space-x-2">
                        <MapPin size={18} className="text-brand-gold" />
                        <span>{route.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-brand-offwhite/80">
                      <div className="flex items-center space-x-2">
                        <Users size={16} className="text-brand-offwhite/40" />
                        <span>{route.vendorName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-brand-offwhite/60 text-xs">{route.dayOfWeek}</td>
                    <td className="p-4">
                      <div className="w-full max-w-[140px]">
                        <div className="flex justify-between text-xs text-brand-offwhite/70 mb-1">
                          <span>{route.completedVisits}/{route.totalClients} visitas</span>
                          <span>{percentage}%</span>
                        </div>
                        <div className="w-full bg-brand-black rounded-full h-2 overflow-hidden border border-brand-blue/30">
                          <div
                            className={`h-full rounded-full ${
                              route.status === "CLOSED" ? "bg-green-500" : "bg-brand-gold"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-brand-gold font-bold">
                      R$ {route.totalSales.toFixed(2).replace(".", ",")}
                    </td>
                    <td className="p-4">
                      {route.status === "OPEN" && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse mr-1.5" />
                          Em Andamento
                        </span>
                      )}
                      {route.status === "CLOSED" && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                          <CheckCircle2 size={12} className="mr-1" />
                          Fechada
                        </span>
                      )}
                      {route.status === "SCHEDULED" && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-offwhite/10 text-brand-offwhite/60 border border-brand-offwhite/20">
                          <Clock size={12} className="mr-1" />
                          Agendada
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
