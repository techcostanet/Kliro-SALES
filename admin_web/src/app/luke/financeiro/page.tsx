"use client";

import { useState, useEffect, useMemo } from "react";
import {
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Filter,
  CreditCard,
  Building2,
  Store,
  RefreshCw,
  X,
  Wallet,
  FileSpreadsheet,
  Check,
  Tag,
  Users,
} from "lucide-react";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import initialCategories from "@/lib/financial_categories.json";

export interface PayableItem {
  id: string;
  description: string;
  categoryId: string;
  categoryName: string;
  supplier: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  paymentMethod?: string;
  competence: string;
  status: "PENDING" | "PAID" | "OVERDUE";
  recurrence?: boolean;
  notes?: string;
}

export interface ReceivableItem {
  id: string;
  clientName: string;
  buyerName: string;
  routeId: string;
  vendorName: string;
  amount: number;
  saleDate: string;
  scheduledDate: string;
  receivedDate?: string;
  paymentMethod?: "PIX" | "CASH" | "CARD" | "BOLETO";
  status: "PENDING" | "RECEIVED" | "NEXT_MONTH" | "OVERDUE";
  notes?: string;
}

const INITIAL_PAYABLES: PayableItem[] = [
  {
    id: "pay-001",
    description: "Compra Matéria-Prima / Pomadas Fábrica",
    categoryId: "CAT-008",
    categoryName: "Fornecedores & Fábrica (Cosméticos)",
    supplier: "Laboratório Hair Tech Indústria",
    amount: 14850.0,
    dueDate: "2026-08-28",
    competence: "08/2026",
    status: "PENDING",
    recurrence: false,
    notes: "Lote 200un Pomada Efeito Teia + 100un Óleo Argan",
  },
  {
    id: "pay-002",
    description: "Abastecimento Frotas Montana (Alisson)",
    categoryId: "CAT-009",
    categoryName: "Combustível & Abastecimento",
    supplier: "Posto Ipiranga Rota Centro",
    amount: 480.0,
    dueDate: "2026-08-25",
    paymentDate: "2026-08-25",
    paymentMethod: "DEBITO",
    competence: "08/2026",
    status: "PAID",
  },
  {
    id: "pay-003",
    description: "Alimentação Rota R4 (Alisson)",
    categoryId: "CAT-001",
    categoryName: "Alimentação Rota",
    supplier: "Restaurante Rota Sul",
    amount: 65.0,
    dueDate: "2026-08-26",
    paymentDate: "2026-08-26",
    paymentMethod: "PIX",
    competence: "08/2026",
    status: "PAID",
  },
  {
    id: "pay-004",
    description: "Adiantamento Salário Alexandre (Vendedor)",
    categoryId: "CAT-005",
    categoryName: "Salário Alexandre (Vendedor)",
    supplier: "Alexandre",
    amount: 1200.0,
    dueDate: "2026-08-30",
    competence: "08/2026",
    status: "PENDING",
  },
  {
    id: "pay-005",
    description: "Aluguel Galpão / Estoque Central",
    categoryId: "CAT-011",
    categoryName: "Aluguel & Galpão",
    supplier: "Imobiliária Central",
    amount: 3200.0,
    dueDate: "2026-08-20",
    paymentDate: "2026-08-20",
    paymentMethod: "BOLETO",
    competence: "08/2026",
    status: "PAID",
    recurrence: true,
  },
];

