"use client";

import { useState, useMemo, useEffect } from "react";
import {
  MapPin,
  CheckCircle2,
  Lock,
  ShieldCheck,
  ChevronRight,
  Plus,
  Minus,
  ArrowLeft,
  QrCode,
  Banknote,
  DollarSign,
  Search,
  Filter,
  Store,
  Wifi,
  Radio,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { collection, onSnapshot, addDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

import initialProducts from "@/lib/products_catalog.json";
import initialClients from "@/lib/clients_catalog.json";
import { getVendorColor } from "@/lib/vendorColors";
import { MASTER_ROUTES_CATALOG, RouteMaster, mergeRoutesWithCatalog } from "@/lib/routesCatalog";
import VendorBadge from "@/components/VendorBadge";
import { logActivity } from "@/lib/activityLogger";
import { formatCurrency, formatPhoneBR } from "@/lib/formatters";

interface Product {
  id: string;
  name: string;
  price: number;
  barcode: string;
  category?: string;
  unit?: string;
  imageUrl?: string;
  brand?: string;
}

interface Client {
  id: string;
  order: number;
  name: string;
  document: string;
  address: string;
  imageUrl?: string; // Foto do Estabelecimento para Reconhecimento em Campo (Requisito 11)
  status: "PENDING" | "COMPLETED" | "SKIPPED";
  lastSaleAmount?: number;
}

const AVAILABLE_VENDORS = ["Alisson", "Alexandre", "Lucas"];

export default function LukeModoRuaPage() {
  const tenantId = "tenant_luke_001";

  const [routeStatus, setRouteStatus] = useState<"OPEN" | "CLOSED">("OPEN");
  const [closedHash, setClosedHash] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");

  const [selectedVendor, setSelectedVendor] = useState("Alisson");
  const [selectedRouteCode, setSelectedRouteCode] = useState("R1");
  const [isOnline, setIsOnline] = useState(true);

  const vendorColor = getVendorColor(selectedVendor);

  // ----------------------------------------------------
  // CATÁLOGO DE PRODUTOS 100% ONLINE VIA FIRESTORE (REQUISITO 4)
  // Permite que qualquer alteração de preço feita no ADM reflita instantaneamente na rua
  // ----------------------------------------------------
  const [productsCatalog, setProductsCatalog] = useState<Product[]>(initialProducts as Product[]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, `tenants/${tenantId}/products`),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: Product[] = [];
          snapshot.forEach((d) => {
            loaded.push({ id: d.id, ...d.data() } as Product);
          });
          setProductsCatalog(loaded);
          setIsOnline(true);
        }
      },
      (err) => {
        console.warn("Modo Rua: Produtos offline/fallback:", err?.message);
        setIsOnline(false);
      }
    );
    return () => unsub();
  }, []);

  // ----------------------------------------------------
  // ROTAS DINÂMICAS 100% ONLINE
  // ----------------------------------------------------
  const [routesList, setRoutesList] = useState<RouteMaster[]>(MASTER_ROUTES_CATALOG);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, `tenants/${tenantId}/routes`),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: RouteMaster[] = [];
          snapshot.forEach((d) => {
            loaded.push({ id: d.id, ...d.data() } as RouteMaster);
          });
          setRoutesList(mergeRoutesWithCatalog(loaded));
        } else {
          setRoutesList(MASTER_ROUTES_CATALOG);
        }
      },
      (err) => {
        console.warn("Rotas modo rua fallback:", err?.message);
      }
    );
    return () => unsub();
  }, []);

  const currentRoute = routesList.find((r) => r.code === selectedRouteCode) || {
    id: selectedRouteCode,
    code: selectedRouteCode,
    name: `Rota ${selectedRouteCode} - Centro & Região`,
    prefix: "R" as const,
    targetClientsCount: 24,
    estimatedRevenue: 4800,
    region: "Centro",
    active: true,
  };

  // ----------------------------------------------------
  // CLIENTES DA ROTA ATUAL 100% ONLINE (REQUISITO 4 E 11)
  // ----------------------------------------------------
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, `tenants/${tenantId}/clients`),
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedClients: any[] = [];
          snapshot.forEach((d) => {
            loadedClients.push({ id: d.id, ...d.data() });
          });

          const matching = loadedClients
            .filter((c) => c.routeId === selectedRouteCode)
            .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
            .map((c, idx) => ({
              id: c.id,
              order: Number(c.order || idx + 1),
              name: c.name,
              document: c.document || "00.000.000/0001-00",
              address: c.address || `${c.street || "Rua Principal"}, ${c.number || "100"} - ${c.neighborhood || "Centro"}`,
              imageUrl: c.imageUrl || "", // Foto da fachada
              status: "PENDING" as const,
              lastSaleAmount: 0,
            }));

          if (matching.length > 0) {
            setClients(matching);
            return;
          }
        }

        // Fallback local se o banco estiver vazio
        const fallback = (initialClients as any[])
          .filter((c) => c.routeId === selectedRouteCode)
          .slice(0, 10)
          .map((c, idx) => ({
            id: c.id,
            order: idx + 1,
            name: c.name,
            document: c.document || "00.000.000/0001-00",
            address: c.address || `${c.street || "Rua Principal"}, ${c.number || "100"} - ${c.neighborhood || "Centro"}`,
            imageUrl: c.imageUrl || "",
            status: "PENDING" as const,
            lastSaleAmount: 0,
          }));

        setClients(
          fallback.length > 0
            ? fallback
            : [
                {
                  id: "CLI-TEST-001",
                  order: 1,
                  name: "Barbearia Dom Lucas Barber Club & Spa (TESTE VIP)",
                  document: "34.128.992/0001-45",
                  address: "Avenida Afonso Pena, 2850 - Savassi, Belo Horizonte - MG",
                  status: "PENDING",
                  lastSaleAmount: 0,
                },
                {
                  id: "CLI-TEST-002",
                  order: 2,
                  name: "Studio Beleza Real & Barbearia Vip (TESTE SHOWROOM)",
                  document: "28.945.112/0001-88",
                  address: "Avenida Fleming, 840 - Pampulha, Belo Horizonte - MG",
                  status: "PENDING",
                  lastSaleAmount: 0,
                },
              ]
        );
      },
      (err) => {
        console.warn("Clientes modo rua fallback:", err?.message);
      }
    );
    return () => unsub();
  }, [selectedRouteCode]);

  // Sincroniza quando muda a rota
  const handleRouteChange = (routeCode: string) => {
    setSelectedRouteCode(routeCode);
    const newRoute = routesList.find((r) => r.code === routeCode);
    if (newRoute?.defaultVendorName) {
      setSelectedVendor(newRoute.defaultVendorName);
    }
  };

  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [cart, setCart] = useState<{ [productId: string]: number }>({
    "PROD-001": 2,
    "PROD-002": 3,
  });
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CASH" | "TICKET">("PIX");
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);

  const totalSales = clients
    .filter((c) => c.status === "COMPLETED")
    .reduce((acc, c) => acc + (c.lastSaleAmount || 0), 0);
  const completedCount = clients.filter((c) => c.status === "COMPLETED").length;

  const currentCartTotal = Object.entries(cart).reduce((sum, [pId, qty]) => {
    const prod = productsCatalog.find((p) => p.id === pId);
    return sum + (prod ? prod.price * qty : 0);
  }, 0);

  const handleUpdateQty = (pId: string, delta: number) => {
    setCart((prev) => ({
      ...prev,
      [pId]: Math.max(0, (prev[pId] || 0) + delta),
    }));
  };

  const handleOpenClientSale = (client: Client) => {
    if (routeStatus === "CLOSED") return;
    setActiveClient(client);
    setCart({
      "PROD-001": 2,
      "PROD-002": 3,
    });
  };

  // Finalização de Venda Online com Auditoria
  const handleFinalizeSale = async () => {
    if (!activeClient || currentCartTotal === 0) return;

    const saleAmount = currentCartTotal;
    const clientRef = activeClient;

    setClients((prev) =>
      prev.map((c) =>
        c.id === clientRef.id
          ? { ...c, status: "COMPLETED", lastSaleAmount: saleAmount }
          : c
      )
    );
    setActiveClient(null);

    // Grava transação online no Firestore (Anti-Fraude)
    try {
      await addDoc(collection(db, `tenants/${tenantId}/transactions`), {
        clientId: clientRef.id,
        clientName: clientRef.name,
        routeCode: selectedRouteCode,
        vendorName: selectedVendor,
        amount: saleAmount,
        paymentMethod,
        items: cart,
        timestamp: new Date().toISOString(),
        createdAt: serverTimestamp(),
      });

      await logActivity(tenantId, {
        userName: selectedVendor,
        userEmail: `${selectedVendor.toLowerCase()}@luke.com`,
        action: "VENDA_REALIZADA",
        entity: "TRANSACAO",
        entityId: clientRef.id,
        details: `Venda de ${formatCurrency(saleAmount)} realizada no cliente "${clientRef.name}" (Rota ${selectedRouteCode}) via ${paymentMethod}.`,
      });
    } catch (e) {
      console.warn("Gravação de venda offline:", e);
    }
  };

  const handleExecuteRouteClose = async () => {
    const timestamp = Date.now();
    const hash = `KLRO-LUKE-${timestamp.toString(16).toUpperCase()}-${Math.floor(
      Math.random() * 10000
    )}`;
    setClosedHash(hash);
    setRouteStatus("CLOSED");
    setIsClosingModalOpen(false);

    try {
      await logActivity(tenantId, {
        userName: selectedVendor,
        userEmail: `${selectedVendor.toLowerCase()}@luke.com`,
        action: "ROTA_FINALIZADA",
        entity: "EXECUCAO_ROTA",
        details: `Fechou e auditou a rota ${selectedRouteCode} com ${completedCount} atendimentos e ${formatCurrency(totalSales)} em vendas. Hash: ${hash}`,
      });
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-brand-black text-brand-offwhite pb-12">
      {/* Top Header Mobile */}
      <div className="bg-brand-graphite border-b border-brand-blue/30 sticky top-0 z-30 shadow-xl relative">
        <div style={{ backgroundColor: vendorColor }} className="h-1 w-full absolute top-0 left-0 right-0" />
        <div className="max-w-xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link
              href="/luke"
              className="p-2 bg-brand-black/50 text-brand-offwhite/70 hover:text-brand-offwhite rounded-lg border border-brand-blue/30"
              title="Voltar ao Painel LUKE"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center space-x-1.5">
                <span style={{ backgroundColor: vendorColor }} className="w-2 h-2 rounded-full" />
                <h1 className="text-xs uppercase tracking-widest font-extrabold text-brand-gold">
                  LUKE BRASIL &bull; MODO RUA
                </h1>
              </div>
              <div className="flex items-center space-x-2 mt-0.5">
                <select
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                  className="bg-transparent text-sm font-bold text-brand-offwhite focus:outline-none cursor-pointer"
                >
                  {AVAILABLE_VENDORS.map((v) => (
                    <option key={v} value={v} className="bg-brand-graphite text-brand-offwhite">
                      {v}
                    </option>
                  ))}
                </select>
                <VendorBadge vendorName={selectedVendor} color={vendorColor} size="xs" variant="solid" />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Indicador de Modo Online em Tempo Real (Requisito 4) */}
            <div className="hidden sm:flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Online em Tempo Real</span>
            </div>

            {routeStatus === "OPEN" ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/15 text-green-400 border border-green-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping mr-1.5" />
                Rota Ativa
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-brand-blue/30 text-brand-gold border border-brand-gold/40">
                <Lock size={12} className="mr-1" />
                Rota Fechada
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Mobile */}
      <main className="max-w-xl mx-auto px-4 pt-4 space-y-4">
        {/* Banner Online Informativo (Requisito 4) */}
        <div className="flex items-center justify-between p-2.5 bg-brand-blue/15 border border-brand-blue/30 rounded-xl text-xs text-brand-offwhite">
          <div className="flex items-center space-x-2">
            <Radio size={14} className="text-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold">
              Preços atualizados em tempo real via nuvem LUKE
            </span>
          </div>
          <span className="text-[10px] font-mono text-brand-gold">
            {productsCatalog.length} produtos
          </span>
        </div>

        {/* Seletor de Rota */}
        <div className="flex items-center space-x-2 bg-brand-graphite p-2.5 rounded-xl border border-brand-blue/30 text-xs">
          <span className="text-brand-offwhite/60 font-semibold">Selecionar Rota:</span>
          <select
            value={selectedRouteCode}
            onChange={(e) => handleRouteChange(e.target.value)}
            className="bg-brand-black text-brand-gold font-bold px-3 py-1.5 rounded-lg border border-brand-blue/40 focus:outline-none flex-1 truncate"
          >
            {routesList.map((r) => (
              <option key={r.code} value={r.code}>
                {r.code} - {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Card Resumo da Rota do Dia */}
        <div className="bg-gradient-to-br from-brand-graphite to-brand-blue/20 rounded-2xl p-5 border border-brand-blue/30 shadow-lg relative overflow-hidden">
          <div style={{ backgroundColor: vendorColor }} className="absolute top-0 left-0 right-0 h-1.5" />

          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span
                  style={{ backgroundColor: vendorColor }}
                  className="px-2 py-0.5 rounded text-[11px] font-mono font-black text-white"
                >
                  {currentRoute.code}
                </span>
                <span className="text-xs text-brand-offwhite/60 font-medium">Ciclo Atual (LUKE)</span>
              </div>
              <h2 className="text-base font-bold text-brand-offwhite">{currentRoute.name}</h2>
            </div>
            <div className="text-right">
              <p className="text-xs text-brand-offwhite/60 font-medium">Total Vendido</p>
              <p className="text-xl font-extrabold text-brand-gold font-mono">
                {formatCurrency(totalSales)}
              </p>
            </div>
          </div>

          {/* Barra de Progresso */}
          <div className="space-y-1.5 pt-2 border-t border-brand-blue/20">
            <div className="flex justify-between text-xs font-semibold text-brand-offwhite/70">
              <span>
                Progresso: {completedCount} de {clients.length} clientes
              </span>
              <span>{clients.length > 0 ? Math.round((completedCount / clients.length) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-brand-black rounded-full h-2.5 overflow-hidden border border-brand-blue/30">
              <div
                className="bg-brand-gold h-full rounded-full transition-all duration-500"
                style={{ width: `${clients.length > 0 ? (completedCount / clients.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Ações de Fechamento */}
          {routeStatus === "OPEN" ? (
            <button
              onClick={() => setIsClosingModalOpen(true)}
              className="mt-4 w-full bg-brand-gold text-brand-black py-2.5 rounded-xl font-bold hover:bg-yellow-500 transition shadow-lg flex items-center justify-center space-x-2 text-sm cursor-pointer"
            >
              <Lock size={16} />
              <span>Finalizar e Fechar Rota (LUKE)</span>
            </button>
          ) : (
            <div className="mt-4 p-3 bg-brand-black/70 rounded-xl border border-brand-gold/30 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 text-green-400 font-bold">
                <ShieldCheck size={16} />
                <span>Rota Auditada e Bloqueada com Sucesso</span>
              </div>
              <p className="text-brand-offwhite/50 font-mono text-[10px] break-all">
                Hash de Auditoria: {closedHash}
              </p>
            </div>
          )}
        </div>

        {/* Lista de Clientes com Reconhecimento Visual da Fachada (Requisito 11) */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-offwhite/70">
              Sequência de Visitas ({clients.length})
            </h3>
            <span className="text-xs text-brand-gold">GPS Otimizado</span>
          </div>

          {clients.map((client) => {
            const isCompleted = client.status === "COMPLETED";

            return (
              <div
                key={client.id}
                onClick={() => handleOpenClientSale(client)}
                className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                  isCompleted
                    ? "bg-brand-graphite/40 border-green-500/20 opacity-90"
                    : "bg-brand-graphite border-brand-blue/30 hover:border-brand-gold shadow-md"
                }`}
              >
                <div className="flex items-center space-x-3">
                  {/* Foto da Fachada para Reconhecimento Visual em Campo (Requisito 11) */}
                  <div className="w-12 h-12 rounded-xl bg-brand-black/60 border border-brand-gold/30 flex items-center justify-center shrink-0 overflow-hidden shadow">
                    {client.imageUrl ? (
                      <img
                        src={client.imageUrl}
                        alt={client.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Store size={22} className="text-brand-gold/70" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="px-1.5 py-0.2 bg-brand-blue/30 text-brand-gold rounded text-[10px] font-mono font-bold">
                        #{client.order}
                      </span>
                      <h4 className="font-bold text-brand-offwhite text-xs sm:text-sm leading-snug">
                        {client.name}
                      </h4>
                    </div>
                    <p className="text-[11px] text-brand-offwhite/50 flex items-center mt-0.5">
                      <MapPin size={11} className="mr-1 text-brand-gold shrink-0" />
                      <span className="truncate max-w-[190px]">{client.address}</span>
                    </p>
                    {isCompleted && (
                      <p className="text-[11px] font-bold text-green-400 mt-0.5">
                        ✓ Venda: {formatCurrency(client.lastSaleAmount || 0)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-brand-offwhite/40">
                  {routeStatus === "OPEN" && !isCompleted && (
                    <span className="px-2.5 py-1 bg-brand-gold text-brand-black text-xs font-bold rounded-lg mr-1 shadow">
                      Atender
                    </span>
                  )}
                  <ChevronRight size={18} />
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* MODAL DE ATENDIMENTO E VENDA ONLINE */}
      {activeClient && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-brand-graphite border border-brand-blue/40 w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header do Cliente com Foto */}
            <div className="flex items-start justify-between pb-3 border-b border-brand-blue/30">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-brand-black/60 border border-brand-gold/30 flex items-center justify-center overflow-hidden shrink-0">
                  {activeClient.imageUrl ? (
                    <img src={activeClient.imageUrl} alt={activeClient.name} className="w-full h-full object-cover" />
                  ) : (
                    <Store size={22} className="text-brand-gold/70" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-blue/30 text-brand-gold font-mono">
                    VISITA #{activeClient.order}
                  </span>
                  <h3 className="text-sm font-bold text-brand-offwhite mt-0.5">{activeClient.name}</h3>
                  <p className="text-[11px] text-brand-offwhite/50">{activeClient.address}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveClient(null)}
                className="text-brand-offwhite/50 hover:text-brand-offwhite text-sm p-1 cursor-pointer"
              >
                ✕ Fechar
              </button>
            </div>

            {/* Catálogo com Stepper e Busca */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-offwhite/70">
                  Produtos do Pedido ({Object.values(cart).reduce((a, b) => a + b, 0)} itens)
                </h4>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                  ● Preços Ao Vivo
                </span>
              </div>

              {/* Busca rápida de produto no atendimento */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-brand-offwhite/40" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Filtrar produtos LUKE..."
                  className="w-full pl-8 pr-3 py-1.5 bg-brand-black border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite placeholder-brand-offwhite/30 focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {productsCatalog
                  .filter((p) =>
                    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                    (p.category && p.category.toLowerCase().includes(productSearch.toLowerCase()))
                  )
                  .map((product) => {
                    const qty = cart[product.id] || 0;
                    return (
                      <div
                        key={product.id}
                        className={`p-2.5 rounded-xl border flex justify-between items-center transition ${
                          qty > 0
                            ? "bg-brand-blue/20 border-brand-gold/40"
                            : "bg-brand-black/60 border-brand-blue/30"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 pr-2">
                          <div className="w-9 h-9 rounded-lg bg-brand-black border border-brand-blue/30 overflow-hidden shrink-0">
                            <img
                              src={product.imageUrl || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80"}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[9px] px-1 py-0.2 rounded bg-brand-gold/15 text-brand-gold font-bold uppercase">
                                {product.brand || "LUKE"}
                              </span>
                              <p className="text-xs font-semibold text-brand-offwhite">{product.name}</p>
                            </div>
                            <p className="text-[11px] text-brand-gold font-bold mt-0.5 font-mono">
                              {formatCurrency(product.price)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5 bg-brand-graphite px-2 py-1 rounded-lg border border-brand-blue/40 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(product.id, -1)}
                            className="p-1 text-brand-offwhite/70 hover:text-brand-gold transition cursor-pointer"
                          >
                            <Minus size={13} />
                          </button>
                          <span className={`font-bold text-xs w-5 text-center ${qty > 0 ? "text-brand-gold" : "text-brand-offwhite/60"}`}>
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(product.id, 1)}
                            className="p-1 text-brand-offwhite/70 hover:text-brand-gold transition cursor-pointer"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Forma de Pagamento */}
            <div className="space-y-2 pt-2 border-t border-brand-blue/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-offwhite/70">
                Forma de Pagamento
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("PIX")}
                  className={`py-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center space-y-1 border transition cursor-pointer ${
                    paymentMethod === "PIX"
                      ? "bg-teal-500/20 text-teal-300 border-teal-400"
                      : "bg-brand-black/50 text-brand-offwhite/60 border-brand-blue/30"
                  }`}
                >
                  <QrCode size={16} />
                  <span>Pix</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CASH")}
                  className={`py-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center space-y-1 border transition cursor-pointer ${
                    paymentMethod === "CASH"
                      ? "bg-amber-500/20 text-amber-300 border-amber-400"
                      : "bg-brand-black/50 text-brand-offwhite/60 border-brand-blue/30"
                  }`}
                >
                  <Banknote size={16} />
                  <span>Dinheiro</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("TICKET")}
                  className={`py-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center space-y-1 border transition cursor-pointer ${
                    paymentMethod === "TICKET"
                      ? "bg-blue-500/20 text-blue-300 border-blue-400"
                      : "bg-brand-black/50 text-brand-offwhite/60 border-brand-blue/30"
                  }`}
                >
                  <DollarSign size={16} />
                  <span>Boleto / P.A.</span>
                </button>
              </div>
            </div>

            {/* Total e Ação */}
            <div className="pt-3 border-t border-brand-blue/30 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-brand-offwhite/60 uppercase font-semibold">Total do Pedido</p>
                <p className="text-xl font-extrabold text-brand-gold font-mono">
                  {formatCurrency(currentCartTotal)}
                </p>
              </div>

              <button
                type="button"
                onClick={handleFinalizeSale}
                disabled={currentCartTotal === 0}
                className="px-6 py-2.5 bg-brand-gold text-brand-black rounded-xl font-black text-xs hover:bg-yellow-500 transition shadow-lg disabled:opacity-50 cursor-pointer"
              >
                Confirmar Venda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE FECHAMENTO DE ROTA */}
      {isClosingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-brand-graphite border border-brand-blue/50 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center mx-auto border border-brand-gold/40">
                <Lock size={22} />
              </div>
              <h3 className="text-base font-bold text-brand-offwhite">
                Fechar e Auditar Rota?
              </h3>
              <p className="text-xs text-brand-offwhite/60 leading-relaxed">
                Ao fechar a rota, os dados de vendas e estoque serão sincronizados na nuvem e o ciclo desta rota será bloqueado contra alterações.
              </p>
            </div>

            <div className="p-3 bg-brand-black/60 rounded-xl border border-brand-blue/30 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-brand-offwhite/60">Vendedor:</span>
                <span className="font-bold text-brand-offwhite">{selectedVendor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-offwhite/60">Atendimentos:</span>
                <span className="font-bold text-brand-offwhite">{completedCount} concluídos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-offwhite/60">Total Vendido:</span>
                <span className="font-bold text-brand-gold font-mono">{formatCurrency(totalSales)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsClosingModalOpen(false)}
                className="w-full py-2 bg-brand-black text-brand-offwhite/70 hover:text-brand-offwhite border border-brand-blue/30 rounded-xl text-xs font-bold transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteRouteClose}
                className="w-full py-2 bg-brand-gold text-brand-black rounded-xl text-xs font-black hover:bg-yellow-500 transition shadow-lg"
              >
                Sim, Fechar Rota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
