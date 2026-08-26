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
} from "lucide-react";
import Link from "next/link";

export default function LukeOverviewPage() {
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
      vehicle: "Chevrolet Montana",
      routes: "Rotas R1 a R12",
      totalSales: 26450.0,
      target: 45000.0,
      commission: 2116.0,
      visitsCount: 78,
      status: "Em Rota (R4)",
    },
    {
      name: "Alexandre",
      vehicle: "Renault Clio Express",
      routes: "Rotas F1 a F12",
      totalSales: 19820.0,
      target: 40000.0,
      commission: 1585.6,
      visitsCount: 62,
      status: "Em Rota (F2)",
    },
    {
      name: "Lucas",
      vehicle: "Fiat Strada Freedom",
      routes: "R1, R2, Representação",
      totalSales: 12150.0,
      target: 50000.0,
      commission: 1215.0,
      visitsCount: 28,
      status: "Base Central",
    },
  ];

  // Alertas de Estoque Baixo
  const lowStockProducts = [
    { name: "Navalhete Inox Profissional", current: 8, min: 20, brand: "Derby" },
    { name: "Botox Orgânico Matizador 1Kg", current: 5, min: 15, brand: "LUKE Brasil" },
    { name: "Cera Modeladora Brilho 120g", current: 12, min: 25, brand: "LUKE Brasil" },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-gold animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">
              LUKE Brasil • Painel Executivo de Distribuição
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-brand-offwhite mt-1">
            Visão Geral da Distribuidora
          </h2>
          <p className="text-brand-offwhite/60 text-sm mt-0.5">
            Acompanhamento em tempo real de faturamento, rotas nos salões, equipes e estoque.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-brand-graphite p-1 rounded-xl border border-brand-blue/30 text-xs font-bold">
            <button
              onClick={() => setPeriod("MONTH")}
              className={`px-3 py-1.5 rounded-lg transition ${
                period === "MONTH" ? "bg-brand-gold text-brand-black" : "text-brand-offwhite/60"
              }`}
            >
              Mês Atual
            </button>
            <button
              onClick={() => setPeriod("WEEK")}
              className={`px-3 py-1.5 rounded-lg transition ${
                period === "WEEK" ? "bg-brand-gold text-brand-black" : "text-brand-offwhite/60"
              }`}
            >
              Ciclo Semanal
            </button>
          </div>

          <Link
            href="/luke/rua"
            className="flex items-center space-x-2 bg-brand-gold text-brand-black px-4 py-2.5 rounded-xl font-extrabold hover:bg-yellow-500 transition shadow-lg text-sm"
          >
            <span>📱 Abrir Modo Rua</span>
          </Link>
        </div>
      </div>

      {/* BLOCO 1: CARDS DE MÉTRICAS FINANCEIRAS (KPIS PRINCIPAIS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Faturamento Bruto */}
        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-lg relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase text-brand-offwhite/60">Faturamento Bruto</span>
            <div className="p-2 bg-brand-gold/15 text-brand-gold rounded-lg">
              <DollarSign size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-brand-offwhite mt-2">R$ 58.420,00</h3>
          <div className="text-[11px] text-green-400 flex items-center font-semibold mt-1">
            <TrendingUp size={13} className="mr-1" />
            +14.8% vs ciclo anterior
          </div>
        </div>

        {/* Ticket Médio por Salão */}
        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-lg">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase text-brand-offwhite/60">Ticket Médio / Salão</span>
            <div className="p-2 bg-purple-500/15 text-purple-400 rounded-lg">
              <Store size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-purple-400 mt-2">R$ 347,70</h3>
          <span className="text-[11px] text-brand-offwhite/50">168 pedidos atendidos</span>
        </div>

        {/* P.A. a Receber */}
        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-lg">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase text-brand-offwhite/60">P.A.s a Receber (Prazo)</span>
            <div className="p-2 bg-teal-500/15 text-teal-400 rounded-lg">
              <ArrowDownLeft size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-teal-400 mt-2">R$ 5.430,00</h3>
          <span className="text-[11px] text-brand-offwhite/50">Vendas a prazo em rotas</span>
        </div>

        {/* Contas a Pagar */}
        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-lg">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase text-brand-offwhite/60">Contas a Pagar</span>
            <div className="p-2 bg-amber-500/15 text-amber-400 rounded-lg">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-amber-400 mt-2">R$ 3.745,00</h3>
          <span className="text-[11px] text-brand-offwhite/50">Fornecedores & Frotas</span>
        </div>

        {/* Saldo Líquido Operacional */}
        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-gold/40 shadow-lg bg-gradient-to-br from-brand-graphite to-brand-gold/5">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase text-brand-gold">Saldo Caixa Líquido</span>
            <div className="p-2 bg-brand-gold/20 text-brand-gold rounded-lg">
              <Wallet size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-brand-gold mt-2">R$ 54.675,00</h3>
          <span className="text-[11px] text-green-400 font-semibold">DRE Positivo no mês</span>
        </div>
      </div>

      {/* BLOCO 2: COBERTURA DE ROTAS & OPERACIONAL */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-brand-graphite p-4 rounded-xl border border-brand-blue/30 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
            <Store size={20} />
          </div>
          <div>
            <span className="text-xs text-brand-offwhite/50">Salões Cadastrados</span>
            <p className="text-lg font-black text-brand-offwhite">559 salões</p>
            <span className="text-[10px] text-green-400 font-medium">168 visitados no ciclo (30%)</span>
          </div>
        </div>

        <div className="bg-brand-graphite p-4 rounded-xl border border-brand-blue/30 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-gold/15 text-brand-gold flex items-center justify-center shrink-0">
            <Truck size={20} />
          </div>
          <div>
            <span className="text-xs text-brand-offwhite/50">Veículos em Campo</span>
            <p className="text-lg font-black text-brand-offwhite">3 frotas ativas</p>
            <span className="text-[10px] text-brand-gold font-medium">Montana, Clio & Strada</span>
          </div>
        </div>

        <div className="bg-brand-graphite p-4 rounded-xl border border-brand-blue/30 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-xs text-brand-offwhite/50">Taxa de Positivação</span>
            <p className="text-lg font-black text-emerald-400">91,2%</p>
            <span className="text-[10px] text-brand-offwhite/40">Compras efetivas na visita</span>
          </div>
        </div>

        <div className="bg-brand-graphite p-4 rounded-xl border border-brand-blue/30 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
            <Package size={20} />
          </div>
          <div>
            <span className="text-xs text-brand-offwhite/50">Carregamentos</span>
            <p className="text-lg font-black text-purple-400">18 / 20 Cargas</p>
            <span className="text-[10px] text-brand-offwhite/40">Ciclos despachados</span>
          </div>
        </div>
      </div>

      {/* BLOCO 3: RANKING DE VENDEDORES & PRODUTOS MAIS VENDIDOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Desempenho da Equipe Comercial */}
        <div className="bg-brand-graphite p-6 rounded-2xl border border-brand-blue/30 shadow-xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-brand-blue/30">
            <div>
              <h3 className="text-lg font-bold text-brand-offwhite flex items-center space-x-2">
                <Users size={20} className="text-brand-gold" />
                <span>Ranking Comercial de Campo</span>
              </h3>
              <p className="text-xs text-brand-offwhite/50">
                Faturamento individual, metas alcançadas e comissões provisionadas.
              </p>
            </div>
            <Link href="/luke/vendedores" className="text-xs font-bold text-brand-gold hover:underline">
              Ver Equipe →
            </Link>
          </div>

          <div className="space-y-4">
            {vendorRanking.map((v, i) => {
              const progress = Math.min(100, Math.round((v.totalSales / v.target) * 100));
              return (
                <div key={v.name} className="p-4 bg-brand-black/50 rounded-xl border border-brand-blue/20 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold font-black text-xs flex items-center justify-center border border-brand-gold/30">
                        #{i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-brand-offwhite">{v.name}</p>
                        <p className="text-[11px] text-brand-offwhite/40">
                          {v.vehicle} • {v.routes}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-mono font-bold text-brand-gold">
                        R$ {v.totalSales.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      <span className="text-[10px] text-emerald-400 font-medium">
                        Comissão: R$ {v.commission.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Barra de Progresso da Meta */}
                  <div>
                    <div className="flex justify-between text-[10px] text-brand-offwhite/60 mb-1">
                      <span>Meta: R$ {v.target.toLocaleString("pt-BR")}</span>
                      <span className="font-bold text-brand-gold">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-brand-black rounded-full overflow-hidden border border-brand-blue/30">
                      <div
                        className="h-full bg-gradient-to-r from-brand-gold to-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 Produtos Mais Vendidos */}
        <div className="bg-brand-graphite p-6 rounded-2xl border border-brand-blue/30 shadow-xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-brand-blue/30">
            <div>
              <h3 className="text-lg font-bold text-brand-offwhite flex items-center space-x-2">
                <Sparkles size={20} className="text-brand-gold" />
                <span>Top Produtos Mais Vendidos</span>
              </h3>
              <p className="text-xs text-brand-offwhite/50">
                Itens com maior giro nas rotas de salões de beleza e barbearias.
              </p>
            </div>
            <Link href="/luke/produtos" className="text-xs font-bold text-brand-gold hover:underline">
              Ver Catálogo →
            </Link>
          </div>

          <div className="space-y-3">
            {topProducts.map((p, idx) => (
              <div
                key={p.name}
                className="p-3 bg-brand-black/50 rounded-xl border border-brand-blue/20 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-black border border-brand-blue/30 overflow-hidden shrink-0">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-brand-gold uppercase">{p.brand}</span>
                    <p className="text-xs font-bold text-brand-offwhite">{p.name}</p>
                    <span className="text-[10px] text-brand-offwhite/40">{p.soldUnits} unidades distribuídas</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-emerald-400">
                    R$ {p.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <span className="text-[10px] text-brand-offwhite/40 font-mono">#{idx + 1} Giro</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BLOCO 4: ALERTAS OPERACIONAIS & ATALHOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Alerta de Ruptura / Estoque Baixo */}
        <div className="bg-brand-graphite p-5 rounded-2xl border border-amber-500/30 shadow-lg space-y-3">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
            <AlertTriangle size={18} />
            <span>Alerta de Ruptura de Estoque</span>
          </div>
          <p className="text-xs text-brand-offwhite/60">
            Produtos abaixo do estoque de segurança para os próximos carregamentos:
          </p>
          <div className="space-y-2">
            {lowStockProducts.map((item) => (
              <div key={item.name} className="p-2.5 bg-brand-black/60 rounded-lg border border-amber-500/20 flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold text-brand-offwhite">{item.name}</p>
                  <span className="text-[10px] text-brand-gold">{item.brand}</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-rose-400 font-bold">{item.current} un</span>
                  <span className="text-brand-offwhite/40 text-[10px] block">Mín: {item.min}</span>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/luke/produtos"
            className="block text-center text-xs font-bold text-brand-gold hover:underline pt-1"
          >
            Ajustar Estoque de Fábrica →
          </Link>
        </div>

        {/* Atalhos Operacionais */}
        <div className="md:col-span-2 bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-lg space-y-4">
          <h4 className="text-sm font-bold text-brand-offwhite">Ações Rápidas de Gestão</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/luke/clientes"
              className="p-4 bg-brand-black/60 hover:bg-brand-blue/20 border border-brand-blue/30 rounded-xl transition text-center group"
            >
              <Store size={22} className="text-brand-gold mx-auto group-hover:scale-110 transition" />
              <p className="text-xs font-bold text-brand-offwhite mt-2">Salões & Clientes</p>
              <span className="text-[10px] text-brand-offwhite/40">559 mapeados</span>
            </Link>

            <Link
              href="/luke/carregamento"
              className="p-4 bg-brand-black/60 hover:bg-brand-blue/20 border border-brand-blue/30 rounded-xl transition text-center group"
            >
              <Truck size={22} className="text-brand-gold mx-auto group-hover:scale-110 transition" />
              <p className="text-xs font-bold text-brand-offwhite mt-2">Carregamentos</p>
              <span className="text-[10px] text-brand-offwhite/40">20 Cargas + Mês</span>
            </Link>

            <Link
              href="/luke/financeiro"
              className="p-4 bg-brand-black/60 hover:bg-brand-blue/20 border border-brand-blue/30 rounded-xl transition text-center group"
            >
              <DollarSign size={22} className="text-brand-gold mx-auto group-hover:scale-110 transition" />
              <p className="text-xs font-bold text-brand-offwhite mt-2">Financeiro & DRE</p>
              <span className="text-[10px] text-brand-offwhite/40">Pagar & Receber</span>
            </Link>

            <Link
              href="/luke/rua"
              className="p-4 bg-brand-gold/15 hover:bg-brand-gold/25 border border-brand-gold/40 rounded-xl transition text-center group"
            >
              <span className="text-2xl block group-hover:scale-110 transition">📱</span>
              <p className="text-xs font-bold text-brand-gold mt-1.5">Modo Rua</p>
              <span className="text-[10px] text-brand-gold/70">Atendimento Externo</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
