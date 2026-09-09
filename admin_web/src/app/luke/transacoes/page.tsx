"use client";

import { useState, useEffect, useMemo } from "react";
import { DollarSign, Search, ArrowDownLeft, ArrowUpRight, QrCode, Banknote, FileText, Eye, EyeOff, RotateCcw } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { usePrivacy } from "@/lib/privacyContext";
import VendorBadge from "@/components/VendorBadge";
import ColumnOrganizer, { ColumnDefinition } from "@/components/ColumnOrganizer";

const TRANSACTION_COLUMNS: ColumnDefinition[] = [
  { key: "client", label: "Salão / Cliente", defaultVisible: true },
  { key: "vendor", label: "Vendedor", defaultVisible: true },
  { key: "method", label: "Forma de Pagamento", defaultVisible: true },
  { key: "amount", label: "Valor", defaultVisible: true },
  { key: "date", label: "Data & Horário", defaultVisible: true },
  { key: "status", label: "Status", defaultVisible: true },
];

export interface TransactionItem {
  id: string;
  clientName: string;
  vendorName: string;
  paymentMethod: "PIX" | "CASH" | "TICKET" | "DEVOLUÇÃO" | string;
  amount: number;
  date: string;
  status: "CONCILIADO" | "A_RECEBER" | "PROCESSADO" | string;
}

const INITIAL_TRANSACTIONS: TransactionItem[] = [
  {
    id: "tx-test-001",
    clientName: "Barbearia Dom Lucas Barber Club & Spa (TESTE VIP)",
    vendorName: "Alisson",
    paymentMethod: "PIX",
    amount: 1850.0,
    date: "26/08, 14:30",
    status: "CONCILIADO",
  },
  {
    id: "tx-test-002",
    clientName: "Barbearia Dom Lucas Barber Club & Spa (TESTE VIP)",
    vendorName: "Alisson",
    paymentMethod: "TICKET",
    amount: 2450.0,
    date: "20/08, 11:15",
    status: "A_RECEBER",
  },
  {
    id: "tx-test-003",
    clientName: "Studio Beleza Real & Barbearia Vip (TESTE SHOWROOM)",
    vendorName: "Alexandre",
    paymentMethod: "CASH",
    amount: 1200.0,
    date: "24/08, 16:15",
    status: "CONCILIADO",
  },
  {
    id: "tx-test-004",
    clientName: "Studio Beleza Real & Barbearia Vip (TESTE SHOWROOM)",
    vendorName: "Alexandre",
    paymentMethod: "DEVOLUÇÃO",
    amount: -140.0,
    date: "24/08, 16:30",
    status: "PROCESSADO",
  },
  {
    id: "tx-test-005",
    clientName: "Studio Beleza Real & Barbearia Vip (TESTE SHOWROOM)",
    vendorName: "Alexandre",
    paymentMethod: "TICKET",
    amount: 1680.0,
    date: "14/08, 10:45",
    status: "A_RECEBER",
  },
  {
    id: "tx-001",
    clientName: "Barbearia Vip Style",
    vendorName: "Alisson",
    paymentMethod: "PIX",
    amount: 450.0,
    date: "Hoje, 14:32",
    status: "CONCILIADO",
  },
  {
    id: "tx-002",
    clientName: "Studio Hair & Barba",
    vendorName: "Alisson",
    paymentMethod: "CASH",
    amount: 1280.5,
    date: "Hoje, 13:15",
    status: "CONCILIADO",
  },
  {
    id: "tx-003",
    clientName: "Barber Shop Elite",
    vendorName: "Alexandre",
    paymentMethod: "PIX",
    amount: 890.0,
    date: "Hoje, 11:40",
    status: "CONCILIADO",
  },
  {
    id: "tx-004",
    clientName: "Salão Requinte & Arte",
    vendorName: "Alexandre",
    paymentMethod: "DEVOLUÇÃO",
    amount: -120.0,
    date: "Hoje, 10:22",
    status: "PROCESSADO",
  },
  {
    id: "tx-005",
    clientName: "Barbearia Dom Pedro",
    vendorName: "Lucas",
    paymentMethod: "TICKET",
    amount: 620.0,
    date: "Hoje, 09:10",
    status: "A_RECEBER",
  },
];

