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
  X,
  Calculator,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { usePrivacy } from "@/lib/privacyContext";
import { getVendorColor } from "@/lib/vendorColors";
import VendorBadge from "@/components/VendorBadge";

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

  // Modal de Detalhamento dos Cards (Drill-Down)
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Topo / Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-extrabold text-brand-offwhite">Visão</h2>
            <span className="bg-brand-gold/20 text-brand-gold text-xs px-2.5 py-1 rounded-full font-bold border border-brand-gold/30">
              Ciclo Mensal
            </span>
          </div>
          <p className="text-brand-offwhite/60 text-sm mt-1">
            Métricas consolidadas. <span className="text-brand-gold font-semibold">Clique nos cards</span> para ver a composição detalhada de cada número.
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

      {/* BLOCO 1: KPIS FINANCEIROS PRINCIPAIS (TODOS CLICÁVEIS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Faturamento */}
        <div
          onClick={() => setActiveModal("FATURAMENTO")}
          className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-lg relative overflow-hidden group cursor-pointer hover:border-brand-gold/50 hover:shadow-brand-gold/10 hover:shadow-xl transition transform hover:-translate-y-0.5"
          title="Clique para ver o detalhamento do Faturamento"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 rounded-full blur-2xl group-hover:bg-brand-gold/15 transition" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase tracking-wider group-hover:text-brand-gold transition">
              Faturamento
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition">
              <DollarSign size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-brand-offwhite mt-3">
            {formatValue(58420.0, "currency")}
          </p>
          <div className="flex items-center space-x-1 text-[11px] text-emerald-400 mt-2 font-medium">
            <ArrowUpRight size={13} />
            <span>+14,2% vs mês anterior</span>
          </div>
          <span className="text-[10px] text-brand-gold/60 font-medium block mt-1">
            🔍 Clique para detalhar
          </span>
        </div>

        {/* Ticket Médio */}
        <div
          onClick={() => setActiveModal("TICKET_MEDIO")}
          className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-lg relative overflow-hidden group cursor-pointer hover:border-brand-gold/50 hover:shadow-brand-gold/10 hover:shadow-xl transition transform hover:-translate-y-0.5"
          title="Clique para ver o detalhamento do Ticket Médio"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase tracking-wider group-hover:text-brand-gold transition">
              Ticket Médio
            </span>
            <div className="p-2 rounded-lg bg-brand-blue/30 text-brand-gold border border-brand-blue/40 group-hover:bg-brand-gold/20 transition">
              <ShoppingBag size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-brand-gold mt-3">
            {formatValue(347.7, "currency")}
          </p>
          <span className="text-[11px] text-brand-offwhite/50 block mt-2">
            Média por cliente visitado
          </span>
          <span className="text-[10px] text-brand-gold/60 font-medium block mt-1">
            🔍 Clique para detalhar
          </span>
        </div>

        {/* Receber */}
        <div
          onClick={() => setActiveModal("A_RECEBER")}
          className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-lg relative overflow-hidden group cursor-pointer hover:border-purple-500/50 hover:shadow-purple-500/10 hover:shadow-xl transition transform hover:-translate-y-0.5"
          title="Clique para ver o detalhamento de A Receber"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase tracking-wider group-hover:text-purple-300 transition">
              A Receber (P.A.)
            </span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-500/20 transition">
              <ArrowDownLeft size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-400 mt-3">
            {formatValue(5430.0, "currency")}
          </p>
          <span className="text-[11px] text-purple-300/70 block mt-2">
            18 clientes com prazo aberto
          </span>
          <span className="text-[10px] text-purple-300/60 font-medium block mt-1">
            🔍 Ver 18 salões com P.A.
          </span>
        </div>

        {/* Pagar */}
        <div
          onClick={() => setActiveModal("A_PAGAR")}
          className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-lg relative overflow-hidden group cursor-pointer hover:border-rose-500/50 hover:shadow-rose-500/10 hover:shadow-xl transition transform hover:-translate-y-0.5"
          title="Clique para ver o detalhamento de A Pagar"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase tracking-wider group-hover:text-rose-300 transition">
              A Pagar
            </span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:bg-rose-500/20 transition">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-400 mt-3">
            {formatValue(3745.0, "currency")}
          </p>
          <span className="text-[11px] text-rose-300/70 block mt-2">
            Fábricas & Despesas operacionais
          </span>
          <span className="text-[10px] text-rose-300/60 font-medium block mt-1">
            🔍 Ver despesas do mês
          </span>
        </div>

        {/* Caixa */}
        <div
          onClick={() => setActiveModal("CAIXA_LIQUIDO")}
          className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-lg relative overflow-hidden group cursor-pointer hover:border-teal-500/50 hover:shadow-teal-500/10 hover:shadow-xl transition transform hover:-translate-y-0.5"
          title="Clique para ver o detalhamento do Caixa Líquido"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase tracking-wider group-hover:text-teal-300 transition">
              Caixa Líquido
            </span>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 group-hover:bg-teal-500/20 transition">
              <Wallet size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-teal-400 mt-3">
            {formatValue(54675.0, "currency")}
          </p>
          <span className="text-[11px] text-teal-300/70 block mt-2">
            Saldo operacional consolidado
          </span>
          <span className="text-[10px] text-teal-300/60 font-medium block mt-1">
            🔍 Ver extrato e saldo
          </span>
        </div>
      </div>

      {/* BLOCO 2: KPIS OPERACIONAIS (TODOS CLICÁVEIS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cobertura de Clientes */}
        <div
          onClick={() => setActiveModal("CLIENTES")}
          className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md flex items-center space-x-4 cursor-pointer hover:border-brand-gold/50 hover:shadow-lg transition transform hover:-translate-y-0.5"
          title="Clique para ver a cobertura de clientes"
        >
          <div className="w-12 h-12 rounded-xl bg-brand-blue/30 border border-brand-gold/30 flex items-center justify-center text-brand-gold shrink-0">
            <Store size={24} />
          </div>
          <div>
            <p className="text-xs text-brand-offwhite/60 font-semibold uppercase">Clientes</p>
            <p className="text-xl font-extrabold text-brand-offwhite mt-0.5">168 / 559</p>
            <span className="text-[11px] text-brand-gold font-bold">30,0% no ciclo</span>
          </div>
        </div>

        {/* Frotas em Campo */}
        <div
          onClick={() => setActiveModal("FROTAS")}
          className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md flex items-center space-x-4 cursor-pointer hover:border-amber-500/50 hover:shadow-lg transition transform hover:-translate-y-0.5"
          title="Clique para ver detalhes das frotas"
        >
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
        <div
          onClick={() => setActiveModal("POSITIVACAO")}
          className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md flex items-center space-x-4 cursor-pointer hover:border-green-500/50 hover:shadow-lg transition transform hover:-translate-y-0.5"
          title="Clique para ver a taxa de positivação"
        >
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
        <div
          onClick={() => setActiveModal("CARGAS")}
          className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md flex items-center space-x-4 cursor-pointer hover:border-purple-500/50 hover:shadow-lg transition transform hover:-translate-y-0.5"
          title="Clique para ver detalhes das cargas"
        >
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
              const color = getVendorColor(v.name);
              return (
                <div
                  key={v.name}
                  className="p-4 bg-brand-black/60 rounded-xl border border-brand-blue/30 space-y-3 relative overflow-hidden group hover:border-brand-gold/50 transition"
                >
                  <div style={{ backgroundColor: color }} className="absolute top-0 left-0 bottom-0 w-1" />
                  <div className="flex justify-between items-start pl-1">
                    <div className="flex items-center space-x-3">
                      <div
                        style={{ borderColor: color, color }}
                        className="w-8 h-8 rounded-full bg-brand-black font-extrabold flex items-center justify-center border-2 text-xs shadow-xs"
                      >
                        #{i + 1}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-bold text-brand-offwhite">{v.name}</p>
                          <VendorBadge vendorName={v.name} color={color} size="xs" variant="chip" />
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-blue/40 text-brand-offwhite/80 font-medium font-mono">
                            {v.vehicle}
                          </span>
                        </div>
                        <p className="text-xs text-brand-offwhite/50 mt-0.5">
                          {v.routes} • {v.visitsCount} clientes atendidos
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-black text-brand-offwhite">
                        {formatValue(v.totalSales, "currency")}
                      </p>
                      <p className="text-[11px] text-emerald-400 font-medium">
                        Comissão: {formatValue(v.commission, "currency")}
                      </p>
                    </div>
                  </div>

                  {/* Barra de Progresso da Meta */}
                  <div className="space-y-1 pl-1">
                    <div className="flex justify-between text-[11px] text-brand-offwhite/60">
                      <span>Meta: {formatValue(v.target, "currency")}</span>
                      <span className="font-bold text-brand-gold">{percent}%</span>
                    </div>
                    <div className="w-full bg-brand-graphite h-2 rounded-full overflow-hidden border border-brand-blue/20">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%`, backgroundColor: color }}
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
                    {formatValue(prod.revenue, "currency")}
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

      {/* MODAL DE COMPOSIÇÃO DOS NÚMEROS (DRILL-DOWN) */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-graphite w-full max-w-3xl rounded-2xl border border-brand-blue/40 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto space-y-6">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-brand-offwhite/50 hover:text-brand-offwhite p-1 rounded-lg hover:bg-brand-blue/20 transition"
              title="Fechar"
            >
              <X size={20} />
            </button>

            {/* CASO 1: FATURAMENTO */}
            {activeModal === "FATURAMENTO" && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 border-b border-brand-blue/20 pb-4">
                  <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-brand-offwhite">
                      Composição do Faturamento
                    </h3>
                    <p className="text-xs text-brand-offwhite/60">
                      Total consolidado de <strong className="text-emerald-400 font-mono">{formatValue(58420.0, "currency")}</strong> no ciclo mensal.
                    </p>
                  </div>
                </div>

                {/* Subdivisão por Vendedor */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold">
                    1. Vendas por Vendedor
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 bg-brand-black/60 rounded-xl border border-emerald-500/30">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-brand-offwhite">Alisson (Montana)</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">45,3%</span>
                      </div>
                      <p className="text-lg font-black text-emerald-400">{formatValue(26450.0, "currency")}</p>
                      <p className="text-[11px] text-brand-offwhite/50 mt-1">78 clientes • Comiss: {formatValue(2116.0, "currency")}</p>
                    </div>

                    <div className="p-4 bg-brand-black/60 rounded-xl border border-sky-500/30">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-brand-offwhite">Alexandre (Clio)</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">33,9%</span>
                      </div>
                      <p className="text-lg font-black text-sky-400">{formatValue(19820.0, "currency")}</p>
                      <p className="text-[11px] text-brand-offwhite/50 mt-1">62 clientes • Comiss: {formatValue(1585.6, "currency")}</p>
                    </div>

                    <div className="p-4 bg-brand-black/60 rounded-xl border border-purple-500/30">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-brand-offwhite">Lucas (Strada)</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">20,8%</span>
                      </div>
                      <p className="text-lg font-black text-purple-400">{formatValue(12150.0, "currency")}</p>
                      <p className="text-[11px] text-brand-offwhite/50 mt-1">28 clientes • Comiss: {formatValue(1215.0, "currency")}</p>
                    </div>
                  </div>
                </div>

                {/* Subdivisão por Linha / Marca */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold">
                    2. Faturamento por Marca Distribuída
                  </h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-brand-black/40 rounded-xl border border-brand-blue/20 flex justify-between items-center">
                      <span className="text-xs font-bold text-brand-offwhite">LUKE Brasil Cosméticos</span>
                      <span className="text-sm font-black text-brand-gold">{formatValue(23025.0, "currency")} (39,4%)</span>
                    </div>
                    <div className="p-3 bg-brand-black/40 rounded-xl border border-brand-blue/20 flex justify-between items-center">
                      <span className="text-xs font-bold text-brand-offwhite">FOX For Men</span>
                      <span className="text-sm font-black text-brand-offwhite">{formatValue(18245.0, "currency")} (31,2%)</span>
                    </div>
                    <div className="p-3 bg-brand-black/40 rounded-xl border border-brand-blue/20 flex justify-between items-center">
                      <span className="text-xs font-bold text-brand-offwhite">Alfa Look&apos;s & Outras</span>
                      <span className="text-sm font-black text-brand-offwhite">{formatValue(17150.0, "currency")} (29,4%)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CASO 2: TICKET MÉDIO */}
            {activeModal === "TICKET_MEDIO" && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 border-b border-brand-blue/20 pb-4">
                  <div className="p-3 rounded-xl bg-brand-gold/20 text-brand-gold border border-brand-gold/30">
                    <Calculator size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-brand-offwhite">
                      Cálculo do Ticket Médio
                    </h3>
                    <p className="text-xs text-brand-offwhite/60">
                      Média por pedido de <strong className="text-brand-gold font-mono">{formatValue(347.7, "currency")}</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-brand-black/60 rounded-xl border border-brand-gold/30 space-y-3">
                  <h4 className="text-xs font-bold text-brand-gold uppercase tracking-wider">
                    Fórmula de Consolidação:
                  </h4>
                  <div className="p-3 bg-brand-graphite rounded-lg border border-brand-blue/30 font-mono text-xs text-center space-y-1">
                    <p className="text-emerald-400 font-bold">Faturamento Total: {formatValue(58420.0, "currency")}</p>
                    <p className="text-brand-offwhite/50 text-sm">÷</p>
                    <p className="text-sky-400 font-bold">168 Clientes Atendidos com Pedido</p>
                    <p className="text-brand-offwhite/50 text-sm">=</p>
                    <p className="text-brand-gold font-black text-base">{formatValue(347.7, "currency")} / cliente</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-offwhite/80">
                    Ticket Médio por Vendedor:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-brand-black/40 rounded-xl border border-brand-blue/20">
                      <p className="text-xs text-brand-offwhite font-bold">Alisson</p>
                      <p className="text-base font-black text-brand-gold mt-1">{formatValue(339.1, "currency")}</p>
                      <p className="text-[11px] text-brand-offwhite/40">78 atendimentos</p>
                    </div>
                    <div className="p-3 bg-brand-black/40 rounded-xl border border-brand-blue/20">
                      <p className="text-xs text-brand-offwhite font-bold">Alexandre</p>
                      <p className="text-base font-black text-brand-gold mt-1">{formatValue(319.67, "currency")}</p>
                      <p className="text-[11px] text-brand-offwhite/40">62 atendimentos</p>
                    </div>
                    <div className="p-3 bg-brand-black/40 rounded-xl border border-brand-blue/20">
                      <p className="text-xs text-brand-offwhite font-bold">Lucas</p>
                      <p className="text-base font-black text-brand-gold mt-1">{formatValue(433.92, "currency")}</p>
                      <p className="text-[11px] text-brand-offwhite/40">28 atendimentos (Contratos Maiores)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CASO 3: A RECEBER (P.A.) */}
            {activeModal === "A_RECEBER" && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 border-b border-brand-blue/20 pb-4">
                  <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <ArrowDownLeft size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-brand-offwhite">
                      18 Clientes em Prazo Aberto (P.A.)
                    </h3>
                    <p className="text-xs text-brand-offwhite/60">
                      Total a receber: <strong className="text-purple-400 font-mono">{formatValue(5430.0, "currency")}</strong>.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {[
                    { name: "Barbearia Vip Style", val: 480, due: "05/09", route: "R1", zap: "31988880001" },
                    { name: "Salão Requinte & Arte", val: 350, due: "08/09", route: "R2", zap: "31988880002" },
                    { name: "Studio Bella Dama", val: 620, due: "10/09", route: "F1", zap: "31988880003" },
                    { name: "Barbearia Seu Elias", val: 510, due: "12/09", route: "R3", zap: "31988880004" },
                    { name: "Studio Blond Hair", val: 390, due: "15/09", route: "F2", zap: "31988880005" },
                    { name: "Espaço Homem Moderno", val: 290, due: "15/09", route: "R4", zap: "31988880006" },
                    { name: "Corte Nobre Barbershop", val: 440, due: "18/09", route: "F4", zap: "31988880007" },
                    { name: "Salão Glamour BH", val: 310, due: "20/09", route: "R5", zap: "31988880008" },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 bg-brand-black/50 rounded-xl border border-brand-blue/20 flex justify-between items-center">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-brand-offwhite">{item.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-brand-gold/20 text-brand-gold rounded font-bold">{item.route}</span>
                        </div>
                        <p className="text-[11px] text-brand-offwhite/40 mt-0.5">Vencimento previsto: {item.due}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-purple-400">{formatValue(item.val, "currency")}</p>
                        <span className="text-[10px] text-purple-300/60 font-semibold">P.A. Ativo</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <Link
                    href="/luke/financeiro"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow"
                  >
                    Abrir Módulo Financeiro →
                  </Link>
                </div>
              </div>
            )}

            {/* CASO 4: A PAGAR */}
            {activeModal === "A_PAGAR" && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 border-b border-brand-blue/20 pb-4">
                  <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    <ArrowUpRight size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-brand-offwhite">
                      Contas a Pagar do Mês
                    </h3>
                    <p className="text-xs text-brand-offwhite/60">
                      Total de despesas operacionais: <strong className="text-rose-400 font-mono">{formatValue(3745.0, "currency")}</strong>.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { cat: "Fábricas / Fornecedores", name: "Lab Cosméticos Indústria (Pomadas)", val: 1850, due: "05/09" },
                    { cat: "Fábricas / Fornecedores", name: "Alfa Look's Distribuidora Oficial", val: 600, due: "10/09" },
                    { cat: "Frotas & Logística", name: "Posto Shell Savassi (Combustível Equipe)", val: 820, due: "15/09" },
                    { cat: "Manutenção", name: "Revisão Preventiva GM Montana", val: 475, due: "20/09" },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 bg-brand-black/50 rounded-xl border border-rose-500/20 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-rose-300 font-bold uppercase">{item.cat}</span>
                        <p className="text-xs font-bold text-brand-offwhite">{item.name}</p>
                        <p className="text-[11px] text-brand-offwhite/40">Vencimento: {item.due}</p>
                      </div>
                      <p className="text-sm font-black text-rose-400">{formatValue(item.val, "currency")}</p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <Link
                    href="/luke/financeiro"
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow"
                  >
                    Gerenciar no Financeiro →
                  </Link>
                </div>
              </div>
            )}

            {/* CASO 5: CAIXA LÍQUIDO */}
            {activeModal === "CAIXA_LIQUIDO" && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 border-b border-brand-blue/20 pb-4">
                  <div className="p-3 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-brand-offwhite">
                      Extrato e Saldo de Caixa
                    </h3>
                    <p className="text-xs text-brand-offwhite/60">
                      Saldo consolidado: <strong className="text-teal-400 font-mono">{formatValue(54675.0, "currency")}</strong>.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-brand-black/60 rounded-xl border border-teal-500/30 space-y-2">
                    <p className="text-xs text-brand-offwhite/60 font-semibold uppercase">Banco Inter PJ (Conta Central)</p>
                    <p className="text-xl font-black text-teal-400">{formatValue(42150.0, "currency")}</p>
                    <p className="text-[11px] text-brand-offwhite/40">Chave Pix: financeiro@luke.com</p>
                  </div>

                  <div className="p-4 bg-brand-black/60 rounded-xl border border-teal-500/30 space-y-2">
                    <p className="text-xs text-brand-offwhite/60 font-semibold uppercase">Caixa Operacional / Rotas</p>
                    <p className="text-xl font-black text-teal-400">{formatValue(12525.0, "currency")}</p>
                    <p className="text-[11px] text-brand-offwhite/40">Recebimentos diretos em campo</p>
                  </div>
                </div>

                <div className="p-3 bg-brand-black/40 rounded-xl border border-brand-blue/20 text-xs text-brand-offwhite/70 space-y-1">
                  <div className="flex justify-between">
                    <span>(+) Faturamento Bruto:</span>
                    <span className="font-bold text-emerald-400 font-mono">+{formatValue(58420.0, "currency")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>(-) Despesas Pagas do Ciclo:</span>
                    <span className="font-bold text-rose-400 font-mono">-{formatValue(3745.0, "currency")}</span>
                  </div>
                  <div className="border-t border-brand-blue/30 pt-1 flex justify-between font-bold text-brand-offwhite">
                    <span>(=) Saldo Líquido Operacional:</span>
                    <span className="text-teal-400 font-mono">{formatValue(54675.0, "currency")}</span>
                  </div>
                </div>
              </div>
            )}

            {/* CASO 6: CLIENTES */}
            {activeModal === "CLIENTES" && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 border-b border-brand-blue/20 pb-4">
                  <div className="p-3 rounded-xl bg-brand-gold/20 text-brand-gold border border-brand-gold/30">
                    <Store size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-brand-offwhite">
                      Cobertura da Base de Clientes
                    </h3>
                    <p className="text-xs text-brand-offwhite/60">
                      168 salões atendidos de um total de 559 cadastrados (30,0% no ciclo).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 bg-brand-black/50 rounded-xl border border-brand-blue/20">
                    <p className="text-xs font-bold text-brand-offwhite">Rotas R1 a R12 (Alisson)</p>
                    <p className="text-lg font-black text-brand-gold mt-1">106 Salões Atendidos</p>
                    <p className="text-[11px] text-brand-offwhite/40">Média de 8,8 clientes por rota</p>
                  </div>

                  <div className="p-4 bg-brand-black/50 rounded-xl border border-brand-blue/20">
                    <p className="text-xs font-bold text-brand-offwhite">Rotas F1 a F12 (Alexandre)</p>
                    <p className="text-lg font-black text-sky-400 mt-1">62 Salões Atendidos</p>
                    <p className="text-[11px] text-brand-offwhite/40">Média de 5,1 clientes por rota</p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Link
                    href="/luke/clientes"
                    className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl text-xs font-bold hover:bg-yellow-500 transition shadow"
                  >
                    Ver Lista Completa de 559 Clientes →
                  </Link>
                </div>
              </div>
            )}

            {/* CASO 7: FROTAS */}
            {activeModal === "FROTAS" && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 border-b border-brand-blue/20 pb-4">
                  <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Truck size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-brand-offwhite">
                      Frotas & Veículos Operacionais
                    </h3>
                    <p className="text-xs text-brand-offwhite/60">
                      3 Veículos ativos na operação de rua da LUKE Brasil.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-brand-black/50 rounded-xl border border-brand-blue/20 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-brand-offwhite">GM Montana 1.4 — Vendedor: Alisson</p>
                      <p className="text-[11px] text-brand-offwhite/40">Atribuição: Rotas R1 a R12 • 78 visitas realizadas</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">Em Campo</span>
                  </div>

                  <div className="p-3 bg-brand-black/50 rounded-xl border border-brand-blue/20 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-brand-offwhite">Renault Clio 1.0 — Vendedor: Alexandre</p>
                      <p className="text-[11px] text-brand-offwhite/40">Atribuição: Rotas F1 a F12 • 62 visitas realizadas</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">Em Campo</span>
                  </div>

                  <div className="p-3 bg-brand-black/50 rounded-xl border border-brand-blue/20 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-brand-offwhite">Fiat Strada 1.4 — Representação: Lucas</p>
                      <p className="text-[11px] text-brand-offwhite/40">Atribuição: Contratos Corporativos • 28 visitas realizadas</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-brand-blue/40 text-brand-offwhite font-bold">Base</span>
                  </div>
                </div>
              </div>
            )}

            {/* CASO 8: POSITIVAÇÃO */}
            {activeModal === "POSITIVACAO" && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 border-b border-brand-blue/20 pb-4">
                  <div className="p-3 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-brand-offwhite">
                      Taxa de Positivação Comercial (91,2%)
                    </h3>
                    <p className="text-xs text-brand-offwhite/60">
                      Percentual de visitas que resultaram em venda direta e pedido faturado.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-brand-black/50 rounded-xl border border-green-500/30 text-center">
                    <p className="text-2xl font-black text-green-400">153</p>
                    <p className="text-xs text-brand-offwhite/70 font-semibold mt-1">Pedidos Fechados</p>
                  </div>
                  <div className="p-4 bg-brand-black/50 rounded-xl border border-brand-blue/20 text-center">
                    <p className="text-2xl font-black text-brand-offwhite/60">15</p>
                    <p className="text-xs text-brand-offwhite/70 font-semibold mt-1">Apenas Visita / Cobrança</p>
                  </div>
                </div>
              </div>
            )}

            {/* CASO 9: CARGAS */}
            {activeModal === "CARGAS" && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 border-b border-brand-blue/20 pb-4">
                  <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <Package size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-brand-offwhite">
                      18 Cargas Despachadas
                    </h3>
                    <p className="text-xs text-brand-offwhite/60">
                      Controle digital de carregamento e conferência de mercadorias.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="p-3 bg-brand-black/50 rounded-xl border border-brand-blue/20 flex justify-between items-center">
                    <span className="text-xs font-bold text-brand-offwhite">Cargas 100% Conferidas e Assinadas</span>
                    <span className="text-xs font-black text-green-400">16 Cargas</span>
                  </div>
                  <div className="p-3 bg-brand-black/50 rounded-xl border border-brand-blue/20 flex justify-between items-center">
                    <span className="text-xs font-bold text-brand-offwhite">Cargas em Trânsito / Rota Hoje</span>
                    <span className="text-xs font-black text-amber-400">2 Cargas</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Link
                    href="/luke/carregamento"
                    className="px-4 py-2 bg-brand-gold text-brand-black rounded-xl text-xs font-bold hover:bg-yellow-500 transition shadow"
                  >
                    Abrir Módulo de Cargas →
                  </Link>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-brand-blue/20">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-bold text-brand-offwhite/60 hover:text-brand-offwhite transition"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
