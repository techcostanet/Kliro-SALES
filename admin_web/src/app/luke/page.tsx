"use client";

import { Activity, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function LukeOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">
              LUKE Brasil • Painel Executivo
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-brand-offwhite mt-1">Visão Geral</h2>
          <p className="text-brand-offwhite/60 text-sm mt-0.5">
            Acompanhamento de rotas, faturamento e vendas em tempo real da LUKE Brasil.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/luke/rua"
            className="flex items-center space-x-2 bg-brand-gold text-brand-black px-4 py-2.5 rounded-xl font-extrabold hover:bg-yellow-500 transition shadow-lg text-sm"
          >
            <span>📱 Abrir Modo Rua</span>
          </Link>
        </div>
      </div>

      {/* KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <div className="px-6 py-5 border-b border-brand-blue/30 flex justify-between items-center">
          <h3 className="text-lg font-bold text-brand-offwhite">Últimas Rotas Fechadas (LUKE Brasil)</h3>
          <Link href="/luke/rotas" className="text-xs font-bold text-brand-gold hover:underline">
            Ver todas as rotas →
          </Link>
        </div>
        <div className="p-6">
          <div className="text-center text-brand-offwhite/50 py-6">
            <p className="text-sm font-medium text-brand-offwhite/70">
              Operação de campo conectada ao banco Firestore (LUKE Brasil)
            </p>
            <p className="text-xs mt-1 text-brand-offwhite/40">
              Acesse o Modo Rua em <code className="text-brand-gold font-mono">/luke/rua</code> para simular uma venda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
