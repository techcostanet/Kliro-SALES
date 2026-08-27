"use client";

import { useState } from "react";
import { DollarSign, Search, ArrowDownLeft, ArrowUpRight, QrCode, Banknote, FileText, Eye, EyeOff } from "lucide-react";
import { usePrivacy } from "@/lib/privacyContext";
import VendorBadge from "@/components/VendorBadge";

export default function LukeTransacoesPage() {
  const { hideValues, togglePrivacy, formatValue } = usePrivacy();

  const [transactions, setTransactions] = useState([
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
  ]);

  const [filterType, setFilterType] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = transactions.filter((t) => {
    const matchesType = filterType === "ALL" || t.paymentMethod === filterType;
    const matchesSearch =
      t.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
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
          <p className="text-xs font-semibold uppercase text-brand-offwhite/60">Total Hoje</p>
          <h3 className="text-2xl font-black text-brand-offwhite mt-1">
            {formatValue(3120.5)}
          </h3>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <p className="text-xs font-semibold uppercase text-brand-offwhite/60">Pix</p>
          <h3 className="text-2xl font-black text-teal-400 mt-1">
            {formatValue(1340.0)}
          </h3>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <p className="text-xs font-semibold uppercase text-brand-offwhite/60">Dinheiro</p>
          <h3 className="text-2xl font-black text-brand-gold mt-1">
            {formatValue(1280.5)}
          </h3>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <p className="text-xs font-semibold uppercase text-brand-offwhite/60">Prazo</p>
          <h3 className="text-2xl font-black text-purple-400 mt-1">
            {formatValue(620.0)}
          </h3>
        </div>
      </div>

      <div className="bg-brand-graphite rounded-2xl border border-brand-blue/30 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-brand-blue/30 flex justify-between items-center bg-brand-black/50">
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

          <div className="flex space-x-2">
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
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-blue/10 border-b border-brand-blue/30 text-brand-offwhite/70 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Salão</th>
                <th className="p-4 font-medium">Vendedor</th>
                <th className="p-4 font-medium">Forma</th>
                <th className="p-4 font-medium">Valor</th>
                <th className="p-4 font-medium">Data</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-blue/10 text-sm">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-brand-blue/5 transition">
                  <td className="p-4 font-bold text-brand-offwhite">{t.clientName}</td>
                  <td className="p-4">
                    <VendorBadge vendorName={t.vendorName} size="xs" variant="chip" />
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-blue/20 text-brand-offwhite border border-brand-blue/40">
                      {t.paymentMethod === "PIX" && <QrCode size={12} className="text-teal-400" />}
                      {t.paymentMethod === "CASH" && <Banknote size={12} className="text-brand-gold" />}
                      {t.paymentMethod === "TICKET" && <FileText size={12} className="text-purple-400" />}
                      <span>{t.paymentMethod}</span>
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold">
                    <span className={t.amount > 0 ? "text-emerald-400" : "text-rose-400"}>
                      {formatValue(t.amount)}
                    </span>
                  </td>
                  <td className="p-4 text-brand-offwhite/50 text-xs">{t.date}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
