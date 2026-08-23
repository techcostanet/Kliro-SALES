"use client";

import { useState } from "react";
import {
  MapPin,
  CheckCircle2,
  Clock,
  DollarSign,
  QrCode,
  Banknote,
  ShoppingCart,
  Plus,
  Minus,
  ArrowLeft,
  Lock,
  ShieldCheck,
  Building2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  barcode: string;
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

export default function ModoRuaPage() {
  // Estado da Rota
  const [routeStatus, setRouteStatus] = useState<"OPEN" | "CLOSED">("OPEN");
  const [closedHash, setClosedHash] = useState<string | null>(null);

  // Vendedor e Catálogo
  const vendorName = "Carlos Eduardo";
  const tenantName = "LUKE Brasil";
  const routeName = "Rota Centro & Zona Sul";

  const productsCatalog: Product[] = [
    { id: "p1", name: "Produto A - Premium 1kg", price: 28.5, barcode: "78910001" },
    { id: "p2", name: "Produto B - Tradicional 500g", price: 15.0, barcode: "78910002" },
    { id: "p3", name: "Produto C - Especial Caixa", price: 65.0, barcode: "78910003" },
    { id: "p4", name: "Produto D - Display c/ 12un", price: 42.0, barcode: "78910004" },
  ];

  // Lista de Clientes da Rota
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

  // Modal de Atendimento / Venda
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [cart, setCart] = useState<{ [productId: string]: number }>({
    p1: 0,
    p2: 0,
    p3: 0,
    p4: 0,
  });
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CASH" | "TICKET">("PIX");
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);

  // Totais Calculados
  const totalSales = clients
    .filter((c) => c.status === "COMPLETED")
    .reduce((acc, c) => acc + (c.lastSaleAmount || 0), 0);
  const completedCount = clients.filter((c) => c.status === "COMPLETED").length;

  const currentCartTotal = Object.entries(cart).reduce((sum, [pId, qty]) => {
    const prod = productsCatalog.find((p) => p.id === pId);
    return sum + (prod ? prod.price * qty : 0);
  }, 0);

  // Handlers
  const handleUpdateQty = (pId: string, delta: number) => {
    setCart((prev) => ({
      ...prev,
      [pId]: Math.max(0, (prev[pId] || 0) + delta),
    }));
  };

  const handleOpenClientSale = (client: Client) => {
    if (routeStatus === "CLOSED") return;
    setActiveClient(client);
    setCart({ p1: 1, p2: 2, p3: 0, p4: 0 }); // Sugestão de pedido
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
    const hash = `KLRO-AUDIT-LK-${timestamp.toString(16).toUpperCase()}-${Math.floor(
      Math.random() * 10000
    )}`;
    setClosedHash(hash);
    setRouteStatus("CLOSED");
    setIsClosingModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-brand-black text-brand-offwhite pb-12">
      {/* Top Header Mobile */}
      <div className="bg-brand-graphite border-b border-brand-blue/30 sticky top-0 z-30 shadow-xl">
        <div className="max-w-xl mx-auto px-4 py-3.5 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="p-2 bg-brand-black/50 text-brand-offwhite/70 hover:text-brand-offwhite rounded-lg border border-brand-blue/30"
              title="Voltar ao Painel Web"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-gold" />
                <h1 className="text-xs uppercase tracking-widest font-extrabold text-brand-gold">
                  {tenantName} • MODO RUA
                </h1>
              </div>
              <p className="text-sm font-bold text-brand-offwhite">{vendorName}</p>
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

      {/* Conteúdo Centralizado Mobile */}
      <main className="max-w-xl mx-auto px-4 pt-4 space-y-4">
        {/* Card da Rota Atual & Resumo Financeiro */}
        <div className="bg-gradient-to-br from-brand-graphite to-brand-blue/20 rounded-2xl p-5 border border-brand-blue/30 shadow-lg">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs text-brand-offwhite/60 font-medium">Ciclo Atual</p>
              <h2 className="text-lg font-bold text-brand-offwhite">{routeName}</h2>
            </div>
            <div className="text-right">
              <p className="text-xs text-brand-offwhite/60 font-medium">Total Vendido</p>
              <p className="text-xl font-extrabold text-brand-gold">
                R$ {totalSales.toFixed(2).replace(".", ",")}
              </p>
            </div>
          </div>

          {/* Barra de Progresso de Visitas */}
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
              <span>Finalizar e Fechar Rota de Hoje</span>
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

        {/* Lista Sequencial de Clientes da Rota */}
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

      {/* MODAL DE ATENDIMENTO / NOVA VENDA */}
      {activeClient && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-brand-graphite w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-brand-blue/40 p-5 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-brand-blue/20 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-gold">
                  Atendimento ao Cliente
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

            {/* Catálogo com Stepper de Quantidade */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-offwhite/70">
                Produtos do Pedido
              </h4>

              <div className="space-y-2">
                {productsCatalog.map((product) => {
                  const qty = cart[product.id] || 0;
                  return (
                    <div
                      key={product.id}
                      className="p-3 bg-brand-black/60 rounded-xl border border-brand-blue/30 flex justify-between items-center"
                    >
                      <div>
                        <p className="text-sm font-semibold text-brand-offwhite">{product.name}</p>
                        <p className="text-xs text-brand-gold font-bold">
                          R$ {product.price.toFixed(2).replace(".", ",")}
                        </p>
                      </div>

                      {/* Stepper +/- */}
                      <div className="flex items-center space-x-2 bg-brand-graphite px-2 py-1 rounded-lg border border-brand-blue/40">
                        <button
                          onClick={() => handleUpdateQty(product.id, -1)}
                          className="p-1 text-brand-offwhite/70 hover:text-brand-gold transition"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-bold text-sm w-5 text-center">{qty}</span>
                        <button
                          onClick={() => handleUpdateQty(product.id, 1)}
                          className="p-1 text-brand-offwhite/70 hover:text-brand-gold transition"
                        >
                          <Plus size={14} />
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

            {/* Total e Botão de Concluir Venda */}
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

      {/* MODAL DE FECHAMENTO DE ROTA (ANTI-FRAUDE) */}
      {isClosingModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-graphite w-full max-w-md rounded-2xl border border-brand-gold/40 p-6 space-y-5 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-brand-gold/15 text-brand-gold flex items-center justify-center mx-auto border border-brand-gold/30">
                <Lock size={24} />
              </div>
              <h3 className="text-xl font-bold text-brand-offwhite">Fechamento Anti-Fraude</h3>
              <p className="text-xs text-brand-offwhite/60">
                Ao fechar a rota, todas as transações serão consolidadas e bloqueadas contra edição.
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
              <div className="flex justify-between">
                <span className="text-brand-offwhite/60">Ciclo Semanal:</span>
                <span className="text-brand-offwhite font-medium">Terça a Segunda</span>
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