const INITIAL_RECEIVABLES: ReceivableItem[] = [
  {
    id: "pa-001",
    clientName: "Barbearia Vip Curvelo",
    buyerName: "Geraldo",
    routeId: "R1",
    vendorName: "Alisson",
    amount: 650.0,
    saleDate: "2026-07-28",
    scheduledDate: "2026-08-28",
    status: "PENDING",
    notes: "P.A. 30 dias - 6un Pomada Matte + 4un Óleo Barba",
  },
  {
    id: "pa-002",
    clientName: "Salão Master Studio",
    buyerName: "Claudio",
    routeId: "R1",
    vendorName: "Alisson",
    amount: 1120.0,
    saleDate: "2026-07-25",
    scheduledDate: "2026-08-25",
    receivedDate: "2026-08-26",
    paymentMethod: "PIX",
    status: "RECEIVED",
    notes: "Recebido via Pix na visita de hoje",
  },
  {
    id: "pa-003",
    clientName: "Studio Marcos Rocha",
    buyerName: "Marcos",
    routeId: "R1",
    vendorName: "Alisson",
    amount: 480.0,
    saleDate: "2026-08-10",
    scheduledDate: "2026-09-10",
    status: "NEXT_MONTH",
    notes: "P.A. programado para próximo mês",
  },
  {
    id: "pa-004",
    clientName: "Barbearia Navalha de Ouro",
    buyerName: "Rodrigo",
    routeId: "F2",
    vendorName: "Alexandre",
    amount: 390.0,
    saleDate: "2026-08-05",
    scheduledDate: "2026-08-20",
    status: "OVERDUE",
    notes: "Atrasado - Cobrar na próxima rota F2",
  },
  {
    id: "pa-005",
    clientName: "Barber Club Centro",
    buyerName: "Felipe",
    routeId: "R2",
    vendorName: "Lucas",
    amount: 820.0,
    saleDate: "2026-08-12",
    scheduledDate: "2026-08-27",
    status: "PENDING",
    notes: "Boleto bancário 15 dias",
  },
];

