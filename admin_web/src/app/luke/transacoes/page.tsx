"use client";

import { useState } from "react";
import { DollarSign, Search, ArrowDownLeft, ArrowUpRight, QrCode, Banknote, FileText } from "lucide-react";

export default function LukeTransacoesPage() {
  const [transactions, setTransactions] = useState([
    {
      id: "tx-001",
      clientName: "Padaria & Confeitaria Estrela",
      vendorName: "Carlos Eduardo",
      paymentMethod: "PIX",
      amount: 450.0,
      date: "Hoje, 14:32",
      status: "CONCILIADO",
    },
    {
      id: "tx-002",
      clientName: "Supermercado Boa Vista",
      vendorName: "Carlos Eduardo",
      paymentMethod: "CASH",
      amount: 1280.5,
      date: "Hoje, 13:15",
      status: "CONCILIADO",
    },
    {
      id: "tx-003",
      clientName: "Mercearia Central",
      vendorName: "Marcos Souza",
      paymentMethod: "PIX",
      amount: 890.0,
      date: "Hoje, 11:40",
      status: "CONCILIADO",
    },
    {
      id: "tx-004",
      clientName: "Panificadora Pão Dourado",
      vendorName: "Marcos Souza",
      paymentMethod: "DEVOLUÇÃO",
      amount: -120.0,
      date: "Hoje, 10:22",
      status: "PROCESSADO",
    },
    {
      id: "tx-005",
      clientName: "Armazém do Bairro",
      vendorName: "Carlos Eduardo",
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
      <div>
        <h2 className="text-3xl font-extrabold text-brand-offwhite">Transações & Conciliação</h2>
        <p className="text-brand-offwhite/60 text-sm mt-1">
          Fluxo financeiro de vendas e pagamentos da LUKE Brasil.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-brand-graphite p-5 rounded-xl border border-brand-blue/30 shadow-lg">
          <p className="text-sm font-medium text-brand-offwhite/60">Total Arrecadado Hoje</p>
          <h3 className="text-2xl font-bold text-brand-offwhite mt-1">R$ 3.120,50</h3>
        </div>

        <div className="bg-brand-graphite p-5 rounded-xl border border-brand-blue/30 shadow-lg">
          <p className="text-sm font-medium text-brand-offwhite/60">Recebido via Pix</p>
          <h3 className="text-2xl font-bold text-teal-400 mt-1">R$ 1.340,00</h3>
        </div>

        <div className="bg-brand-graphite p-5 rounded-xl border border-brand-blue/30 shadow-lg">
          <p className="text-sm font-medium text-brand-offwhite/60">Dinheiro em Espécie</p>
          <h3 className="text-2xl font-bold text-brand-offwhite mt-1">R$ 1.280,50</h3>
        </div>

        <div className="bg-brand-graphite p-5 rounded-xl border border-brand-blue/30 shadow-lg">
          <p className="text-sm font-medium text-brand-offwhite/60">A Prazo / Boletos</p>
          <h3 className="text-2xl font-bold text-purple-400 mt-1">R$ 620,00</h3>
        </div>
      </div>

      <div className="bg-brand-graphite rounded-2xl border border-brand-blue/30 shadow-lg overflow-hidden">
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
              placeholder="Buscar por cliente..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-blue/10 border-b border-brand-blue/30 text-brand-offwhite/70 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Cliente</th>
                <th className="p-4 font-medium">Vendedor</th>
                <th className="p-4 font-medium">Método</th>
                <th className="p-4 font-medium">Data / Hora</th>
                <th className="p-4 font-medium">Valor</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-blue/10 text-sm">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-brand-blue/5 transition">
                  <td className="p-4 text-brand-offwhite font-semibold">
                    <div className="flex items-center space-x-2">
                      {tx.amount > 0 ? (
                        <ArrowDownLeft size={16} className="text-green-400" />
                      ) : (
                        <ArrowUpRight size={16} className="text-red-400" />
                      )}
                      <span>{tx.clientName}</span>
                    </div>
                  </td>
                  <td className="p-4 text-brand-offwhite/70 text-xs">{tx.vendorName}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-brand-blue/30 text-brand-offwhite/90">
                      {tx.paymentMethod}
                    </span>
                  </td>
                  <td className="p-4 text-brand-offwhite/60 text-xs">{tx.date}</td>
                  <td
                    className={`p-4 font-bold ${
                      tx.amount > 0 ? "text-brand-gold" : "text-red-400"
                    }`}
                  >
                    R$ {Math.abs(tx.amount).toFixed(2).replace(".", ",")}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                      {tx.status}
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
