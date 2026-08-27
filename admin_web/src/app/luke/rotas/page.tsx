"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  MapPin,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Edit2,
  Trash2,
  X,
  Truck,
  DollarSign,
  Users,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { usePrivacy } from "@/lib/privacyContext";

export interface RouteItem {
  id: string;
  code: string;
  name: string;
  vendorName: string;
  dayOfWeek: string;
  status: "OPEN" | "CLOSED" | "SCHEDULED";
  totalClients: number;
  completedVisits: number;
  totalSales: number;
  notes?: string;
}

const INITIAL_ROUTES: RouteItem[] = [
  {
    id: "rota-r1",
    code: "R1",
    name: "Rota R1 - Centro & Região",
    vendorName: "Alisson",
    dayOfWeek: "Terça-feira",
    status: "CLOSED",
    totalClients: 24,
    completedVisits: 24,
    totalSales: 4850.0,
  },
  {
    id: "rota-r2",
    code: "R2",
    name: "Rota R2 - Zona Sul",
    vendorName: "Alisson",
    dayOfWeek: "Quarta-feira",
    status: "CLOSED",
    totalClients: 22,
    completedVisits: 22,
    totalSales: 5120.0,
  },
  {
    id: "rota-r3",
    code: "R3",
    name: "Rota R3 - Barreiro & Contorno",
    vendorName: "Alisson",
    dayOfWeek: "Quinta-feira",
    status: "CLOSED",
    totalClients: 26,
    completedVisits: 26,
    totalSales: 6380.0,
  },
  {
    id: "rota-r4",
    code: "R4",
    name: "Rota R4 - Contagem & Eldorado",
    vendorName: "Alisson",
    dayOfWeek: "Sexta-feira",
    status: "OPEN",
    totalClients: 25,
    completedVisits: 14,
    totalSales: 3840.0,
  },
  {
    id: "rota-f1",
    code: "F1",
    name: "Rota F1 - Leste & Savassi",
    vendorName: "Alexandre",
    dayOfWeek: "Terça-feira",
    status: "CLOSED",
    totalClients: 20,
    completedVisits: 20,
    totalSales: 4490.0,
  },
  {
    id: "rota-f2",
    code: "F2",
    name: "Rota F2 - Pampulha & Norte",
    vendorName: "Alexandre",
    dayOfWeek: "Quarta-feira",
    status: "OPEN",
    totalClients: 23,
    completedVisits: 18,
    totalSales: 4210.0,
  },
  {
    id: "rota-f3",
    code: "F3",
    name: "Rota F3 - Venda Nova & Região",
    vendorName: "Alexandre",
    dayOfWeek: "Quinta-feira",
    status: "SCHEDULED",
    totalClients: 25,
    completedVisits: 0,
    totalSales: 0.0,
  },
  {
    id: "rota-rep",
    code: "REP",
    name: "Rota Representação Especial",
    vendorName: "Lucas",
    dayOfWeek: "Segunda-feira",
    status: "SCHEDULED",
    totalClients: 15,
    completedVisits: 0,
    totalSales: 0.0,
  },
];

const DAYS_OF_WEEK = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

const VENDORS_LIST = ["Alisson", "Alexandre", "Lucas", "Sabrina"];