export default function LukeFinanceiroPage() {
  const [activeTab, setActiveTab] = useState<"PAGAR" | "RECEBER" | "FLUXO" | "CATEGORIAS">("PAGAR");
  const [payables, setPayables] = useState<PayableItem[]>(INITIAL_PAYABLES);
  const [receivables, setReceivables] = useState<ReceivableItem[]>(INITIAL_RECEIVABLES);
  const [categories, setCategories] = useState(initialCategories);
  const [loadingFirestore, setLoadingFirestore] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modais
  const [isPayableModalOpen, setIsPayableModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState<ReceivableItem | null>(null);
  const [receivePaymentMethod, setReceivePaymentMethod] = useState<"PIX" | "CASH" | "CARD" | "BOLETO">("PIX");
  const [receiveDate, setReceiveDate] = useState(new Date().toISOString().split("T")[0]);

  // Form Conta a Pagar
  const [payableForm, setPayableForm] = useState<Partial<PayableItem>>({
    description: "",
    categoryId: "CAT-001",
    supplier: "",
    amount: 100,
    dueDate: new Date().toISOString().split("T")[0],
    competence: "08/2026",
    status: "PENDING",
    recurrence: false,
    notes: "",
  });

  const tenantId = "tenant_luke_001";

  // Carregar do Firestore
  useEffect(() => {
    const loadFinData = async () => {
      try {
        setLoadingFirestore(true);
        const [paySnap, recSnap] = await Promise.all([
          getDocs(collection(db, `tenants/${tenantId}/payables`)),
          getDocs(collection(db, `tenants/${tenantId}/receivables`)),
        ]);

        if (!paySnap.empty) {
          const pList: PayableItem[] = [];
          paySnap.forEach((d) => pList.push({ id: d.id, ...d.data() } as PayableItem));
          setPayables(pList);
        }

        if (!recSnap.empty) {
          const rList: ReceivableItem[] = [];
          recSnap.forEach((d) => rList.push({ id: d.id, ...d.data() } as ReceivableItem));
          setReceivables(rList);
        }
      } catch (err: any) {
        console.warn("Firestore finance fallback to initial:", err.message);
      } finally {
        setLoadingFirestore(false);
      }
    };
    loadFinData();
  }, []);

  // Salvar Nova Conta a Pagar
  const handleSavePayable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payableForm.description?.trim()) return;

    const cat = categories.find((c) => c.id === payableForm.categoryId) || categories[0];

    const newPayable: PayableItem = {
      id: `pay-${Date.now()}`,
      description: payableForm.description.trim(),
      categoryId: cat.id,
      categoryName: cat.name,
      supplier: payableForm.supplier?.trim() || "Fornecedor Geral",
      amount: Number(payableForm.amount || 0),
      dueDate: payableForm.dueDate || new Date().toISOString().split("T")[0],
      competence: payableForm.competence || "08/2026",
      status: payableForm.status || "PENDING",
      recurrence: Boolean(payableForm.recurrence),
      notes: payableForm.notes || "",
    };

    setPayables((prev) => [newPayable, ...prev]);

    try {
      await setDoc(doc(db, `tenants/${tenantId}/payables`, newPayable.id), {
        ...newPayable,
        updatedAt: new Date(),
      });
    } catch (e) {}

    setIsPayableModalOpen(false);
  };

  // Baixa / Pagar Conta
  const handlePayPayable = async (item: PayableItem) => {
    const updated: PayableItem = {
      ...item,
      status: "PAID",
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: "PIX",
    };

    setPayables((prev) => prev.map((p) => (p.id === item.id ? updated : p)));

    try {
      await setDoc(
        doc(db, `tenants/${tenantId}/payables`, item.id),
        { status: "PAID", paymentDate: updated.paymentDate, paymentMethod: "PIX", updatedAt: new Date() },
        { merge: true }
      );
    } catch (e) {}
  };

  // Dar Baixa no P.A. (Receber de Barbearia)
  const handleOpenReceiveModal = (rec: ReceivableItem) => {
    setSelectedReceivable(rec);
    setReceivePaymentMethod("PIX");
    setReceiveDate(new Date().toISOString().split("T")[0]);
    setIsReceiveModalOpen(true);
  };

  const handleConfirmReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceivable) return;

    const updated: ReceivableItem = {
      ...selectedReceivable,
      status: "RECEIVED",
      receivedDate: receiveDate,
      paymentMethod: receivePaymentMethod,
    };

    setReceivables((prev) =>
      prev.map((r) => (r.id === selectedReceivable.id ? updated : r))
    );

    // Grava também como Transação de Entrada no Caixa
    try {
      await setDoc(
        doc(db, `tenants/${tenantId}/receivables`, selectedReceivable.id),
        {
          status: "RECEIVED",
          receivedDate: receiveDate,
          paymentMethod: receivePaymentMethod,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      // Injeta entrada no fluxo diário
      const txId = `tx-pa-${Date.now()}`;
      await setDoc(doc(db, `tenants/${tenantId}/transactions`, txId), {
        id: txId,
        clientName: selectedReceivable.clientName,
        vendorName: selectedReceivable.vendorName,
        paymentMethod: receivePaymentMethod,
        amount: selectedReceivable.amount,
        date: `Baixa P.A. (${receiveDate})`,
        status: "CONCILIADO",
        source: "RECEBIMENTO_PA",
        originReceivableId: selectedReceivable.id,
        createdAt: new Date(),
      });
    } catch (e) {}

    setIsReceiveModalOpen(false);
    setSelectedReceivable(null);
    setSyncMessage(`✅ Recebimento de R$ ${updated.amount.toFixed(2)} registrado e lançado no Caixa!`);
    setTimeout(() => setSyncMessage(null), 4000);
  };

  // Totais e Métricas
  const totalPayablePending = payables
    .filter((p) => p.status === "PENDING" || p.status === "OVERDUE")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPayablePaid = payables
    .filter((p) => p.status === "PAID")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalReceivablePending = receivables
    .filter((r) => r.status === "PENDING" || r.status === "OVERDUE")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalReceivableReceived = receivables
    .filter((r) => r.status === "RECEIVED")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netOperationalBalance = totalReceivableReceived - totalPayablePaid;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-extrabold text-brand-offwhite">
              Gestão Financeira & DRE
            </h2>
            <span className="bg-brand-gold/20 text-brand-gold text-xs px-2.5 py-1 rounded-full font-bold border border-brand-gold/30">
              LUKE Brasil
            </span>
          </div>
          <p className="text-brand-offwhite/60 text-sm mt-1">
            Contas a Pagar, Contas a Receber (P.A.s de Barbearias), Fluxo de Caixa e DRE de Distribuição.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {activeTab === "PAGAR" && (
            <button
              onClick={() => setIsPayableModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-brand-gold text-brand-black px-4 py-2.5 rounded-xl font-extrabold hover:bg-yellow-500 transition shadow-lg text-sm"
            >
              <Plus size={18} />
              <span>Nova Conta a Pagar</span>
            </button>
          )}
        </div>
      </div>

      {/* Sync Message Alert */}
      {syncMessage && (
        <div className="p-4 rounded-xl bg-brand-graphite border border-brand-gold/50 text-sm text-brand-offwhite flex items-center space-x-3 shadow-lg">
          <CheckCircle2 className="text-brand-gold shrink-0" size={20} />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Resumo Financeiro Geral */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">P.A.s a Receber (Prazo)</span>
            <ArrowDownLeft size={18} className="text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-400 mt-2">
            R$ {totalReceivablePending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-brand-offwhite/50">Vendas a prazo em rotas</span>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Contas a Pagar (Aberto)</span>
            <ArrowUpRight size={18} className="text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">
            R$ {totalPayablePending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-brand-offwhite/50">Fornecedores, salários e rotas</span>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Total Liquidado (Entradas)</span>
            <DollarSign size={18} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">
            R$ {totalReceivableReceived.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-emerald-400/80 font-medium">Entrado no Caixa este mês</span>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Saldo Operacional Líquido</span>
            <Wallet size={18} className="text-brand-gold" />
          </div>
          <p className={`text-2xl font-black mt-2 ${netOperationalBalance >= 0 ? "text-brand-gold" : "text-rose-400"}`}>
            R$ {netOperationalBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-brand-offwhite/50">Recebido (-) Despesas Pagas</span>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <div className="flex border-b border-brand-blue/30 space-x-2">
        <button
          onClick={() => setActiveTab("PAGAR")}
          className={`pb-3 px-4 font-bold text-sm flex items-center space-x-2 border-b-2 transition ${
            activeTab === "PAGAR"
              ? "border-brand-gold text-brand-gold"
              : "border-transparent text-brand-offwhite/60 hover:text-brand-offwhite"
          }`}
        >
          <ArrowUpRight size={16} />
          <span>Contas a Pagar ({payables.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("RECEBER")}
          className={`pb-3 px-4 font-bold text-sm flex items-center space-x-2 border-b-2 transition ${
            activeTab === "RECEBER"
              ? "border-brand-gold text-brand-gold"
              : "border-transparent text-brand-offwhite/60 hover:text-brand-offwhite"
          }`}
        >
          <ArrowDownLeft size={16} />
          <span>Contas a Receber / P.A. ({receivables.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("FLUXO")}
          className={`pb-3 px-4 font-bold text-sm flex items-center space-x-2 border-b-2 transition ${
            activeTab === "FLUXO"
              ? "border-brand-gold text-brand-gold"
              : "border-transparent text-brand-offwhite/60 hover:text-brand-offwhite"
          }`}
        >
          <FileSpreadsheet size={16} />
          <span>DRE & Fluxo Operacional</span>
        </button>

        <button
          onClick={() => setActiveTab("CATEGORIAS")}
          className={`pb-3 px-4 font-bold text-sm flex items-center space-x-2 border-b-2 transition ${
            activeTab === "CATEGORIAS"
              ? "border-brand-gold text-brand-gold"
              : "border-transparent text-brand-offwhite/60 hover:text-brand-offwhite"
          }`}
        >
          <Tag size={16} />
          <span>Categorias ({categories.length})</span>
        </button>
      </div>

      {/* ABA 1: CONTAS A PAGAR */}
      {activeTab === "PAGAR" && (
        <div className="bg-brand-graphite rounded-2xl border border-brand-blue/30 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-brand-blue/30 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-brand-black/50">
            <div className="relative flex-1 max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-brand-offwhite/40" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 bg-brand-black border border-brand-blue/50 rounded-lg text-sm text-brand-offwhite placeholder-brand-offwhite/30 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                placeholder="Buscar despesa ou fornecedor..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-brand-black border border-brand-blue/50 text-brand-offwhite text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-gold"
              >
                <option value="ALL">Todos os Status</option>
                <option value="PENDING">Apenas Pendentes</option>
                <option value="PAID">Apenas Pagas</option>
                <option value="OVERDUE">Apenas Atrasadas</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-blue/10 border-b border-brand-blue/30 text-brand-offwhite/70 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Descrição da Despesa</th>
                  <th className="p-4 font-medium">Categoria</th>
                  <th className="p-4 font-medium">Fornecedor / Favorecido</th>
                  <th className="p-4 font-medium">Vencimento</th>
                  <th className="p-4 font-medium">Valor (R$)</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-blue/10 text-sm">
                {payables
                  .filter((p) => {
                    const matchSearch =
                      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      p.supplier.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
                    return matchSearch && matchStatus;
                  })
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-brand-blue/5 transition group">
                      <td className="p-4 font-semibold text-brand-offwhite">
                        <p>{item.description}</p>
                        {item.notes && <p className="text-xs text-brand-offwhite/40 mt-0.5">{item.notes}</p>}
                      </td>

                      <td className="p-4">
                        <span className="text-xs px-2.5 py-1 bg-brand-black/60 text-brand-offwhite/80 rounded-md border border-brand-blue/20">
                          {item.categoryName}
                        </span>
                      </td>

                      <td className="p-4 text-xs text-brand-offwhite/70">
                        {item.supplier}
                      </td>

                      <td className="p-4 text-xs font-mono text-brand-offwhite/80">
                        <div className="flex items-center space-x-1.5">
                          <Calendar size={13} className="text-brand-gold/70 shrink-0" />
                          <span>{item.dueDate}</span>
                        </div>
                        {item.paymentDate && (
                          <span className="text-[10px] text-green-400 block mt-0.5">
                            Pago em: {item.paymentDate} ({item.paymentMethod})
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-mono font-bold text-amber-400">
                        R$ {item.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            item.status === "PAID"
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : item.status === "OVERDUE"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {item.status === "PAID" ? "Pago" : item.status === "OVERDUE" ? "Atrasado" : "Pendente"}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        {item.status !== "PAID" ? (
                          <button
                            onClick={() => handlePayPayable(item)}
                            className="px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-bold hover:bg-green-500/30 transition flex items-center space-x-1 ml-auto"
                          >
                            <Check size={14} />
                            <span>Dar Baixa (Pagar)</span>
                          </button>
                        ) : (
                          <span className="text-xs text-brand-offwhite/40 flex items-center justify-end space-x-1">
                            <CheckCircle2 size={14} className="text-green-400" />
                            <span>Liquidado</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 2: CONTAS A RECEBER / P.A. DE SALÕES */}
      {activeTab === "RECEBER" && (
        <div className="bg-brand-graphite rounded-2xl border border-brand-blue/30 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-brand-blue/30 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-brand-black/50">
            <div className="relative flex-1 max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-brand-offwhite/40" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 bg-brand-black border border-brand-blue/50 rounded-lg text-sm text-brand-offwhite placeholder-brand-offwhite/30 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                placeholder="Buscar salão, comprador ou vendedor..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-brand-black border border-brand-blue/50 text-brand-offwhite text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-gold"
              >
                <option value="ALL">Todos os P.A.s</option>
                <option value="PENDING">Pendentes</option>
                <option value="RECEIVED">Já Recebidos (Baixados)</option>
                <option value="NEXT_MONTH">Próximo Mês</option>
                <option value="OVERDUE">Atrasados</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-blue/10 border-b border-brand-blue/30 text-brand-offwhite/70 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Barbearia / Salão</th>
                  <th className="p-4 font-medium">Rota</th>
                  <th className="p-4 font-medium">Vendedor</th>
                  <th className="p-4 font-medium">Data Agendada (P.A.)</th>
                  <th className="p-4 font-medium">Valor (R$)</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Ação de Baixa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-blue/10 text-sm">
                {receivables
                  .filter((r) => {
                    const matchSearch =
                      r.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      r.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      r.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
                    return matchSearch && matchStatus;
                  })
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-brand-blue/5 transition group">
                      <td className="p-4 font-semibold text-brand-offwhite">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-lg bg-brand-blue/30 flex items-center justify-center text-brand-gold shrink-0">
                            <Store size={15} />
                          </div>
                          <div>
                            <p>{item.clientName}</p>
                            <p className="text-xs text-brand-offwhite/40">Comprador: {item.buyerName}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-brand-gold/15 text-brand-gold font-bold text-xs rounded border border-brand-gold/30">
                          {item.routeId}
                        </span>
                      </td>

                      <td className="p-4 text-xs text-brand-offwhite/80">
                        {item.vendorName}
                      </td>

                      <td className="p-4 text-xs font-mono text-brand-offwhite/80">
                        <div className="flex items-center space-x-1.5">
                          <Clock size={13} className="text-purple-400 shrink-0" />
                          <span>{item.scheduledDate}</span>
                        </div>
                        {item.receivedDate && (
                          <span className="text-[10px] text-green-400 block mt-0.5">
                            Recebido em {item.receivedDate} ({item.paymentMethod})
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-mono font-bold text-purple-400">
                        R$ {item.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            item.status === "RECEIVED"
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : item.status === "OVERDUE"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : item.status === "NEXT_MONTH"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {item.status === "RECEIVED"
                            ? "Recebido"
                            : item.status === "OVERDUE"
                            ? "Atrasado"
                            : item.status === "NEXT_MONTH"
                            ? "Próximo Mês"
                            : "Pendente"}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        {item.status !== "RECEIVED" ? (
                          <button
                            onClick={() => handleOpenReceiveModal(item)}
                            className="px-3 py-1.5 bg-brand-gold text-brand-black rounded-lg text-xs font-extrabold hover:bg-yellow-500 transition shadow-md flex items-center space-x-1 ml-auto"
                          >
                            <DollarSign size={14} />
                            <span>Receber P.A. (Baixar)</span>
                          </button>
                        ) : (
                          <span className="text-xs text-brand-offwhite/40 flex items-center justify-end space-x-1">
                            <CheckCircle2 size={14} className="text-green-400" />
                            <span>Entrado no Caixa</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 3: DRE & FLUXO OPERACIONAL */}
      {activeTab === "FLUXO" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-brand-graphite p-6 rounded-2xl border border-brand-blue/30 shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-brand-offwhite flex items-center space-x-2">
              <FileSpreadsheet className="text-brand-gold" size={20} />
              <span>DRE Operacional Simplificado (Mês Atual)</span>
            </h3>

            <div className="space-y-3 font-mono text-sm divide-y divide-brand-blue/20">
              <div className="flex justify-between items-center py-2 text-green-400 font-bold">
                <span>(+) Faturamento Bruto de Rotas & P.A.s</span>
                <span>R$ {(totalReceivableReceived + 18500).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between items-center py-2 text-brand-offwhite/70 pl-4">
                <span>• Vendas Pronta-Entrega (À Vista / Pix)</span>
                <span>R$ 18.500,00</span>
              </div>

              <div className="flex justify-between items-center py-2 text-brand-offwhite/70 pl-4">
                <span>• Recebimentos de P.A. (Prazo Liquidado)</span>
                <span>R$ {totalReceivableReceived.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between items-center py-2 text-amber-400 font-bold">
                <span>(-) Custo Operacional & Despesas Pagas</span>
                <span>- R$ {totalPayablePaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between items-center py-2 text-brand-offwhite/70 pl-4">
                <span>• Fornecedores & Fábrica</span>
                <span>- R$ 0,00 (Pendente)</span>
              </div>

              <div className="flex justify-between items-center py-2 text-brand-offwhite/70 pl-4">
                <span>• Combustível, Alimentação e Frotas</span>
                <span>- R$ 545,00</span>
              </div>

              <div className="flex justify-between items-center py-2 text-brand-offwhite/70 pl-4">
                <span>• Aluguel, Galpão e Fixos</span>
                <span>- R$ 3.200,00</span>
              </div>

              <div className="flex justify-between items-center py-3 text-brand-gold font-extrabold text-base bg-brand-black/40 px-3 rounded-lg">
                <span>(=) RESULTADO OPERACIONAL LÍQUIDO</span>
                <span>
                  R$ {(18500 + totalReceivableReceived - totalPayablePaid).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-brand-graphite p-6 rounded-2xl border border-brand-blue/30 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-brand-offwhite">Ciclo Operacional LUKE</h3>
            <p className="text-xs text-brand-offwhite/60">
              O fechamento comercial da distribuidora funciona no ciclo semanal de:
            </p>
            <div className="p-4 bg-brand-black/60 rounded-xl border border-brand-gold/30">
              <p className="text-xs font-bold text-brand-gold uppercase">Terça-feira ➔ Segunda-feira</p>
              <p className="text-xs text-brand-offwhite/70 mt-1">
                Todas as cargas e P.A.s são liquidados semanalmente na conferência de retorno dos veículos.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs text-brand-offwhite/80">
                <span>Alisson (Montana):</span>
                <span className="font-bold text-brand-gold">R$ 14.820,00</span>
              </div>
              <div className="flex justify-between text-xs text-brand-offwhite/80">
                <span>Alexandre (Clio):</span>
                <span className="font-bold text-brand-gold">R$ 11.450,00</span>
              </div>
              <div className="flex justify-between text-xs text-brand-offwhite/80">
                <span>Lucas (Strada):</span>
                <span className="font-bold text-brand-gold">R$ 8.920,00</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: CATEGORIAS */}
      {activeTab === "CATEGORIAS" && (
        <div className="bg-brand-graphite rounded-2xl border border-brand-blue/30 shadow-xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-brand-offwhite">Categorias do Plano de Contas LUKE Brasil</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((c) => (
              <div
                key={c.id}
                className="p-3 bg-brand-black/50 border border-brand-blue/30 rounded-xl flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-brand-offwhite">{c.name}</p>
                  <span className="text-[10px] text-brand-offwhite/40 font-mono">{c.id}</span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    c.type === "INCOME"
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {c.type === "INCOME" ? "Receita" : "Despesa"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Nova Conta a Pagar */}
      {isPayableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-sm">
          <div className="bg-brand-graphite w-full max-w-lg rounded-2xl border border-brand-blue/40 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsPayableModalOpen(false)}
              className="absolute top-4 right-4 text-brand-offwhite/50 hover:text-brand-offwhite p-1 rounded-lg hover:bg-brand-blue/20 transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <ArrowUpRight size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-offwhite">Lançar Conta a Pagar</h3>
                <p className="text-xs text-brand-offwhite/60">
                  Despesas operacionais, fornecedores, alimentação de rota e salários.
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePayable} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                  Descrição da Despesa
                </label>
                <input
                  type="text"
                  required
                  value={payableForm.description || ""}
                  onChange={(e) => setPayableForm({ ...payableForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  placeholder="Ex: Compra 200un Pomada Efeito Teia"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Categoria Financeira
                  </label>
                  <select
                    value={payableForm.categoryId || "CAT-001"}
                    onChange={(e) => setPayableForm({ ...payableForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Fornecedor / Favorecido
                  </label>
                  <input
                    type="text"
                    value={payableForm.supplier || ""}
                    onChange={(e) => setPayableForm({ ...payableForm, supplier: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                    placeholder="Ex: Laboratório Hair Tech"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={payableForm.amount || ""}
                    onChange={(e) => setPayableForm({ ...payableForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-amber-400 font-bold focus:outline-none focus:border-brand-gold"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Vencimento
                  </label>
                  <input
                    type="date"
                    required
                    value={payableForm.dueDate || ""}
                    onChange={(e) => setPayableForm({ ...payableForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Competência
                  </label>
                  <input
                    type="text"
                    value={payableForm.competence || "08/2026"}
                    onChange={(e) => setPayableForm({ ...payableForm, competence: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold font-mono"
                    placeholder="MM/AAAA"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="recurrence"
                  checked={Boolean(payableForm.recurrence)}
                  onChange={(e) => setPayableForm({ ...payableForm, recurrence: e.target.checked })}
                  className="rounded bg-brand-black border-brand-blue/50 text-brand-gold focus:ring-brand-gold"
                />
                <label htmlFor="recurrence" className="text-xs text-brand-offwhite/80 cursor-pointer">
                  Conta fixa / recorrente mensal (Ex: Aluguel, Internet, Contabilidade)
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                  Observações
                </label>
                <textarea
                  rows={2}
                  value={payableForm.notes || ""}
                  onChange={(e) => setPayableForm({ ...payableForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  placeholder="Número de nota fiscal, detalhes do pedido..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-brand-blue/30">
                <button
                  type="button"
                  onClick={() => setIsPayableModalOpen(false)}
                  className="px-4 py-2 text-sm text-brand-offwhite/70 hover:text-brand-offwhite transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-gold text-brand-black rounded-lg font-bold hover:bg-yellow-500 transition shadow-lg text-sm"
                >
                  Lançar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Baixa de P.A. (Receber de Barbearia) */}
      {isReceiveModalOpen && selectedReceivable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-sm">
          <div className="bg-brand-graphite w-full max-w-md rounded-2xl border border-brand-gold/40 shadow-2xl p-6 relative">
            <button
              onClick={() => setIsReceiveModalOpen(false)}
              className="absolute top-4 right-4 text-brand-offwhite/50 hover:text-brand-offwhite p-1 rounded-lg hover:bg-brand-blue/20 transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center border border-green-500/30">
                <DollarSign size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-offwhite">Dar Baixa no P.A.</h3>
                <p className="text-xs text-brand-offwhite/60">
                  Registrar recebimento de venda a prazo e alimentar o Caixa do dia.
                </p>
              </div>
            </div>

            <div className="p-4 bg-brand-black/60 rounded-xl border border-brand-blue/30 mb-4 space-y-1">
              <p className="text-xs text-brand-offwhite/60">Salão / Barbearia:</p>
              <p className="text-base font-bold text-brand-offwhite">{selectedReceivable.clientName}</p>
              <p className="text-xs text-brand-offwhite/50">
                Vendedor: {selectedReceivable.vendorName} • Rota: {selectedReceivable.routeId}
              </p>
              <p className="text-lg font-mono font-black text-green-400 pt-1">
                R$ {selectedReceivable.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <form onSubmit={handleConfirmReceive} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                  Data Efetiva do Recebimento
                </label>
                <input
                  type="date"
                  required
                  value={receiveDate}
                  onChange={(e) => setReceiveDate(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite font-mono focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                  Forma de Pagamento Recebida
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReceivePaymentMethod("PIX")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                      receivePaymentMethod === "PIX"
                        ? "bg-teal-500/20 text-teal-300 border-teal-400"
                        : "bg-brand-black text-brand-offwhite/60 border-brand-blue/30"
                    }`}
                  >
                    Pix
                  </button>

                  <button
                    type="button"
                    onClick={() => setReceivePaymentMethod("CASH")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                      receivePaymentMethod === "CASH"
                        ? "bg-brand-gold/20 text-brand-gold border-brand-gold"
                        : "bg-brand-black text-brand-offwhite/60 border-brand-blue/30"
                    }`}
                  >
                    Dinheiro
                  </button>

                  <button
                    type="button"
                    onClick={() => setReceivePaymentMethod("CARD")}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                      receivePaymentMethod === "CARD"
                        ? "bg-purple-500/20 text-purple-300 border-purple-400"
                        : "bg-brand-black text-brand-offwhite/60 border-brand-blue/30"
                    }`}
                  >
                    Cartão
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-brand-blue/30">
                <button
                  type="button"
                  onClick={() => setIsReceiveModalOpen(false)}
                  className="px-4 py-2 text-sm text-brand-offwhite/70 hover:text-brand-offwhite transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-500 text-black font-extrabold rounded-lg hover:bg-green-400 transition shadow-lg text-sm"
                >
                  Confirmar Baixa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
