"use client";

import { useState } from "react";
import { Plus, MapPin, Search, Play, CheckCircle2, Clock, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RotasPage() {
  const [routes, setRoutes] = useState([
    {
      id: "rota-01",
      name: "Rota Centro & Zona Sul",
      vendorName: "Carlos Eduardo (Vendedor 01)",
      dayOfWeek: "Segunda-feira",
      status: "OPEN",
      totalClients: 14,
      completedVisits: 9,
      totalSales: 4850.0,
      openedAt: "08:15",
    },
    {
      id: "rota-02",
      name: "Rota Zona Leste - Padarias",
      vendorName: "Marcos Souza (Vendedor 02)",
      dayOfWeek: "Segunda-feira",
      status: "CLOSED",
      totalClients: 12,
      completedVisits: 12,
      totalSales: 6320.0,
      openedAt: "07:45",
      closedAt: "17:30",
    },
    {
      id: "rota-03",
      name: "Rota Mercados - Norte",
      vendorName: "Fernanda Lima (Vendedor 03)",
      dayOfWeek: "Terça-feira",
      status: "SCHEDULED",
      totalClients: 16,
      completedVisits: 0,
      totalSales: 0.0,
      openedAt: "-",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredRoutes = routes.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-brand-offwhite">Rotas de Venda</h2>
          <p className="text-brand-offwhite/60 mt-1">
            Planejamento, acompanhamento em tempo real e fechamento das rotas externas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/rua"
            className="flex items-center space-x-2 bg-brand-blue/30 text-brand-gold border border-brand-gold/40 px-4 py-2.5 rounded-lg font-semibold hover:bg-brand-blue/50 transition shadow-md"
          >
            <span>📱 Abrir Modo Rua</span>
            <ArrowRight size={16} />
          </Link>
          <button className="flex items-center space-x-2 bg-brand-gold text-brand-black px-4 py-2.5 rounded-lg font-bold hover:bg-yellow-500 transition shadow-lg">
            <Plus size={20} />
            <span>Nova Rota</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-brand-graphite p-6 rounded-xl border border-brand-blue/30 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-brand-offwhite/60">Rotas em Andamento</span>
            <span className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <Play size={18} />
            </span>
          </div>
          <p className="text-2xl font-bold text-brand-offwhite">1 Rota Ativa</p>
          <p className="text-xs text-brand-offwhite/50 mt-1">9 de 14 visitas concluídas hoje</p>
        </div>

        <div className="bg-brand-graphite p-6 rounded-xl border border-brand-blue/30 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-brand-offwhite/60">Rotas Finalizadas Hoje</span>
            <span className="p-2 bg-green-500/10 text-green-400 rounded-lg">
              <CheckCircle2 size={18} />
            </span>
          </div>
          <p className="text-2xl font-bold text-green-400">1 Rota Fechada</p>
          <p className="text-xs text-brand-offwhite/50 mt-1">R$ 6.320,00 faturados e conciliados</p>
        </div>

        <div className="bg-brand-graphite p-6 rounded-xl border border-brand-blue/30 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-brand-offwhite/60">Eficácia de Visitas</span>
            <span className="p-2 bg-brand-gold/10 text-brand-gold rounded-lg">
              <MapPin size={18} />
            </span>
          </div>
          <p className="text-2xl font-bold text-brand-gold">80.7%</p>
          <p className="text-xs text-brand-offwhite/50 mt-1">21 de 26 clientes atendidos</p>
        </div>
      </div>

      {/* Tabela de Rotas */}
      <div className="bg-brand-graphite rounded-xl border border-brand-blue/30 shadow-lg overflow-hidden">
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
              placeholder="Buscar rota ou vendedor..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-blue/10 border-b border-brand-blue/30 text-brand-offwhite/70 text-sm">
                <th className="p-4 font-medium">Nome da Rota</th>
                <th className="p-4 font-medium">Vendedor Responsável</th>
                <th className="p-4 font-medium">Dia</th>
                <th className="p-4 font-medium">Progresso</th>
                <th className="p-4 font-medium">Faturamento</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-blue/10">
              {filteredRoutes.map((route) => {
                const percentage = Math.round((route.completedVisits / route.totalClients) * 100);
                return (
                  <tr key={route.id} className="hover:bg-brand-blue/5 transition group">
                    <td className="p-4 text-brand-offwhite font-medium">
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
                    <td className="p-4 text-brand-offwhite/60 text-sm">{route.dayOfWeek}</td>
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