export default function LukeTransacoesPage() {
  const { hideValues, togglePrivacy, formatValue } = usePrivacy();

  const [transactions, setTransactions] = useState<TransactionItem[]>(INITIAL_TRANSACTIONS);
  const [filterType, setFilterType] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingFirestore, setLoadingFirestore] = useState(false);

  const tenantId = "tenant_luke_001";

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoadingFirestore(true);
        const snap = await getDocs(collection(db, `tenants/${tenantId}/transactions`));
        if (!snap.empty) {
          const loaded: TransactionItem[] = [];
          snap.forEach((docSnap) => {
            const d = docSnap.data();
            loaded.push({
              id: docSnap.id,
              clientName: d.clientName || d.clientId || "Salão / Cliente",
              vendorName: d.vendorName || "Alisson",
              paymentMethod: d.paymentMethod || "PIX",
              amount: Number(d.amount || 0),
              date: d.timestamp ? new Date(d.timestamp?.toDate ? d.timestamp.toDate() : d.timestamp).toLocaleDateString("pt-BR") : "Recente",
              status: d.status || "CONCILIADO",
            });
          });
          const testItems = INITIAL_TRANSACTIONS.filter((t) => t.id.startsWith("tx-test-"));
          setTransactions([...testItems, ...loaded]);
        }
      } catch (err: any) {
        console.warn("Firestore transactions fallback:", err?.message);
      } finally {
        setLoadingFirestore(false);
      }
    };

    fetchTransactions();
  }, []);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesType = filterType === "ALL" || t.paymentMethod === filterType;
      const matchesSearch =
        t.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [transactions, filterType, searchTerm]);

  // Cálculos dinâmicos para os KPIs superiores
  const totalAmount = useMemo(() => transactions.reduce((acc, t) => acc + t.amount, 0), [transactions]);
  const pixTotal = useMemo(() => transactions.filter((t) => t.paymentMethod === "PIX").reduce((acc, t) => acc + t.amount, 0), [transactions]);
  const cashTotal = useMemo(() => transactions.filter((t) => t.paymentMethod === "CASH").reduce((acc, t) => acc + t.amount, 0), [transactions]);
  const ticketTotal = useMemo(() => transactions.filter((t) => t.paymentMethod === "TICKET").reduce((acc, t) => acc + t.amount, 0), [transactions]);

  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("kliro_cols_transacoes");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return TRANSACTION_COLUMNS.map((c) => c.key);
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-brand-offwhite">Transações</h2>
          <p className="text-brand-offwhite/60 text-sm mt-1">
            Fluxo financeiro de vendas e pagamentos da LUKE Brasil.
          </p>
        </div>

        <button
          onClick={togglePrivacy}
          className={`flex items-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border transition ${
            hideValues
              ? "bg-brand-gold/20 text-brand-gold border-brand-gold/40"
              : "bg-brand-graphite text-brand-offwhite/70 border-brand-blue/30 hover:text-brand-offwhite"
          }`}
          title={hideValues ? "Mostrar Valores" : "Ocultar Valores"}
        >
          {hideValues ? <EyeOff size={16} /> : <Eye size={16} />}
          <span>{hideValues ? "Oculto" : "Visível"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <p className="text-xs font-semibold uppercase text-brand-offwhite/60">Total Movimentado</p>
          <h3 className="text-2xl font-black text-brand-offwhite mt-1">
            {formatValue(totalAmount)}
          </h3>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <p className="text-xs font-semibold uppercase text-brand-offwhite/60">Pix</p>
          <h3 className="text-2xl font-black text-teal-400 mt-1">
            {formatValue(pixTotal)}
          </h3>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <p className="text-xs font-semibold uppercase text-brand-offwhite/60">Dinheiro</p>
          <h3 className="text-2xl font-black text-brand-gold mt-1">
            {formatValue(cashTotal)}
          </h3>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <p className="text-xs font-semibold uppercase text-brand-offwhite/60">Prazo</p>
          <h3 className="text-2xl font-black text-purple-400 mt-1">
            {formatValue(ticketTotal)}
          </h3>
        </div>
      </div>

      <div className="bg-brand-graphite rounded-2xl border border-brand-blue/30 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-brand-blue/30 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-brand-black/50">
          <div className="relative w-full max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-brand-offwhite/40" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 bg-brand-black border border-brand-blue/50 rounded-lg text-sm text-brand-offwhite placeholder-brand-offwhite/30 focus:outline-none focus:ring-1 focus:ring-brand-gold"
              placeholder="Buscar por cliente ou vendedor..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-brand-black border border-brand-blue/50 text-brand-offwhite text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-gold"
            >
              <option value="ALL">Todas as Formas</option>
              <option value="PIX">Pix</option>
              <option value="CASH">Dinheiro</option>
              <option value="TICKET">Prazo</option>
              <option value="DEVOLUÇÃO">Devolução</option>
            </select>

            {/* Organizador de Colunas (Requisito 15) */}
            <ColumnOrganizer
              storageKey="kliro_cols_transacoes"
              columns={TRANSACTION_COLUMNS}
              visibleColumns={visibleColumns}
              onChange={setVisibleColumns}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-blue/10 border-b border-brand-blue/30 text-brand-offwhite/70 text-xs uppercase tracking-wider">
                {visibleColumns.includes("client") && <th className="p-4 font-medium">Salão / Cliente</th>}
                {visibleColumns.includes("vendor") && <th className="p-4 font-medium">Vendedor</th>}
                {visibleColumns.includes("method") && <th className="p-4 font-medium">Forma de Pagamento</th>}
                {visibleColumns.includes("amount") && <th className="p-4 font-medium">Valor</th>}
                {visibleColumns.includes("date") && <th className="p-4 font-medium">Data & Horário</th>}
                {visibleColumns.includes("status") && <th className="p-4 font-medium">Status</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-blue/10 text-sm">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-brand-blue/5 transition">
                  {visibleColumns.includes("client") && (
                    <td className="p-4 font-bold text-brand-offwhite">{t.clientName}</td>
                  )}
                  {visibleColumns.includes("vendor") && (
                    <td className="p-4">
                      <VendorBadge vendorName={t.vendorName} size="xs" variant="chip" />
                    </td>
                  )}
                  {visibleColumns.includes("method") && (
                    <td className="p-4">
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-blue/20 text-brand-offwhite border border-brand-blue/40">
                        {t.paymentMethod === "PIX" && <QrCode size={12} className="text-teal-400" />}
                        {t.paymentMethod === "CASH" && <Banknote size={12} className="text-brand-gold" />}
                        {t.paymentMethod === "TICKET" && <FileText size={12} className="text-purple-400" />}
                        <span>{t.paymentMethod}</span>
                      </span>
                    </td>
                  )}
                  {visibleColumns.includes("amount") && (
                    <td className="p-4 font-mono font-bold">
                      <span className={t.amount > 0 ? "text-emerald-400" : "text-rose-400"}>
                        {formatValue(t.amount)}
                      </span>
                    </td>
                  )}
                  {visibleColumns.includes("date") && (
                    <td className="p-4 text-brand-offwhite/50 text-xs font-mono">{t.date}</td>
                  )}
                  {visibleColumns.includes("status") && (
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          t.status === "CONCILIADO"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : t.status === "A_RECEBER"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        }`}
                      >
                        {t.status === "CONCILIADO" ? "Conciliado" : t.status === "A_RECEBER" ? "A Prazo" : "Processado"}
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
