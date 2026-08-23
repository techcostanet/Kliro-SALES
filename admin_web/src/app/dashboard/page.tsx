"use client";

import { Activity, DollarSign, TrendingUp, AlertCircle } from "lucide-react";

export default function DashboardOverview() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-brand-offwhite">Visão Geral</h2>
          <p className="text-brand-offwhite/60 mt-1">Acompanhamento de rotas e fechamentos financeiros em tempo real.</p>
        </div>
        <div className="bg-brand-blue/20 text-brand-blue px-4 py-2 rounded-lg border border-brand-blue/30 text-sm font-medium">
          Ciclo: Terça a Segunda
        </div>
      </div>

      {/* KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-brand-graphite p-6 rounded-xl border border-brand-blue/30 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-brand-offwhite/60 font-medium mb-1">Faturamento Bruto</p>
              <h3 className="text-2xl font-bold text-brand-offwhite">R$ 45.231,00</h3>
            </div>
            <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-lg">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="text-xs text-green-400 flex items-center font-medium">
            <TrendingUp size={14} className="mr-1" />
            +12.5% em relação à semana passada
          </div>
        </div>

        <div className="bg-brand-graphite p-6 rounded-xl border border-brand-blue/30 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-brand-offwhite/60 font-medium mb-1">Rotas Ativas</p>
              <h3 className="text-2xl font-bold text-brand-offwhite">12 / 15</h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
              <Activity size={20} />
            </div>
          </div>
          <div className="text-xs text-brand-offwhite/50 font-medium">
            3 rotas fechadas hoje
          </div>
        </div>

        <div className="bg-brand-graphite p-6 rounded-xl border border-brand-blue/30 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-brand-offwhite/60 font-medium mb-1">Recebimentos Pix</p>
              <h3 className="text-2xl font-bold text-brand-offwhite">R$ 12.050,00</h3>
            </div>
            <div className="p-3 bg-teal-500/10 text-teal-400 rounded-lg">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="text-xs text-brand-offwhite/50 font-medium">
            42 transações conciliadas
          </div>
        </div>

        <div className="bg-brand-graphite p-6 rounded-xl border border-brand-blue/30 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-brand-offwhite/60 font-medium mb-1">Inadimplência</p>
              <h3 className="text-2xl font-bold text-red-400">R$ 1.200,00</h3>
            </div>
            <div className="p-3 bg-red-500/10 text-red-400 rounded-lg">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="text-xs text-red-400 flex items-center font-medium">
            <TrendingUp size={14} className="mr-1" />
            Atenção requerida
          </div>
        </div>
      </div>

      {/* Recentes */}
      <div className="bg-brand-graphite rounded-xl border border-brand-blue/30 shadow-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-brand-blue/30">
          <h3 className="text-lg font-bold text-brand-offwhite">Últimas Rotas Fechadas</h3>
        </div>
        <div className="p-6">
          <div className="text-center text-brand-offwhite/50 py-8">
            <p>Conectando ao Firestore...</p>
            <p className="text-xs mt-2">Nenhum dado real recebido ainda.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
