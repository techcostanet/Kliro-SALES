"use client";

import { useState } from "react";
import { DollarSign, Search, ArrowDownLeft, ArrowUpRight, QrCode, Banknote, FileText } from "lucide-react";

export default function TransacoesPage() {
  const [transactions, setTransactions] = useState([
    {
      id: "tx-001",
      clientName: "Padaria & Confeitaria Estrela",
      vendorName: "Carlos Eduardo",
      type: "SALE",
      paymentMethod: "PIX",
      amount: 450.0,
      date: "Hoje, 14:32",
      status: "CONCILIADO",
    },
    {
      id: "tx-002",
      clientName: "Supermercado Boa Vista",
      vendorName: "Carlos Eduardo",
      type: "SALE",
      paymentMethod: "CASH",
      amount: 1280.5,
      date: "Hoje, 13:15",
      status: "CONCILIADO",
    },
    {
      id: "tx-003",
      clientName: "Mercearia Central",
      vendorName: "Marcos Souza",
      type: "PAYMENT",
      paymentMethod: "PIX",
      amount: 890.0,
      date: "Hoje, 11:40",
      status: "CONCILIADO",
    },
    {
      id: "tx-004",
      clientName: "Panificadora Pão Dourado",
      vendorName: "Marcos Souza",
      type: "RETURN",
      paymentMethod: "DEVOLUÇÃO",
      amount: -120.0,
      date: "Hoje, 10:22",
      status: "PROCESSADO",
    },
    {
      id: "tx-005",
      clientName: "Armazém do Bairro",
      vendorName: "Carlos Eduardo",
      type: "SALE",
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
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-brand-offwhite">Transações & Conciliação</h2>
          <p className="text-brand-offwhite/60 mt-1">
            Fluxo financeiro em tempo real de vendas, recebimentos e conciliações de rotas.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-brand-graphite p-5 rounded-xl border border-brand-blue/30 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-brand-offwhite/60">Total Arrecadado Hoje</span>
            <div className="p-2 bg-brand-gold/10 text-brand-gold rounded-lg">
              <DollarSign size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-brand-offwhite">R$ 3.120,50</h3>
          <p className="text-xs text-green-400 mt-1 font-medium">+18% vs média da semana</p>
        </div>

        <div className="bg-brand-graphite p-5 rounded-xl border border-brand-blue/30 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-brand-offwhite/60">Recebido via Pix</span>
            <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg">
              <QrCode size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-teal-400">R$ 1.340,00</h3>
          <p className="text-xs text-brand-offwhite/50 mt-1">2 transações liquidadas</p>
        </div>

        <div className="bg-brand-graphite p-5 rounded-xl border border-brand-blue/30 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-brand-offwhite/60">Dinheiro em Espécie</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Banknote size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-brand-offwhite">R$ 1.280,50</h3>
          <p className="text-xs text-brand-offwhite/50 mt-1">Para conferência no fechamento</p>
        </div>

        <div className="bg-brand-graphite p-5 rounded-xl border border-brand-blue/30 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-brand-offwhite/60">A Prazo / Boletos</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <FileText size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-purple-400">R$ 620,00</h3>
          <p className="text-xs text-brand-offwhite/50 mt-1">Vencimento em 7 dias</p>
        </div>
      </div>

      {/* Tabela de Transações */}
      <div className="bg-brand-graphite rounded-xl border border-brand-blue/30 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-brand-blue/30 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-brand-black/50">
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
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterType === "ALL"
                  ? "bg-brand-gold text-brand-black"
                  : "bg-brand-black text-brand-offwhite/70 hover:bg-brand-blue/20"
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType("PIX")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterType === "PIX"
                  ? "bg-teal-500 text-brand-black"
                  : "bg-brand-black text-brand-offwhite/70 hover:bg-brand-blue/20"
              }`}
            >
              Pix
            </button>
            <button
              onClick={() => setFilterType("CASH")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterType === "CASH"
                  ? "bg-amber-500 text-brand-black"
                  : "bg-brand-black text-brand-offwhite/70 hover:bg-brand-blue/20"
              }`}
            >
              Dinheiro
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-blue/10 border-b border-brand-blue/30 text-brand-offwhite/70 text-sm">
                <th className="p-4 font-medium">Cliente</th>
                <th className="p-4 font-medium">Vendedor</th>
                <th className="p-4 font-medium">Método</th>
                <th className="p-4 font-medium">Data / Hora</th>
                <th className="p-4 font-medium">Valor</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-blue/10">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-brand-blue/5 transition">
                  <td className="p-4 text-brand-offwhite font-medium">
                    <div className="flex items-center space-x-2">
                      {tx.amount > 0 ? (
                        <ArrowDownLeft size={16} className="text-green-400" />
                      ) : (
                        <ArrowUpRight size={16} className="text-red-400" />
                      )}
                      <span>{tx.clientName}</span>
                    </div>
                  </td>
                  <td className="p-4 text-brand-offwhite/70 text-sm">{tx.vendorName}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-brand-blue/30 text-brand-offwhite/90 border border-brand-blue/40">
                      {tx.paymentMethod}
                    </span>
                  </td>
                  <td className="p-4 text-brand-offwhite/60 text-sm">{tx.date}</td>
                  <td
                    className={`p-4 font-bold ${
                      tx.amount > 0 ? "text-brand-gold" : "text-red-400"
                    }`}
                  >
                    R$ {Math.abs(tx.amount).toFixed(2).replace(".", ",")}
                  </td>
                  <td className="p-4">
                    {tx.status === "CONCILIADO" && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                        Conciliado
                      </span>
                    )}
                    {tx.status === "A_RECEBER" && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        A Receber
                      </span>
                    )}
                    {tx.status === "PROCESSADO" && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Processado
                      </span>
                    )}
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
