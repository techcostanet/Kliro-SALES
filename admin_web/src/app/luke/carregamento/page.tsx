"use client";

import { useState, useMemo } from "react";
import {
  Truck,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  Printer,
  Save,
  RotateCcw,
  Search,
  Package,
  Layers,
  TrendingUp,
  FileSpreadsheet,
  Eye,
  EyeOff,
} from "lucide-react";
import initialProducts from "@/lib/products_catalog.json";
import { usePrivacy } from "@/lib/privacyContext";
import { getVendorColor } from "@/lib/vendorColors";
import VendorBadge from "@/components/VendorBadge";

interface LoadingItem {
  productId: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  approved: boolean;
  requestedQty: number;
  loadedQty: number;
  returnQty: number;
}

interface LoadingCycle {
  id: number;
  title: string;
  date: string;
  vendor: string;
  approved: boolean;
  items: { [productId: string]: { requested: number; loaded: number; returned: number; approved: boolean } };
}

export default function CarregamentoPage() {
  const { hideValues, togglePrivacy, formatValue } = usePrivacy();
  const [selectedTab, setSelectedTab] = useState<number | "MONTHLY_SUMMARY">(1);
  const [selectedVendor, setSelectedVendor] = useState("Alisson");
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para armazenar os dados dos 20 carregamentos
  const [cycles, setCycles] = useState<{ [cycleId: number]: LoadingCycle }>(() => {
    const initial: { [cycleId: number]: LoadingCycle } = {};
    for (let i = 1; i <= 20; i++) {
      initial[i] = {
        id: i,
        title: `Carga ${i}`,
        date: new Date().toISOString().split("T")[0],
        vendor: "Alisson",
        approved: false,
        items: {},
      };
    }
    return initial;
  });

  const currentCycle = selectedTab !== "MONTHLY_SUMMARY" ? cycles[selectedTab] : null;

  // Atualização de quantidade em um ciclo específico
  const handleQtyChange = (
    cycleId: number,
    productId: string,
    field: "requested" | "loaded" | "returned",
    val: number
  ) => {
    setCycles((prev) => {
      const cycle = prev[cycleId] || {
        id: cycleId,
        title: `Carga ${cycleId}`,
        date: new Date().toISOString().split("T")[0],
        vendor: selectedVendor,
        approved: false,
        items: {},
      };

      const itemData = cycle.items[productId] || {
        requested: 0,
        loaded: 0,
        returned: 0,
        approved: false,
      };

      const safeVal = Math.max(0, isNaN(val) ? 0 : val);

      return {
        ...prev,
        [cycleId]: {
          ...cycle,
          items: {
            ...cycle.items,
            [productId]: {
              ...itemData,
              [field]: safeVal,
            },
          },
        },
      };
    });
  };

  // Toggle de aprovação de item individual
  const handleToggleItemApproval = (cycleId: number, productId: string) => {
    setCycles((prev) => {
      const cycle = prev[cycleId];
      if (!cycle) return prev;
      const itemData = cycle.items[productId] || {
        requested: 0,
        loaded: 0,
        returned: 0,
        approved: false,
      };

      return {
        ...prev,
        [cycleId]: {
          ...cycle,
          items: {
            ...cycle.items,
            [productId]: {
              ...itemData,
              approved: !itemData.approved,
            },
          },
        },
      };
    });
  };

  // Toggle aprovação do ciclo completo
  const handleToggleCycleApproval = (cycleId: number) => {
    setCycles((prev) => {
      const cycle = prev[cycleId];
      if (!cycle) return prev;
      return {
        ...prev,
        [cycleId]: {
          ...cycle,
          approved: !cycle.approved,
        },
      };
    });
  };

  // Filtragem de produtos
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [searchTerm]);

  // Cálculos do ciclo atual
  const cycleTotals = useMemo(() => {
    if (!currentCycle) return { requested: 0, loaded: 0, returned: 0, net: 0, totalValue: 0 };
    let req = 0,
      load = 0,
      ret = 0,
      net = 0,
      val = 0;

    initialProducts.forEach((p) => {
      const item = currentCycle.items[p.id];
      if (item) {
        req += item.requested || 0;
        load += item.loaded || 0;
        ret += item.returned || 0;
        const itemNet = Math.max(0, (item.loaded || 0) - (item.returned || 0));
        net += itemNet;
        val += itemNet * p.price;
      }
    });

    return { requested: req, loaded: load, returned: ret, net, totalValue: val };
  }, [currentCycle]);

  // Resumo Consolidado do Mês (Todos os 20 Ciclos)
  const monthlySummary = useMemo(() => {
    return initialProducts.map((product) => {
      let totalRequested = 0;
      let totalLoaded = 0;
      let totalReturned = 0;

      for (let i = 1; i <= 20; i++) {
        const item = cycles[i]?.items[product.id];
        if (item) {
          totalRequested += item.requested || 0;
          totalLoaded += item.loaded || 0;
          totalReturned += item.returned || 0;
        }
      }

      const netDistributed = Math.max(0, totalLoaded - totalReturned);
      const totalAmount = netDistributed * product.price;

      return {
        ...product,
        totalRequested,
        totalLoaded,
        totalReturned,
        netDistributed,
        totalAmount,
      };
    });
  }, [cycles]);

  const monthlyTotals = useMemo(() => {
    let req = 0,
      load = 0,
      ret = 0,
      net = 0,
      val = 0;
    monthlySummary.forEach((p) => {
      req += p.totalRequested;
      load += p.totalLoaded;
      ret += p.totalReturned;
      net += p.netDistributed;
      val += p.totalAmount;
    });
    return { requested: req, loaded: load, returned: ret, net, totalValue: val };
  }, [monthlySummary]);

  return (
    <div className="space-y-8">
      {/* Header com Nomes de 1 Palavra */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-extrabold text-brand-offwhite">Cargas</h2>
            <span className="bg-brand-gold/20 text-brand-gold text-xs px-2.5 py-1 rounded-full font-bold border border-brand-gold/30">
              Frota LUKE
            </span>
          </div>
          <p className="text-brand-offwhite/60 text-sm mt-1">
            Gestão digital de solicitações, aprovação de carga e devoluções para a frota LUKE Brasil.
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {/* Botão de Alternar Modo Privacidade */}
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

          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 bg-brand-blue/30 border border-brand-blue/50 text-brand-offwhite hover:bg-brand-blue/50 px-3.5 py-2.5 rounded-xl font-semibold transition text-xs shadow-md"
          >
            <Printer size={15} className="text-brand-gold" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Seletor de Vendedor & Informações da Carga */}
      <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-brand-offwhite/70">
              Vendedor
            </label>
            <VendorBadge vendorName={selectedVendor} size="xs" variant="solid" />
          </div>
          <div className="flex items-center space-x-2">
            <User size={18} className="text-brand-gold shrink-0" />
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="w-full bg-brand-black border border-brand-blue/50 text-brand-offwhite rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-gold font-bold"
            >
              <option value="Alisson">Alisson (Vendedor - Rotas R)</option>
              <option value="Alexandre">Alexandre (Vendedor - Rotas F)</option>
              <option value="Lucas">Lucas (Admin / Vendedor - Especial)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
            Data
          </label>
          <div className="flex items-center space-x-2">
            <Calendar size={18} className="text-brand-gold shrink-0" />
            <input
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              className="w-full bg-brand-black border border-brand-blue/50 text-brand-offwhite rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-gold font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end md:space-x-4 pt-4 md:pt-0">
          {selectedTab !== "MONTHLY_SUMMARY" && currentCycle && (
            <button
              onClick={() => handleToggleCycleApproval(Number(selectedTab))}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm transition shadow-md ${
                currentCycle.approved
                  ? "bg-green-600/20 text-green-400 border border-green-500/40 hover:bg-green-600/30"
                  : "bg-brand-gold text-brand-black hover:bg-yellow-500"
              }`}
            >
              <CheckCircle2 size={18} />
              <span>{currentCycle.approved ? "Carga Aprovada" : "Aprovar Carga"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs de Seleção: Cargas 1 a 20 + Resumo */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
        {Array.from({ length: 20 }, (_, i) => i + 1).map((cycleNum) => {
          const isSelected = selectedTab === cycleNum;
          const hasData = Object.keys(cycles[cycleNum]?.items || {}).length > 0;
          return (
            <button
              key={cycleNum}
              onClick={() => setSelectedTab(cycleNum)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border flex items-center space-x-1.5 ${
                isSelected
                  ? "bg-brand-gold text-brand-black border-brand-gold shadow-lg"
                  : "bg-brand-graphite text-brand-offwhite/70 border-brand-blue/30 hover:text-brand-offwhite hover:border-brand-gold/40"
              }`}
            >
              <span>Carga {cycleNum}</span>
              {hasData && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSelected ? "bg-brand-black" : "bg-brand-gold"
                  }`}
                />
              )}
            </button>
          );
        })}

        <button
          onClick={() => setSelectedTab("MONTHLY_SUMMARY")}
          className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition border flex items-center space-x-2 ${
            selectedTab === "MONTHLY_SUMMARY"
              ? "bg-brand-gold text-brand-black border-brand-gold shadow-lg"
              : "bg-brand-blue/30 text-brand-gold border-brand-gold/40 hover:bg-brand-blue/50"
          }`}
        >
          <FileSpreadsheet size={15} />
          <span>Resumo</span>
        </button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-brand-graphite p-4 rounded-xl border border-brand-blue/30">
          <span className="text-[11px] text-brand-offwhite/60 font-semibold uppercase">
            Pedido
          </span>
          <p className="text-xl font-black text-brand-offwhite mt-1">
            {selectedTab === "MONTHLY_SUMMARY" ? monthlyTotals.requested : cycleTotals.requested} un
          </p>
        </div>

        <div className="bg-brand-graphite p-4 rounded-xl border border-brand-blue/30">
          <span className="text-[11px] text-brand-offwhite/60 font-semibold uppercase">
            Carregado
          </span>
          <p className="text-xl font-black text-blue-400 mt-1">
            {selectedTab === "MONTHLY_SUMMARY" ? monthlyTotals.loaded : cycleTotals.loaded} un
          </p>
        </div>

        <div className="bg-brand-graphite p-4 rounded-xl border border-brand-blue/30">
          <span className="text-[11px] text-brand-offwhite/60 font-semibold uppercase">
            Retorno
          </span>
          <p className="text-xl font-black text-amber-400 mt-1">
            {selectedTab === "MONTHLY_SUMMARY" ? monthlyTotals.returned : cycleTotals.returned} un
          </p>
        </div>

        <div className="bg-brand-graphite p-4 rounded-xl border border-brand-blue/30">
          <span className="text-[11px] text-brand-offwhite/60 font-semibold uppercase">
            Líquido
          </span>
          <p className="text-xl font-black text-green-400 mt-1">
            {selectedTab === "MONTHLY_SUMMARY" ? monthlyTotals.net : cycleTotals.net} un
          </p>
        </div>

        <div className="bg-brand-graphite p-4 rounded-xl border border-brand-blue/30 col-span-2 md:col-span-1">
          <span className="text-[11px] text-brand-offwhite/60 font-semibold uppercase">
            Valor
          </span>
          <p className="text-xl font-black text-brand-gold mt-1">
            {formatValue(selectedTab === "MONTHLY_SUMMARY" ? monthlyTotals.totalValue : cycleTotals.totalValue)}
          </p>
        </div>
      </div>

      {/* Tabela de Carga */}
      <div className="bg-brand-graphite rounded-2xl border border-brand-blue/30 shadow-xl overflow-hidden">
        {/* Barra de Busca */}
        <div className="p-4 border-b border-brand-blue/30 flex justify-between items-center bg-brand-black/50">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-brand-offwhite/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por produto no carregamento..."
              className="w-full pl-9 pr-3 py-1.5 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite placeholder-brand-offwhite/30 focus:outline-none focus:border-brand-gold"
            />
          </div>

          <span className="text-xs text-brand-offwhite/60 font-mono">
            {filteredProducts.length} itens
          </span>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          {selectedTab !== "MONTHLY_SUMMARY" ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-blue/10 border-b border-brand-blue/30 text-brand-offwhite/70 text-xs uppercase tracking-wider">
                  <th className="p-3.5 font-medium text-center w-12">Status</th>
                  <th className="p-3.5 font-medium">Produto</th>
                  <th className="p-3.5 font-medium text-center w-36">Pedido</th>
                  <th className="p-3.5 font-medium text-center w-36">Carregado</th>
                  <th className="p-3.5 font-medium text-center w-36">Retorno</th>
                  <th className="p-3.5 font-medium text-right w-36">Líquido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-blue/10 text-sm">
                {filteredProducts.map((p) => {
                  const item = currentCycle?.items[p.id] || {
                    requested: 0,
                    loaded: 0,
                    returned: 0,
                    approved: false,
                  };
                  const net = Math.max(0, (item.loaded || 0) - (item.returned || 0));

                  return (
                    <tr key={p.id} className="hover:bg-brand-blue/5 transition">
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={item.approved}
                          onChange={() =>
                            handleToggleItemApproval(Number(selectedTab), p.id)
                          }
                          className="w-4 h-4 rounded text-brand-gold focus:ring-brand-gold cursor-pointer"
                        />
                      </td>

                      <td className="p-3.5 text-brand-offwhite">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{p.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-blue/30 text-brand-gold font-mono">
                            {p.unit}
                          </span>
                        </div>
                        <span className="text-[11px] text-brand-offwhite/40">
                          {p.category} • {formatValue(p.price)}
                        </span>
                      </td>

                      <td className="p-3.5 text-center">
                        <input
                          type="number"
                          min="0"
                          value={item.requested || ""}
                          placeholder="0"
                          onChange={(e) =>
                            handleQtyChange(
                              Number(selectedTab),
                              p.id,
                              "requested",
                              parseInt(e.target.value, 10)
                            )
                          }
                          className="w-20 text-center bg-brand-black border border-brand-blue/40 rounded-lg py-1 text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold font-semibold"
                        />
                      </td>

                      <td className="p-3.5 text-center">
                        <input
                          type="number"
                          min="0"
                          value={item.loaded || ""}
                          placeholder="0"
                          onChange={(e) =>
                            handleQtyChange(
                              Number(selectedTab),
                              p.id,
                              "loaded",
                              parseInt(e.target.value, 10)
                            )
                          }
                          className="w-20 text-center bg-brand-black border border-brand-blue/40 rounded-lg py-1 text-sm text-blue-400 focus:outline-none focus:border-blue-400 font-bold"
                        />
                      </td>

                      <td className="p-3.5 text-center">
                        <input
                          type="number"
                          min="0"
                          value={item.returned || ""}
                          placeholder="0"
                          onChange={(e) =>
                            handleQtyChange(
                              Number(selectedTab),
                              p.id,
                              "returned",
                              parseInt(e.target.value, 10)
                            )
                          }
                          className="w-20 text-center bg-brand-black border border-brand-blue/40 rounded-lg py-1 text-sm text-amber-400 focus:outline-none focus:border-amber-400 font-semibold"
                        />
                      </td>

                      <td className="p-3.5 text-right font-bold">
                        <span
                          className={
                            net > 0
                              ? "text-green-400 font-mono text-base"
                              : "text-brand-offwhite/40 font-mono"
                          }
                        >
                          {net} un
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-brand-black/70 border-t-2 border-brand-gold/30 text-sm font-black">
                  <td colSpan={2} className="p-4 text-brand-gold uppercase tracking-wider">
                    TOTAIS DA CARGA {selectedTab}
                  </td>
                  <td className="p-4 text-center font-mono text-brand-offwhite">
                    {cycleTotals.requested} un
                  </td>
                  <td className="p-4 text-center font-mono text-blue-400">
                    {cycleTotals.loaded} un
                  </td>
                  <td className="p-4 text-center font-mono text-amber-400">
                    {cycleTotals.returned} un
                  </td>
                  <td className="p-4 text-right font-mono text-green-400 text-base">
                    {cycleTotals.net} un
                  </td>
                </tr>
              </tfoot>
            </table>
          ) : (
            // VISÃO RESUMO CONSOLIDADO DO MÊS
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-blue/10 border-b border-brand-blue/30 text-brand-offwhite/70 text-xs uppercase tracking-wider">
                  <th className="p-3.5 font-medium">Produto</th>
                  <th className="p-3.5 font-medium text-center">Pedido (20 Cargas)</th>
                  <th className="p-3.5 font-medium text-center">Carregado</th>
                  <th className="p-3.5 font-medium text-center">Retorno</th>
                  <th className="p-3.5 font-medium text-center">Líquido</th>
                  <th className="p-3.5 font-medium text-right">Valor Estimado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-blue/10 text-sm">
                {monthlySummary
                  .filter(
                    (p) =>
                      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      p.category.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((p) => (
                    <tr key={p.id} className="hover:bg-brand-blue/5 transition">
                      <td className="p-3.5 text-brand-offwhite">
                        <div className="font-semibold flex items-center space-x-2">
                          <span>{p.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-blue/30 text-brand-gold font-mono">
                            {p.unit}
                          </span>
                        </div>
                        <span className="text-[11px] text-brand-offwhite/40">{p.category}</span>
                      </td>

                      <td className="p-3.5 text-center font-mono text-brand-offwhite/70">
                        {p.totalRequested} un
                      </td>

                      <td className="p-3.5 text-center font-mono text-blue-400 font-bold">
                        {p.totalLoaded} un
                      </td>

                      <td className="p-3.5 text-center font-mono text-amber-400 font-medium">
                        {p.totalReturned} un
                      </td>

                      <td className="p-3.5 text-center font-mono text-green-400 font-black">
                        {p.netDistributed} un
                      </td>

                      <td className="p-3.5 text-right font-mono text-brand-gold font-bold">
                        {formatValue(p.totalAmount)}
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr className="bg-brand-black/80 border-t-2 border-brand-gold/40 text-sm font-black">
                  <td className="p-4 text-brand-gold uppercase tracking-wider">
                    TOTAL DO MÊS
                  </td>
                  <td className="p-4 text-center font-mono text-brand-offwhite">
                    {monthlyTotals.requested} un
                  </td>
                  <td className="p-4 text-center font-mono text-blue-400">
                    {monthlyTotals.loaded} un
                  </td>
                  <td className="p-4 text-center font-mono text-amber-400">
                    {monthlyTotals.returned} un
                  </td>
                  <td className="p-4 text-center font-mono text-green-400 text-base">
                    {monthlyTotals.net} un
                  </td>
                  <td className="p-4 text-right font-mono text-brand-gold text-lg">
                    {formatValue(monthlyTotals.totalValue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
