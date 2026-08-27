"use client";

import { useState } from "react";
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
} from "lucide-react";
import Link from "next/link";

import initialProducts from "@/lib/products_catalog.json";
import { getVendorColor } from "@/lib/vendorColors";
import { MASTER_ROUTES_CATALOG } from "@/lib/routesCatalog";
import VendorBadge from "@/components/VendorBadge";

interface Product {
  id: string;
  name: string;
  price: number;
  barcode: string;
  category?: string;
  unit?: string;
}

interface Client {
  id: string;
  order: number;
  name: string;
  document: string;
  address: string;
  status: "PENDING" | "COMPLETED" | "SKIPPED";
  lastSaleAmount?: number;
}

const AVAILABLE_VENDORS = ["Alisson", "Alexandre", "Lucas"];

export default function LukeModoRuaPage() {
  const [routeStatus, setRouteStatus] = useState<"OPEN" | "CLOSED">("OPEN");
  const [closedHash, setClosedHash] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [productFilterCat, setProductFilterCat] = useState("Todas");

  const [selectedVendor, setSelectedVendor] = useState("Alisson");
  const [selectedRouteCode, setSelectedRouteCode] = useState("F10");
  const [isRouteSelectorOpen, setIsRouteSelectorOpen] = useState(false);

  const vendorColor = getVendorColor(selectedVendor);
  const currentRoute = MASTER_ROUTES_CATALOG.find((r) => r.code === selectedRouteCode) || {
    code: selectedRouteCode,
    name: `Rota ${selectedRouteCode} - Lagoa Santa & Vetor Norte`,
  };

  const productsCatalog: Product[] = initialProducts;

  const [clients, setClients] = useState<Client[]>([
    {
      id: "c1",
      order: 1,
      name: "Padaria & Confeitaria Estrela",
      document: "12.345.678/0001-90",
      address: "Rua das Flores, 142 - Centro",
      status: "COMPLETED",
      lastSaleAmount: 450.0,
    },
    {
      id: "c2",
      order: 2,
      name: "Supermercado Boa Vista",
      document: "98.765.432/0001-11",
      address: "Av. Brasil, 1200 - Centro",
      status: "COMPLETED",
      lastSaleAmount: 1280.5,
    },
    {
      id: "c3",
      order: 3,
      name: "Mercearia Central",
      document: "45.123.789/0001-33",
      address: "Rua XV de Novembro, 88 - Centro",
      status: "PENDING",
    },
    {
      id: "c4",
      order: 4,
      name: "Panificadora Pão Dourado",
      document: "67.890.123/0001-44",
      address: "Rua São Paulo, 305 - Zona Sul",
      status: "PENDING",
    },
    {
      id: "c5",
      order: 5,
      name: "Armazém & Conveniência Sul",
      document: "33.222.111/0001-55",
      address: "Av. das Palmeiras, 450 - Zona Sul",
      status: "PENDING",
    },
  ]);

  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [cart, setCart] = useState<{ [productId: string]: number }>({
    p1: 0,
    p2: 0,
    p3: 0,
    p4: 0,
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
    setCart({ p1: 1, p2: 2, p3: 0, p4: 0 });
  };

  const handleFinalizeSale = () => {
    if (!activeClient || currentCartTotal === 0) return;

    setClients((prev) =>
      prev.map((c) =>
        c.id === activeClient.id
          ? { ...c, status: "COMPLETED", lastSaleAmount: currentCartTotal }
          : c
      )
    );
    setActiveClient(null);
  };

  const handleExecuteRouteClose = () => {
    const timestamp = Date.now();
    const hash = `KLRO-LUKE-${timestamp.toString(16).toUpperCase()}-${Math.floor(
      Math.random() * 10000
    )}`;
    setClosedHash(hash);
    setRouteStatus("CLOSED");
    setIsClosingModalOpen(false);
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
                  LUKE BRASIL • MODO RUA
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

          <div>
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
              <p className="text-xl font-extrabold text-brand-gold">
                R$ {totalSales.toFixed(2).replace(".", ",")}
              </p>
            </div>
          </div>

          {/* Barra de Progresso */}
          <div className="space-y-1.5 pt-2 border-t border-brand-blue/20">
            <div className="flex justify-between text-xs font-semibold text-brand-offwhite/70">
              <span>
                Progresso: {completedCount} de {clients.length} clientes
              </span>
              <span>{Math.round((completedCount / clients.length) * 100)}%</span>
            </div>
            <div className="w-full bg-brand-black rounded-full h-2.5 overflow-hidden border border-brand-blue/30">
              <div
                className="bg-brand-gold h-full rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / clients.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Ações de Fechamento */}
          {routeStatus === "OPEN" ? (
            <button
              onClick={() => setIsClosingModalOpen(true)}
              className="mt-4 w-full bg-brand-gold text-brand-black py-2.5 rounded-xl font-bold hover:bg-yellow-500 transition shadow-lg flex items-center justify-center space-x-2 text-sm"
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

        {/* Lista de Clientes */}
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
                className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                  isCompleted
                    ? "bg-brand-graphite/40 border-green-500/20 opacity-90"
                    : "bg-brand-graphite border-brand-blue/30 hover:border-brand-gold shadow-md"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                      isCompleted
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-brand-blue/30 text-brand-gold border border-brand-gold/30"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={16} /> : client.order}
                  </div>

                  <div>
                    <h4 className="font-bold text-brand-offwhite text-sm leading-snug">
                      {client.name}
                    </h4>
                    <p className="text-xs text-brand-offwhite/50 flex items-center mt-0.5">
                      <MapPin size={12} className="mr-1 text-brand-gold shrink-0" />
                      <span className="truncate max-w-[210px]">{client.address}</span>
                    </p>
                    {isCompleted && (
                      <p className="text-xs font-bold text-green-400 mt-1">
                        ✓ Venda: R$ {client.lastSaleAmount?.toFixed(2).replace(".", ",")}
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

      {/* MODAL DE ATENDIMENTO */}
      {activeClient && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-brand-graphite w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-brand-blue/40 p-5 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-brand-blue/20 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-gold">
                  LUKE Brasil • Pedido
                </span>
                <h3 className="text-lg font-bold text-brand-offwhite">{activeClient.name}</h3>
                <p className="text-xs text-brand-offwhite/50">{activeClient.document}</p>
              </div>
              <button
                onClick={() => setActiveClient(null)}
                className="text-brand-offwhite/50 hover:text-brand-offwhite text-sm p-1"
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
              </div>

              {/* Busca rápida de produto no atendimento */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-brand-offwhite/40" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Filtrar entre os 46 produtos..."
                  className="w-full pl-8 pr-3 py-1.5 bg-brand-black border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite placeholder-brand-offwhite/30 focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
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
                              src={(product as any).imageUrl || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80"}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[9px] px-1 py-0.2 rounded bg-brand-gold/15 text-brand-gold font-bold uppercase">
                                {(product as any).brand || "LUKE"}
                              </span>
                              <p className="text-xs font-semibold text-brand-offwhite">{product.name}</p>
                            </div>
                            <p className="text-[11px] text-brand-gold font-bold mt-0.5">
                              R$ {product.price.toFixed(2).replace(".", ",")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5 bg-brand-graphite px-2 py-1 rounded-lg border border-brand-blue/40 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(product.id, -1)}
                            className="p-1 text-brand-offwhite/70 hover:text-brand-gold transition"
                          >
                            <Minus size={13} />
                          </button>
                          <span className={`font-bold text-xs w-5 text-center ${qty > 0 ? "text-brand-gold" : "text-brand-offwhite/60"}`}>
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(product.id, 1)}
                            className="p-1 text-brand-offwhite/70 hover:text-brand-gold transition"
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
                  className={`py-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center space-y-1 border transition ${
                    paymentMethod === "PIX"
                      ? "bg-teal-500/20 text-teal-300 border-teal-400"
                      : "bg-brand-black/50 text-brand-offwhite/60 border-brand-blue/30"
                  }`}
                >
                  <QrCode size={18} />
                  <span>Pix</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CASH")}
                  className={`py-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center space-y-1 border transition ${
                    paymentMethod === "CASH"
                      ? "bg-amber-500/20 text-amber-300 border-amber-400"
                      : "bg-brand-black/50 text-brand-offwhite/60 border-brand-blue/30"
                  }`}
                >
                  <Banknote size={18} />
                  <span>Dinheiro</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("TICKET")}
                  className={`py-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center space-y-1 border transition ${
                    paymentMethod === "TICKET"
                      ? "bg-purple-500/20 text-purple-300 border-purple-400"
                      : "bg-brand-black/50 text-brand-offwhite/60 border-brand-blue/30"
                  }`}
                >
                  <DollarSign size={18} />
                  <span>A Prazo</span>
                </button>
              </div>
            </div>

            {/* Total e Concluir */}
            <div className="pt-3 border-t border-brand-blue/30 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-brand-offwhite/70">Total do Pedido</span>
                <span className="text-2xl font-extrabold text-brand-gold">
                  R$ {currentCartTotal.toFixed(2).replace(".", ",")}
                </span>
              </div>

              <button
                onClick={handleFinalizeSale}
                disabled={currentCartTotal === 0}
                className="w-full bg-brand-gold text-brand-black py-3 rounded-xl font-extrabold hover:bg-yellow-500 disabled:opacity-40 transition shadow-lg text-sm"
              >
                Concluir Venda e Registrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FECHAMENTO ANTI-FRAUDE */}
      {isClosingModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-graphite w-full max-w-md rounded-2xl border border-brand-gold/40 p-6 space-y-5 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-brand-gold/15 text-brand-gold flex items-center justify-center mx-auto border border-brand-gold/30">
                <Lock size={24} />
              </div>
              <h3 className="text-xl font-bold text-brand-offwhite">
                Fechamento Anti-Fraude (LUKE Brasil)
              </h3>
              <p className="text-xs text-brand-offwhite/60">
                Ao fechar a rota, todas as transações serão consolidadas e bloqueadas contra edição no Firestore.
              </p>
            </div>

            <div className="bg-brand-black/70 p-4 rounded-xl space-y-2 border border-brand-blue/30 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-offwhite/60">Total Faturado:</span>
                <span className="font-bold text-brand-gold">
                  R$ {totalSales.toFixed(2).replace(".", ",")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-offwhite/60">Visitas Concluídas:</span>
                <span className="font-bold text-brand-offwhite">
                  {completedCount} de {clients.length}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleExecuteRouteClose}
                className="w-full bg-brand-gold text-brand-black py-3 rounded-xl font-extrabold hover:bg-yellow-500 transition shadow-lg text-sm flex items-center justify-center space-x-2"
              >
                <ShieldCheck size={18} />
                <span>Confirmar e Travar Rota</span>
              </button>

              <button
                onClick={() => setIsClosingModalOpen(false)}
                className="w-full py-2.5 text-xs text-brand-offwhite/60 hover:text-brand-offwhite transition"
              >
                Cancelar e Continuar Vendendo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
