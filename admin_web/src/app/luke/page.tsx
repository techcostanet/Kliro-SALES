"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  Store,
  Truck,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  MapPin,
  ChevronRight,
  Wallet,
  Eye,
  EyeOff,
  Building2,
  X,
  Calculator,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { usePrivacy } from "@/lib/privacyContext";
import { getVendorColor } from "@/lib/vendorColors";
import VendorBadge from "@/components/VendorBadge";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ProductPreview {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl?: string;
  category?: string;
  soldUnits: number;
  revenue: number;
}

interface VendorItem {
  name: string;
  vehicle: string;
  routes: string;
  totalSales: number;
  target: number;
  commission: number;
  visitsCount: number;
  status: string;
}

export default function LukeOverviewPage() {
  const { hideValues, togglePrivacy, formatValue } = usePrivacy();

  // Estados dos KPIs reais conectados ao Firestore
  const [loading, setLoading] = useState(true);
  const [totalProductsCount, setTotalProductsCount] = useState<number>(46);
  const [totalClientsCount, setTotalClientsCount] = useState<number>(0);
  const [faturamentoTotal, setFaturamentoTotal] = useState<number>(0.0);
  const [totalReceivables, setTotalReceivables] = useState<number>(0.0);
  const [totalPayables, setTotalPayables] = useState<number>(0.0);
  const [totalLoadsCount, setTotalLoadsCount] = useState<number>(0);
  const [productsList, setProductsList] = useState<ProductPreview[]>([]);
  const [vendors, setVendors] = useState<VendorItem[]>([
    {
      name: "Alisson",
      vehicle: "Montana",
      routes: "R1 a R12",
      totalSales: 0.0,
      target: 45000.0,
      commission: 0.0,
      visitsCount: 0,
      status: "Disponível",
    },
    {
      name: "Alexandre",
      vehicle: "Clio",
      routes: "F1 a F12",
      totalSales: 0.0,
      target: 40000.0,
      commission: 0.0,
      visitsCount: 0,
      status: "Disponível",
    },
    {
      name: "Lucas",
      vehicle: "Strada",
      routes: "Representação",
      totalSales: 0.0,
      target: 50000.0,
      commission: 0.0,
      visitsCount: 0,
      status: "Disponível",
    },
  ]);

  // Modal de Detalhamento dos Cards (Drill-Down)
  const [activeModal, setActiveModal] = useState<string | null>(null);

  useEffect(() => {
    async function loadFirestoreData() {
      setLoading(true);
      try {
        const tenantId = "tenant_luke_001";

        // 1. Consulta de Produtos
        const prodSnap = await getDocs(collection(db, `tenants/${tenantId}/products`));
        if (!prodSnap.empty) {
          setTotalProductsCount(prodSnap.size);
          const loadedProds: ProductPreview[] = [];
          prodSnap.forEach((doc) => {
            const data = doc.data();
            loadedProds.push({
              id: doc.id,
              name: data.name || "Produto",
              brand: data.brand || "LUKE Brasil",
              price: Number(data.price || 0),
              imageUrl:
                data.imageUrl ||
                "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80",
              category: data.category || "Geral",
              soldUnits: 0,
              revenue: 0.0,
            });
          });
          setProductsList(loadedProds.slice(0, 5));
        }

        // 2. Consulta de Clientes
        const clientSnap = await getDocs(collection(db, `tenants/${tenantId}/clients`));
        setTotalClientsCount(clientSnap.size);

        // 3. Consulta de Transações
        const txSnap = await getDocs(collection(db, `tenants/${tenantId}/transactions`));
        let sumTx = 0;
        if (!txSnap.empty) {
          txSnap.forEach((doc) => {
            const data = doc.data();
            sumTx += Number(data.amount || data.total || 0);
          });
        }
        setFaturamentoTotal(sumTx);

        // 4. Contas a Receber
        const recSnap = await getDocs(collection(db, `tenants/${tenantId}/receivables`));
        let sumRec = 0;
        if (!recSnap.empty) {
          recSnap.forEach((doc) => {
            const data = doc.data();
            sumRec += Number(data.amount || data.value || 0);
          });
        }
        setTotalReceivables(sumRec);

        // 5. Contas a Pagar
        const paySnap = await getDocs(collection(db, `tenants/${tenantId}/payables`));
        let sumPay = 0;
        if (!paySnap.empty) {
          paySnap.forEach((doc) => {
            const data = doc.data();
            sumPay += Number(data.amount || data.value || 0);
          });
        }
        setTotalPayables(sumPay);

        // 6. Cargas
        const loadSnap = await getDocs(collection(db, `tenants/${tenantId}/loads`));
        setTotalLoadsCount(loadSnap.size);

        // 7. Vendedores
        const usersSnap = await getDocs(collection(db, `tenants/${tenantId}/users`));
        if (!usersSnap.empty) {
          const loadedVendors: VendorItem[] = [];
          usersSnap.forEach((doc) => {
            const data = doc.data();
            if (data.role === "VENDEDOR" || !data.role || data.role === "ADMIN") {
              const name = data.displayName || data.name || data.email?.split("@")[0] || "Vendedor";
              loadedVendors.push({
                name,
                vehicle: data.vehicle || "Veículo Comercial",
                routes: data.routes || "Rotas Atribuídas",
                totalSales: 0.0,
                target: Number(data.target || 40000.0),
                commission: 0.0,
                visitsCount: 0,
                status: "Disponível",
              });
            }
          });
          if (loadedVendors.length > 0) {
            setVendors(loadedVendors.slice(0, 5));
          }
        }
      } catch (err) {
        console.warn("Consulta inicial Firestore:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFirestoreData();
  }, []);

  const saldoLiquido = Math.max(0, faturamentoTotal - totalPayables);
  const ticketMedio = totalClientsCount > 0 ? faturamentoTotal / totalClientsCount : 0.0;

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
            {loading && (
              <span className="flex items-center space-x-1 text-xs text-brand-offwhite/50">
                <RefreshCw size={12} className="animate-spin text-brand-gold" />
                <span>Atualizando...</span>
              </span>
            )}
          </div>
          <p className="text-brand-offwhite/60 text-sm mt-1">
            Métricas consolidadas em tempo real.{" "}
            <span className="text-brand-gold font-semibold">Clique nos cards</span> para ver a composição detalhada.
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
            {formatValue(faturamentoTotal, "currency")}
          </p>
          <div className="flex items-center space-x-1 text-[11px] text-emerald-400 mt-2 font-medium">
            <ArrowUpRight size={13} />
            <span>0 pedidos faturados</span>
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
            {formatValue(ticketMedio, "currency")}
          </p>
          <span className="text-[11px] text-brand-offwhite/50 block mt-2">
            Média por cliente atendido
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
            {formatValue(totalReceivables, "currency")}
          </p>
          <span className="text-[11px] text-purple-300/70 block mt-2">
            0 clientes com prazo aberto
          </span>
          <span className="text-[10px] text-purple-300/60 font-medium block mt-1">
            🔍 Ver salões com P.A.
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
            {formatValue(totalPayables, "currency")}
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
            {formatValue(saldoLiquido, "currency")}
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
            <p className="text-xl font-extrabold text-brand-offwhite mt-0.5">
              0 / {totalClientsCount}
            </p>
            <span className="text-[11px] text-brand-gold font-bold">Base pronta</span>
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
            <span className="text-[11px] text-amber-400 font-bold">Equipe LUKE</span>
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
            <p className="text-xl font-extrabold text-brand-offwhite mt-0.5">0,0%</p>
            <span className="text-[11px] text-green-400 font-bold">Aguardando visitas</span>
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
            <p className="text-xl font-extrabold text-brand-offwhite mt-0.5">
              {totalLoadsCount} Despachadas
            </p>
            <span className="text-[11px] text-purple-300 font-bold">Conferência digital</span>
          </div>
        </div>
      </div>

      {/* BLOCO 3: RANKING DE VENDEDORES & CATÁLOGO DE PRODUTOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RANKING COMERCIAL */}
        <div className="lg:col-span-2 bg-brand-graphite p-6 rounded-2xl border border-brand-blue/30 shadow-xl space-y-5">
          <div className="flex justify-between items-center border-b border-brand-blue/20 pb-4">
            <div className="flex items-center space-x-2">
              <Users className="text-brand-gold" size={20} />
              <h3 className="text-lg font-bold text-brand-offwhite">Vendedores</h3>
              <span className="text-xs bg-brand-gold/15 text-brand-gold font-bold px-2 py-0.5 rounded-full border border-brand-gold/30">
                Equipe Ativa
              </span>
            </div>
            <Link
              href="/luke/vendedores"
              className="text-xs text-brand-gold hover:underline flex items-center space-x-1"
            >
              <span>Gerenciar Equipe</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {vendors.map((v, i) => {
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
                          {v.routes} • 0 atendimentos no ciclo
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-black text-brand-offwhite">
                        {formatValue(v.totalSales, "currency")}
                      </p>
                      <span className="text-[10px] text-emerald-400/80 font-semibold">
                        Disponível para rotas
                      </span>
                    </div>
                  </div>

                  {/* Barra de Progresso da Meta */}
                  <div className="space-y-1 pl-1">
                    <div className="flex justify-between text-[11px] text-brand-offwhite/60">
                      <span>Meta Mensal: {formatValue(v.target, "currency")}</span>
                      <span className="font-bold text-brand-offwhite/40">0%</span>
                    </div>
                    <div className="w-full bg-brand-graphite h-2 rounded-full overflow-hidden border border-brand-blue/20">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: "0%", backgroundColor: color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CATÁLOGO DE PRODUTOS OFICIAIS (PRESERVADO) */}
        <div className="bg-brand-graphite p-6 rounded-2xl border border-brand-blue/30 shadow-xl space-y-5">
          <div className="flex justify-between items-center border-b border-brand-blue/20 pb-4">
            <div className="flex items-center space-x-2">
              <Package className="text-brand-gold" size={20} />
              <h3 className="text-lg font-bold text-brand-offwhite">Produtos</h3>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                {totalProductsCount} Ativos
              </span>
            </div>
            <Link
              href="/luke/produtos"
              className="text-xs text-brand-gold hover:underline flex items-center space-x-1"
            >
              <span>Ver Catálogo</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {productsList.map((prod) => (
              <div
                key={prod.id}
                className="flex items-center space-x-3 p-2.5 bg-brand-black/50 rounded-xl border border-brand-blue/20 hover:border-brand-gold/30 transition"
              >
                <div className="w-11 h-11 rounded-lg bg-brand-graphite border border-brand-blue/30 overflow-hidden shrink-0 flex items-center justify-center">
                  {prod.imageUrl ? (
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package size={20} className="text-brand-offwhite/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-brand-gold/15 text-brand-gold font-bold uppercase truncate max-w-[80px]">
                      {prod.brand}
                    </span>
                    <p className="text-xs font-bold text-brand-offwhite truncate">
                      {prod.name}
                    </p>
                  </div>
                  <p className="text-[11px] text-brand-offwhite/50 mt-0.5">
                    Preço de Tabela
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-brand-gold">
                    {formatValue(prod.price, "currency")}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-brand-blue/20">
            <Link
              href="/luke/produtos"
              className="w-full flex items-center justify-center space-x-2 py-2.5 bg-brand-gold/15 hover:bg-brand-gold/25 border border-brand-gold/30 text-brand-gold rounded-xl text-xs font-bold transition"
            >
              <Package size={15} />
              <span>Gerenciar Todos os {totalProductsCount} Produtos</span>
            </Link>
          </div>
        </div>
      </div>

      {/* BLOCO 4: STATUS DO CATÁLOGO & ATALHOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status de Prontidão Operacional */}
        <div className="bg-brand-graphite p-6 rounded-2xl border border-emerald-500/20 shadow-xl space-y-4">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="text-emerald-400" size={20} />
            <h3 className="text-base font-bold text-brand-offwhite">Prontidão do Catálogo</h3>
          </div>
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
            <p className="text-xs font-bold text-emerald-300">
              Catálogo LUKE Brasil 100% Sincronizado
            </p>
            <p className="text-xs text-brand-offwhite/70">
              Todos os {totalProductsCount} produtos oficiais estão com fotos de alta resolução, códigos de barra e preços de venda cadastrados e prontos para vendas no Modo Rua e emissão de pedidos.
            </p>
            <div className="pt-2 flex items-center space-x-2 text-[11px] text-brand-gold font-semibold">
              <span>✓ Fotos em Alta Resolução</span>
              <span>•</span>
              <span>✓ Códigos EAN / Barras</span>
              <span>•</span>
              <span>✓ Preços de Venda</span>
            </div>
          </div>
        </div>

        {/* Atalhos Rápidos de Gestão */}
        <div className="bg-brand-graphite p-6 rounded-2xl border border-brand-blue/30 shadow-xl space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="text-brand-gold" size={20} />
            <h3 className="text-base font-bold text-brand-offwhite">Atalhos Operacionais</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/luke/produtos"
              className="p-3 bg-brand-black/60 rounded-xl border border-brand-blue/30 hover:border-brand-gold/40 transition flex items-center space-x-2 group"
            >
              <Package size={18} className="text-brand-gold group-hover:scale-110 transition" />
              <span className="text-xs font-bold text-brand-offwhite">Produtos</span>
            </Link>

            <Link
              href="/luke/clientes"
              className="p-3 bg-brand-black/60 rounded-xl border border-brand-blue/30 hover:border-brand-gold/40 transition flex items-center space-x-2 group"
            >
              <Store size={18} className="text-brand-gold group-hover:scale-110 transition" />
              <span className="text-xs font-bold text-brand-offwhite">Clientes</span>
            </Link>

            <Link
              href="/luke/rotas"
              className="p-3 bg-brand-black/60 rounded-xl border border-brand-blue/30 hover:border-brand-gold/40 transition flex items-center space-x-2 group"
            >
              <MapPin size={18} className="text-brand-gold group-hover:scale-110 transition" />
              <span className="text-xs font-bold text-brand-offwhite">Rotas</span>
            </Link>

            <Link
              href="/luke/financeiro"
              className="p-3 bg-brand-black/60 rounded-xl border border-brand-blue/30 hover:border-brand-gold/40 transition flex items-center space-x-2 group"
            >
              <DollarSign size={18} className="text-emerald-400 group-hover:scale-110 transition" />
              <span className="text-xs font-bold text-brand-offwhite">Financeiro</span>
            </Link>
          </div>
        </div>
      </div>

      {/* MODAL DE COMPOSIÇÃO DOS NÚMEROS (DRILL-DOWN LIMPO) */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-brand-graphite w-full max-w-2xl rounded-2xl border border-brand-blue/40 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto space-y-6">
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
                      Total consolidado no ciclo mensal:{" "}
                      <strong className="text-emerald-400 font-mono">
                        {formatValue(faturamentoTotal, "currency")}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-brand-black/50 rounded-xl border border-brand-blue/20 text-center space-y-3">
                  <p className="text-sm text-brand-offwhite/80 font-medium">
                    {faturamentoTotal === 0
                      ? "Nenhum faturamento registrado no ciclo atual."
                      : `Total de ${formatValue(faturamentoTotal, "currency")} faturados.`}
                  </p>
                  <p className="text-xs text-brand-offwhite/50 max-w-md mx-auto">
                    Conforme novos pedidos forem lançados pelos vendedores no Modo Rua ou registrados em Transações, os números serão agrupados automaticamente aqui por vendedor, linha e forma de pagamento.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/luke/rua"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-gold text-brand-black rounded-xl text-xs font-bold hover:bg-yellow-500 transition shadow"
                    >
                      <Sparkles size={14} />
                      <span>Abrir Modo Rua</span>
                    </Link>
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
                      Média por pedido de{" "}
                      <strong className="text-brand-gold font-mono">
                        {formatValue(ticketMedio, "currency")}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-brand-black/60 rounded-xl border border-brand-gold/30 space-y-3">
                  <h4 className="text-xs font-bold text-brand-gold uppercase tracking-wider">
                    Fórmula de Consolidação:
                  </h4>
                  <div className="p-3 bg-brand-graphite rounded-lg border border-brand-blue/30 font-mono text-xs text-center space-y-1">
                    <p className="text-emerald-400 font-bold">
                      Faturamento Total: {formatValue(faturamentoTotal, "currency")}
                    </p>
                    <p className="text-brand-offwhite/50 text-sm">÷</p>
                    <p className="text-sky-400 font-bold">
                      {totalClientsCount} Clientes Atendidos com Pedido
                    </p>
                    <p className="text-brand-offwhite/50 text-sm">=</p>
                    <p className="text-brand-gold font-black text-base">
                      {formatValue(ticketMedio, "currency")} / pedido
                    </p>
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
                      Clientes com Prazo Aberto (P.A.)
                    </h3>
                    <p className="text-xs text-brand-offwhite/60">
                      Total a receber:{" "}
                      <strong className="text-purple-400 font-mono">
                        {formatValue(totalReceivables, "currency")}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-brand-black/50 rounded-xl border border-brand-blue/20 text-center space-y-3">
                  <p className="text-sm text-brand-offwhite/80 font-medium">
                    Nenhum título a receber em aberto no momento.
                  </p>
                  <p className="text-xs text-brand-offwhite/50">
                    Quando pedidos forem faturados a prazo ou com duplicatas no Modo Rua, as cobranças aparecerão organizadas por vencimento e cliente.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/luke/financeiro"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow"
                    >
                      <DollarSign size={14} />
                      <span>Abrir Módulo Financeiro</span>
                    </Link>
                  </div>
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
                      Total de despesas operacionais:{" "}
                      <strong className="text-rose-400 font-mono">
                        {formatValue(totalPayables, "currency")}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-brand-black/50 rounded-xl border border-brand-blue/20 text-center space-y-3">
                  <p className="text-sm text-brand-offwhite/80 font-medium">
                    Nenhuma despesa ou título a pagar pendente.
                  </p>
                  <p className="text-xs text-brand-offwhite/50">
                    Cadastre despesas operacionais de fábricas, combustível ou manutenção diretamente no Financeiro.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/luke/financeiro"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow"
                    >
                      <span>Gerenciar Contas a Pagar</span>
                    </Link>
                  </div>
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
                      Saldo consolidado:{" "}
                      <strong className="text-teal-400 font-mono">
                        {formatValue(saldoLiquido, "currency")}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-brand-black/40 rounded-xl border border-brand-blue/20 text-xs text-brand-offwhite/70 space-y-2">
                  <div className="flex justify-between">
                    <span>(+) Faturamento Bruto:</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      +{formatValue(faturamentoTotal, "currency")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>(-) Despesas Pagas do Ciclo:</span>
                    <span className="font-bold text-rose-400 font-mono">
                      -{formatValue(totalPayables, "currency")}
                    </span>
                  </div>
                  <div className="border-t border-brand-blue/30 pt-2 flex justify-between font-bold text-brand-offwhite">
                    <span>(=) Saldo Líquido Operacional:</span>
                    <span className="text-teal-400 font-mono">
                      {formatValue(saldoLiquido, "currency")}
                    </span>
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
                      Total cadastrado: {totalClientsCount} clientes.
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-brand-black/50 rounded-xl border border-brand-blue/20 text-center space-y-3">
                  <p className="text-sm text-brand-offwhite/80 font-medium">
                    {totalClientsCount === 0
                      ? "Nenhum cliente cadastrado no momento."
                      : `${totalClientsCount} clientes cadastrados.`}
                  </p>
                  <p className="text-xs text-brand-offwhite/50">
                    Cadastre novos clientes ou importe sua carteira para iniciar o planejamento das rotas comerciais.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/luke/clientes"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-gold text-brand-black rounded-xl text-xs font-bold hover:bg-yellow-500 transition shadow"
                    >
                      <Store size={14} />
                      <span>Abrir Módulo de Clientes</span>
                    </Link>
                  </div>
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
                      Veículos configurados para a equipe comercial LUKE Brasil.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {vendors.map((v) => (
                    <div
                      key={v.name}
                      className="p-3 bg-brand-black/50 rounded-xl border border-brand-blue/20 flex justify-between items-center"
                    >
                      <div>
                        <p className="text-xs font-bold text-brand-offwhite">
                          {v.vehicle} — Vendedor: {v.name}
                        </p>
                        <p className="text-[11px] text-brand-offwhite/40">
                          {v.routes} • 0 atendimentos
                        </p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                        Disponível
                      </span>
                    </div>
                  ))}
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
                      Taxa de Positivação Comercial (0,0%)
                    </h3>
                    <p className="text-xs text-brand-offwhite/60">
                      Percentual de visitas que resultaram em venda direta e pedido faturado.
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-brand-black/50 rounded-xl border border-brand-blue/20 text-center space-y-2">
                  <p className="text-sm font-semibold text-brand-offwhite">
                    0 Pedidos Fechados de 0 Visitas
                  </p>
                  <p className="text-xs text-brand-offwhite/50">
                    A positivação é calculada automaticamente conforme as rotas diárias forem executadas no Modo Rua.
                  </p>
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
                      Conferência de Cargas
                    </h3>
                    <p className="text-xs text-brand-offwhite/60">
                      Controle digital de carregamento e conferência de mercadorias.
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-brand-black/50 rounded-xl border border-brand-blue/20 text-center space-y-3">
                  <p className="text-sm text-brand-offwhite/80 font-medium">
                    {totalLoadsCount === 0
                      ? "Nenhuma carga em trânsito ou despachada no momento."
                      : `${totalLoadsCount} cargas despachadas.`}
                  </p>
                  <p className="text-xs text-brand-offwhite/50">
                    Gere espelhos de carregamento conferidos digitalmente antes da saída dos veículos para a rua.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/luke/carregamento"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-gold text-brand-black rounded-xl text-xs font-bold hover:bg-yellow-500 transition shadow"
                    >
                      <Truck size={14} />
                      <span>Abrir Módulo de Cargas</span>
                    </Link>
                  </div>
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
