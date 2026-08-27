"use client";

import { useState } from "react";
import {
  Activity,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Store,
  Truck,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  ChevronRight,
  Plus,
  Wallet,
  Eye,
  EyeOff,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { usePrivacy } from "@/lib/privacyContext";

export default function LukeOverviewPage() {
  const { hideValues, togglePrivacy, formatValue } = usePrivacy();
  const [period, setPeriod] = useState<"MONTH" | "WEEK">("MONTH");

  // Top Produtos
  const topProducts = [
    {
      name: "Pomada Efeito Teia 150g",
      brand: "LUKE Brasil",
      soldUnits: 340,
      revenue: 10200.0,
      image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80",
    },
    {
      name: "Pomada Matte Seco 150g",
      brand: "LUKE Brasil",
      soldUnits: 285,
      revenue: 8550.0,
      image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80",
    },
    {
      name: "Óleo para Barba Premium 30ml",
      brand: "Alfa Look's",
      soldUnits: 210,
      revenue: 5250.0,
      image: "https://images.unsplash.com/photo-1621607512214-68297480165e?w=300&auto=format&fit=crop&q=80",
    },
    {
      name: "Shampoo Lavatório Neutro 5L",
      brand: "LUKE Brasil",
      soldUnits: 95,
      revenue: 4275.0,
      image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=300&auto=format&fit=crop&q=80",
    },
    {
      name: "Gel Fixador Cola Black 300g",
      brand: "FOX For Men",
      soldUnits: 180,
      revenue: 3600.0,
      image: "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=300&auto=format&fit=crop&q=80",
    },
  ];

  // Ranking Vendedores
  const vendorRanking = [
    {
      name: "Alisson",
      vehicle: "Montana",
      routes: "R1 a R12",
      totalSales: 26450.0,
      target: 45000.0,
      commission: 2116.0,
      visitsCount: 78,
      status: "Em Rota",
    },
    {
      name: "Alexandre",
      vehicle: "Clio",
      routes: "F1 a F12",
      totalSales: 19820.0,
      target: 40000.0,
      commission: 1585.6,
      visitsCount: 62,
      status: "Em Rota",
    },
    {
      name: "Lucas",
      vehicle: "Strada",
      routes: "Representação",
      totalSales: 12150.0,
      target: 50000.0,
      commission: 1215.0,
      visitsCount: 28,
      status: "Base",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Topo / Header com Rótulos de 1 Palavra */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-extrabold text-brand-offwhite">Visão</h2>
            <span className="bg-brand-gold/20 text-brand-gold text-xs px-2.5 py-1 rounded-full font-bold border border-brand-gold/30">
              Ciclo Mensal
            </span>
          </div>
          <p className="text-brand-offwhite/60 text-sm mt-1">
            Métricas de faturamento, rotas, salões atendidos e metas comerciais.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Botão de Alternar Modo Privacidade */}
          <button
            onClick={togglePrivacy}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
              hideValues
                ? "bg-brand-gold/20 text-brand-gold border-brand-gold/40 shadow-md"
                : "bg-brand-graphite text-brand-offwhite/70 border-brand-blue/30 hover:text-brand-offwhite"
            }`}
            title={hideValues ? "Mostrar Valores" : "Ocultar Valores"}
          >
            {hideValues ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{hideValues ? "Oculto" : "Visível"}</span>
          </button>

          <Link
            href="/luke/rua"
            className="flex items-center space-x-1.5 bg-brand-gold text-brand-black px-4 py-2 rounded-xl font-extrabold hover:bg-yellow-500 transition shadow-lg text-xs"
          >
            <Sparkles size={16} />
            <span>Rua</span>
          </Link>
        </div>
      </div>

      {/* BLOCO 1: KPIS FINANCEIROS PRINCIPAIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Faturamento */}
        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 rounded-full blur-2xl group-hover:bg-brand-gold/15 transition" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase tracking-wider">
              Faturamento
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-brand-offwhite mt-3">
            {formatValue(58420.0)}
          </p>
          <div className="flex items-center space-x-1 text-[11px] text-emerald-400 mt-2 font-medium">
            <ArrowUpRight size={13} />
            <span>+14,2% vs mês anterior</span>
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase tracking-wider">
              Ticket
            </span>
            <div className="p-2 rounded-lg bg-brand-blue/30 text-brand-gold border border-brand-blue/40">
              <ShoppingBag size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-brand-gold mt-3">
            {formatValue(347.7)}
          </p>
          <span className="text-[11px] text-brand-offwhite/50 block mt-2">
            Média por salão visitado
          </span>
        </div>

        {/* Receber */}
        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase tracking-wider">
              Receber
            </span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ArrowDownLeft size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-400 mt-3">
            {formatValue(5430.0)}
          </p>
          <span className="text-[11px] text-purple-300/70 block mt-2">
            18 salões com prazo aberto
          </span>
        </div>

        {/* Pagar */}
        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase tracking-wider">
              Pagar
            </span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-400 mt-3">
            {formatValue(3745.0)}
          </p>
          <span className="text-[11px] text-rose-300/70 block mt-2">
            Fábricas & Despesas da rota
          </span>
        </div>

        {/* Caixa */}
        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase tracking-wider">
              Caixa
            </span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Wallet size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-teal-400 mt-3">
            {formatValue(54675.0)}
          </p>
          <span className="text-[11px] text-teal-300/70 block mt-2">
            Saldo operacional real
          </span>
        </div>
      </div>

      {/* BLOCO 2: KPIS OPERACIONAIS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cobertura de Salões */}
        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-brand-blue/30 border border-brand-gold/30 flex items-center justify-center text-brand-gold shrink-0">
            <Store size={24} />
          </div>
          <div>
            <p className="text-xs text-brand-offwhite/60 font-semibold uppercase">Salões</p>
            <p className="text-xl font-extrabold text-brand-offwhite mt-0.5">168 / 559</p>
            <span className="text-[11px] text-brand-gold font-bold">30,0% no ciclo</span>
          </div>
        </div>

        {/* Frotas em Campo */}
        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Truck size={24} />
          </div>
          <div>
            <p className="text-xs text-brand-offwhite/60 font-semibold uppercase">Frotas</p>
            <p className="text-xl font-extrabold text-brand-offwhite mt-0.5">3 Veículos</p>
            <span className="text-[11px] text-amber-400 font-bold">Montana, Clio, Strada</span>
          </div>
        </div>

        {/* Taxa de Positivação */}
        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs text-brand-offwhite/60 font-semibold uppercase">Positivação</p>
            <p className="text-xl font-extrabold text-brand-offwhite mt-0.5">91,2%</p>
            <span className="text-[11px] text-green-400 font-bold">Visitas com pedido</span>
          </div>
        </div>

        {/* Cargas */}
        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs text-brand-offwhite/60 font-semibold uppercase">Cargas</p>
            <p className="text-xl font-extrabold text-brand-offwhite mt-0.5">18 Despachadas</p>
            <span className="text-[11px] text-purple-300 font-bold">90% conferidas</span>
          </div>
        </div>
      </div>

      {/* BLOCO 3: RANKING DE VENDEDORES & TOP PRODUTOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RANKING COMERCIAL */}
        <div className="lg:col-span-2 bg-brand-graphite p-6 rounded-2xl border border-brand-blue/30 shadow-xl space-y-5">
          <div className="flex justify-between items-center border-b border-brand-blue/20 pb-4">
            <div className="flex items-center space-x-2">
              <Users className="text-brand-gold" size={20} />
              <h3 className="text-lg font-bold text-brand-offwhite">Vendedores</h3>
            </div>
            <Link
              href="/luke/vendedores"
              className="text-xs text-brand-gold hover:underline flex items-center space-x-1"
            >
              <span>Detalhes</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {vendorRanking.map((v, i) => {
              const percent = Math.min(100, Math.round((v.totalSales / v.target) * 100));
              return (
                <div
                  key={v.name}
                  className="p-4 bg-brand-black/60 rounded-xl border border-brand-blue/30 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-brand-gold/20 text-brand-gold font-bold flex items-center justify-center border border-brand-gold/40 text-sm">
                        #{i + 1}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-bold text-brand-offwhite">{v.name}</p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-blue/40 text-brand-gold font-medium">
                            {v.vehicle}
                          </span>
                        </div>
                        <p className="text-xs text-brand-offwhite/50 mt-0.5">
                          {v.routes} • {v.visitsCount} salões
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-black text-brand-offwhite">
                        {formatValue(v.totalSales)}
                      </p>
                      <p className="text-[11px] text-emerald-400 font-medium">
                        Comissão: {formatValue(v.commission)}
                      </p>
                    </div>
                  </div>

                  {/* Barra de Progresso da Meta */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-brand-offwhite/60">
                      <span>Meta: {formatValue(v.target)}</span>
                      <span className="font-bold text-brand-gold">{percent}%</span>
                    </div>
                    <div className="w-full bg-brand-graphite h-2 rounded-full overflow-hidden border border-brand-blue/20">
                      <div
                        className="bg-brand-gold h-full rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TOP PRODUTOS MAIS VENDIDOS */}
        <div className="bg-brand-graphite p-6 rounded-2xl border border-brand-blue/30 shadow-xl space-y-5">
          <div className="flex justify-between items-center border-b border-brand-blue/20 pb-4">
            <div className="flex items-center space-x-2">
              <Package className="text-brand-gold" size={20} />
              <h3 className="text-lg font-bold text-brand-offwhite">Produtos</h3>
            </div>
            <Link
              href="/luke/produtos"
              className="text-xs text-brand-gold hover:underline flex items-center space-x-1"
            >
              <span>Catálogo</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {topProducts.map((prod, idx) => (
              <div
                key={prod.name}
                className="flex items-center space-x-3 p-2.5 bg-brand-black/50 rounded-xl border border-brand-blue/20 hover:border-brand-gold/30 transition"
              >
                <div className="w-11 h-11 rounded-lg bg-brand-graphite border border-brand-blue/30 overflow-hidden shrink-0">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-brand-gold/15 text-brand-gold font-bold uppercase">
                      {prod.brand}
                    </span>
                    <p className="text-xs font-bold text-brand-offwhite truncate">
                      {prod.name}
                    </p>
                  </div>
                  <p className="text-[11px] text-brand-offwhite/50 mt-0.5">
                    {prod.soldUnits} un vendidas
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-brand-gold">
                    {formatValue(prod.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BLOCO 4: ALERTAS DE ESTOQUE & ATALHOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Alerta de Ruptura */}
        <div className="bg-brand-graphite p-6 rounded-2xl border border-rose-500/20 shadow-xl space-y-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-rose-400" size={20} />
            <h3 className="text-base font-bold text-brand-offwhite">Estoque</h3>
          </div>
          <div className="space-y-2.5">
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-brand-offwhite">
                  Lâmina Wilkinson Sword (Caixa c/ 100)
                </p>
                <span className="text-[11px] text-rose-300">Apenas 14 caixas em estoque</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-rose-500/20 text-rose-400 rounded-md border border-rose-500/30">
                Crítico
              </span>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-brand-offwhite">
                  Pomada Matte Seco 150g (LUKE)
                </p>
                <span className="text-[11px] text-amber-300">62 unidades restantes</span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-500/20 text-amber-400 rounded-md border border-amber-500/30">
                Atenção
              </span>
            </div>
          </div>
        </div>

        {/* Atalhos Rápidos de Gestão */}
        <div className="bg-brand-graphite p-6 rounded-2xl border border-brand-blue/30 shadow-xl space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="text-brand-gold" size={20} />
            <h3 className="text-base font-bold text-brand-offwhite">Atalhos</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/luke/clientes"
              className="p-3 bg-brand-black/60 rounded-xl border border-brand-blue/30 hover:border-brand-gold/40 transition flex items-center space-x-2 group"
            >
              <Store size={18} className="text-brand-gold group-hover:scale-110 transition" />
              <span className="text-xs font-bold text-brand-offwhite">Clientes</span>
            </Link>

            <Link
              href="/luke/financeiro"
              className="p-3 bg-brand-black/60 rounded-xl border border-brand-blue/30 hover:border-brand-gold/40 transition flex items-center space-x-2 group"
            >
              <DollarSign size={18} className="text-emerald-400 group-hover:scale-110 transition" />
              <span className="text-xs font-bold text-brand-offwhite">Financeiro</span>
            </Link>

            <Link
              href="/luke/rotas"
              className="p-3 bg-brand-black/60 rounded-xl border border-brand-blue/30 hover:border-brand-gold/40 transition flex items-center space-x-2 group"
            >
              <MapPin size={18} className="text-brand-gold group-hover:scale-110 transition" />
              <span className="text-xs font-bold text-brand-offwhite">Rotas</span>
            </Link>

            <Link
              href="/luke/empresa"
              className="p-3 bg-brand-black/60 rounded-xl border border-brand-blue/30 hover:border-brand-gold/40 transition flex items-center space-x-2 group"
            >
              <Building2 size={18} className="text-purple-400 group-hover:scale-110 transition" />
              <span className="text-xs font-bold text-brand-offwhite">Empresa</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