export default function LukeRotasPage() {
  const { hideValues, togglePrivacy, formatValue } = usePrivacy();
  const [routes, setRoutes] = useState<RouteItem[]>(INITIAL_ROUTES);
  const [loadingFirestore, setLoadingFirestore] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [vendorFilter, setVendorFilter] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteItem | null>(null);
  const [formData, setFormData] = useState<Partial<RouteItem>>({
    code: "R5",
    name: "Rota R5",
    vendorName: "Alisson",
    dayOfWeek: "Terça-feira",
    status: "SCHEDULED",
    totalClients: 20,
    completedVisits: 0,
    totalSales: 0,
    notes: "",
  });

  const tenantId = "tenant_luke_001";

  // Carrega do Firestore
  const fetchRoutes = async () => {
    try {
      setLoadingFirestore(true);
      const snap = await getDocs(collection(db, `tenants/${tenantId}/routes`));
      if (!snap.empty) {
        const loaded: RouteItem[] = [];
        snap.forEach((d) => {
          const data = d.data();
          loaded.push({
            id: d.id,
            code: data.code || "R1",
            name: data.name || "Rota",
            vendorName: data.vendorName || "Alisson",
            dayOfWeek: data.dayOfWeek || "Terça-feira",
            status: data.status || "SCHEDULED",
            totalClients: Number(data.totalClients || 0),
            completedVisits: Number(data.completedVisits || 0),
            totalSales: Number(data.totalSales || 0),
            notes: data.notes || "",
          });
        });
        setRoutes(loaded);
      }
    } catch (err: any) {
      console.warn("Firestore fetch rotas fallback to initial:", err?.message);
    } finally {
      setLoadingFirestore(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  // Sincronizar Firestore
  const handleSyncFirestore = async () => {
    setLoadingFirestore(true);
    setSyncMessage(null);
    try {
      for (const r of routes) {
        await setDoc(
          doc(db, `tenants/${tenantId}/routes`, r.id),
          { ...r, updatedAt: new Date() },
          { merge: true }
        );
      }
      setSyncMessage("✅ Rotas sincronizadas com o Firestore com sucesso!");
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (err: any) {
      setSyncMessage(`❌ Erro ao sincronizar: ${err?.message}`);
    } finally {
      setLoadingFirestore(false);
    }
  };

  const filtered = useMemo(() => {
    return routes.filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.vendorName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
      const matchVendor = vendorFilter === "ALL" || r.vendorName === vendorFilter;

      return matchSearch && matchStatus && matchVendor;
    });
  }, [routes, searchTerm, statusFilter, vendorFilter]);

  // Modal Handlers
  const handleOpenModal = (r?: RouteItem) => {
    if (r) {
      setEditingRoute(r);
      setFormData(r);
    } else {
      setEditingRoute(null);
      const nextCode = `R${routes.length + 1}`;
      setFormData({
        id: `rota-${Date.now()}`,
        code: nextCode,
        name: `Rota ${nextCode} - Região`,
        vendorName: "Alisson",
        dayOfWeek: "Terça-feira",
        status: "SCHEDULED",
        totalClients: 20,
        completedVisits: 0,
        totalSales: 0,
        notes: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const payload: RouteItem = {
      id: formData.id || `rota-${Date.now()}`,
      code: formData.code?.trim() || "R1",
      name: formData.name.trim(),
      vendorName: formData.vendorName || "Alisson",
      dayOfWeek: formData.dayOfWeek || "Terça-feira",
      status: formData.status || "SCHEDULED",
      totalClients: Number(formData.totalClients || 0),
      completedVisits: Number(formData.completedVisits || 0),
      totalSales: Number(formData.totalSales || 0),
      notes: formData.notes || "",
    };

    if (editingRoute) {
      setRoutes((prev) =>
        prev.map((item) => (item.id === editingRoute.id ? payload : item))
      );
    } else {
      setRoutes((prev) => [...prev, payload]);
    }

    try {
      await setDoc(doc(db, `tenants/${tenantId}/routes`, payload.id), {
        ...payload,
        updatedAt: new Date(),
      });
    } catch (err) {
      console.warn("Gravado localmente:", err);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente remover esta rota?")) {
      setRoutes((prev) => prev.filter((r) => r.id !== id));
      try {
        await deleteDoc(doc(db, `tenants/${tenantId}/routes`, id));
      } catch (e) {}
    }
  };

  const totalSalesAll = routes.reduce((acc, curr) => acc + (curr.totalSales || 0), 0);
  const activeRoutesCount = routes.filter((r) => r.status === "OPEN").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-extrabold text-brand-offwhite">Rotas</h2>
            <span className="bg-brand-gold/20 text-brand-gold text-xs px-2.5 py-1 rounded-full font-bold border border-brand-gold/30">
              {routes.length} cadastradas
            </span>
          </div>
          <p className="text-brand-offwhite/60 text-sm mt-1">
            Planejamento e acompanhamento em tempo real das rotas de campo da LUKE Brasil.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Botão Ocultar Valores */}
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

          <Link
            href="/luke/rua"
            className="flex items-center space-x-1.5 bg-brand-blue/30 text-brand-gold border border-brand-gold/40 px-3.5 py-2.5 rounded-xl font-bold hover:bg-brand-blue/50 transition shadow-md text-xs"
          >
            <span>📱 Rua</span>
            <ArrowRight size={14} />
          </Link>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-1.5 bg-brand-gold text-brand-black px-4 py-2.5 rounded-xl font-extrabold hover:bg-yellow-500 transition shadow-lg text-xs shrink-0"
          >
            <Plus size={16} />
            <span>Nova Rota</span>
          </button>
        </div>
      </div>

      {/* Sync Message */}
      {syncMessage && (
        <div className="p-4 rounded-xl bg-brand-graphite border border-brand-gold/50 text-sm text-brand-offwhite flex items-center space-x-3 shadow-lg">
          <CheckCircle2 className="text-brand-gold shrink-0" size={20} />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Total Rotas</span>
            <MapPin size={18} className="text-brand-gold" />
          </div>
          <p className="text-2xl font-black text-brand-offwhite mt-2">{routes.length}</p>
          <span className="text-[11px] text-green-400 font-medium">R1-R12 e F1-F12</span>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Em Campo</span>
            <Truck size={18} className="text-brand-gold" />
          </div>
          <p className="text-2xl font-black text-brand-gold mt-2">{activeRoutesCount} ativas</p>
          <span className="text-[11px] text-brand-gold/70">Atendimento hoje</span>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Salões em Rota</span>
            <Users size={18} className="text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-400 mt-2">
            {routes.reduce((a, b) => a + b.totalClients, 0)}
          </p>
          <span className="text-[11px] text-brand-offwhite/50">Visitas programadas</span>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Faturamento Total</span>
            <DollarSign size={18} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">
            {formatValue(totalSalesAll)}
          </p>
          <span className="text-[11px] text-brand-offwhite/50">Vendas liquidadas</span>
        </div>
      </div>

      {/* Tabela de Rotas */}
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
              placeholder="Buscar rota, código ou vendedor..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="bg-brand-black border border-brand-blue/50 text-brand-offwhite text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-gold"
            >
              <option value="ALL">Todos os Vendedores</option>
              {VENDORS_LIST.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-brand-black border border-brand-blue/50 text-brand-offwhite text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-gold"
            >
              <option value="ALL">Todos os Status</option>
              <option value="OPEN">Em Aberto (Rua)</option>
              <option value="CLOSED">Concluída</option>
              <option value="SCHEDULED">Agendada</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-blue/10 border-b border-brand-blue/30 text-brand-offwhite/70 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Código</th>
                <th className="p-4 font-medium">Rota</th>
                <th className="p-4 font-medium">Vendedor</th>
                <th className="p-4 font-medium">Dia</th>
                <th className="p-4 font-medium">Progresso</th>
                <th className="p-4 font-medium">Faturamento</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-blue/10 text-sm">
              {filtered.map((route) => {
                const percent =
                  route.totalClients > 0
                    ? Math.round((route.completedVisits / route.totalClients) * 100)
                    : 0;

                return (
                  <tr key={route.id} className="hover:bg-brand-blue/5 transition group">
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-brand-gold/15 text-brand-gold font-black text-xs rounded-md border border-brand-gold/30">
                        {route.code}
                      </span>
                    </td>

                    <td className="p-4 font-bold text-brand-offwhite">
                      <div className="flex items-center space-x-2">
                        <MapPin size={16} className="text-brand-gold shrink-0" />
                        <span>{route.name}</span>
                      </div>
                      {route.notes && <p className="text-xs text-brand-offwhite/40 mt-0.5">{route.notes}</p>}
                    </td>

                    <td className="p-4 text-xs font-semibold text-brand-offwhite/80">
                      {route.vendorName}
                    </td>

                    <td className="p-4 text-xs text-brand-offwhite/70">
                      {route.dayOfWeek}
                    </td>

                    <td className="p-4 w-44">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-brand-offwhite/60">
                          {route.completedVisits}/{route.totalClients} salões
                        </span>
                        <span className="font-bold text-brand-gold">{percent}%</span>
                      </div>
                      <div className="w-full bg-brand-black h-2 rounded-full overflow-hidden border border-brand-blue/20">
                        <div
                          className="bg-brand-gold h-full rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </td>

                    <td className="p-4 font-mono font-bold text-emerald-400">
                      {formatValue(route.totalSales)}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          route.status === "OPEN"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : route.status === "CLOSED"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-brand-blue/20 text-brand-offwhite/60 border-brand-blue/30"
                        }`}
                      >
                        {route.status === "OPEN"
                          ? "Em Rota"
                          : route.status === "CLOSED"
                          ? "Concluída"
                          : "Agendada"}
                      </span>
                    </td>

                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenModal(route)}
                        title="Editar Rota"
                        className="text-brand-offwhite/50 hover:text-brand-gold p-1.5 rounded-lg hover:bg-brand-blue/10 transition"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(route.id)}
                        title="Excluir Rota"
                        className="text-brand-offwhite/50 hover:text-red-400 p-1.5 rounded-lg hover:bg-brand-blue/10 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Criação / Edição de Rota */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-sm">
          <div className="bg-brand-graphite w-full max-w-lg rounded-2xl border border-brand-blue/40 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-brand-offwhite/50 hover:text-brand-offwhite p-1 rounded-lg hover:bg-brand-blue/20 transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-gold/20 text-brand-gold flex items-center justify-center border border-brand-gold/30">
                <MapPin size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-offwhite">
                  {editingRoute ? "Editar Rota" : "Criar Nova Rota"}
                </h3>
                <p className="text-xs text-brand-offwhite/60">
                  Configure o código, vendedor responsável e dia da semana.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveRoute} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Código
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code || ""}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-gold font-mono font-bold focus:outline-none focus:border-brand-gold"
                    placeholder="R5"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Nome da Rota
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                    placeholder="Ex: Rota R5 - Betim & Ibirité"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Vendedor Responsável
                  </label>
                  <select
                    value={formData.vendorName || "Alisson"}
                    onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  >
                    {VENDORS_LIST.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Dia da Semana
                  </label>
                  <select
                    value={formData.dayOfWeek || "Terça-feira"}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Salões Previstos
                  </label>
                  <input
                    type="number"
                    value={formData.totalClients || 20}
                    onChange={(e) => setFormData({ ...formData, totalClients: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Visitas Realizadas
                  </label>
                  <input
                    type="number"
                    value={formData.completedVisits || 0}
                    onChange={(e) => setFormData({ ...formData, completedVisits: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status || "SCHEDULED"}
                    onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  >
                    <option value="SCHEDULED">Agendada</option>
                    <option value="OPEN">Em Aberto (Rua)</option>
                    <option value="CLOSED">Concluída</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                  Observações da Rota
                </label>
                <textarea
                  rows={2}
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  placeholder="Orientações sobre abastecimento, horários..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-brand-blue/30">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-brand-offwhite/70 hover:text-brand-offwhite transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-gold text-brand-black rounded-lg font-bold hover:bg-yellow-500 transition shadow-lg text-sm"
                >
                  Salvar Rota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
