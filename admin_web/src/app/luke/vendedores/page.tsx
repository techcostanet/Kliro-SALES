"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Shield,
  User,
  Truck,
  DollarSign,
  CheckCircle2,
  X,
  RefreshCw,
  Users,
  Target,
  MessageCircle,
  Eye,
  EyeOff,
  Palette,
  Calendar,
} from "lucide-react";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { usePrivacy } from "@/lib/privacyContext";
import { formatCurrency, formatPhoneBR, getWhatsAppLink } from "@/lib/formatters";
import { VENDOR_COLOR_PALETTE, getVendorColor } from "@/lib/vendorColors";
import VendorBadge from "@/components/VendorBadge";
import Link from "next/link";

export interface VendorItem {
  id: string;
  name: string;
  email: string;
  role: "VENDOR" | "ADMIN_VENDOR" | "ADMIN" | "SUPERVISOR";
  phone: string;
  color: string; // Cor de identificação no calendário e sistema
  vehicle: string;
  vehiclePlate: string;
  commissionRate: number;
  assignedRoutes?: string[]; // Prefixos ou rotas habituais (opcional)
  monthlyTarget: number;
  status: "ACTIVE" | "INACTIVE";
  notes?: string;
}

const INITIAL_VENDORS: VendorItem[] = [
  {
    id: "usr-001",
    name: "Alisson",
    email: "alisson@luke.com",
    role: "VENDOR",
    phone: "(31) 98744-1234",
    color: "#10b981", // Verde Esmeralda (Rotas R)
    vehicle: "Chevrolet Montana",
    vehiclePlate: "HMN-8840",
    commissionRate: 8.0,
    assignedRoutes: ["R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8", "R9", "R10", "R11", "R12"],
    monthlyTarget: 45000.0,
    status: "ACTIVE",
    notes: "Vendedor de rota principal LUKE Brasil (Rotas prefixo R).",
  },
  {
    id: "usr-002",
    name: "Alexandre",
    email: "alexandre@luke.com",
    role: "VENDOR",
    phone: "(31) 99123-5566",
    color: "#0ea5e9", // Azul Céu (Rotas F)
    vehicle: "Renault Clio Express",
    vehiclePlate: "KLU-9921",
    commissionRate: 8.0,
    assignedRoutes: ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "G1", "G2"],
    monthlyTarget: 40000.0,
    status: "ACTIVE",
    notes: "Atendimento rotas prefixo F e Grande BH.",
  },
  {
    id: "usr-003",
    name: "Lucas",
    email: "lucas@luke.com",
    role: "ADMIN_VENDOR",
    phone: "(31) 98888-0001",
    color: "#8b5cf6", // Violeta (Especial / Diretoria)
    vehicle: "Fiat Strada Freedom",
    vehiclePlate: "LUK-2025",
    commissionRate: 10.0,
    assignedRoutes: ["REP", "R1", "F1"],
    monthlyTarget: 50000.0,
    status: "ACTIVE",
    notes: "Diretor Comercial e Vendedor Contas Chave.",
  },
  {
    id: "usr-004",
    name: "Sabrina",
    email: "sabrina@luke.com",
    role: "ADMIN",
    phone: "(31) 97777-1111",
    color: "#f59e0b", // Âmbar (Administrativo)
    vehicle: "Operacional Base",
    vehiclePlate: "---",
    commissionRate: 0.0,
    assignedRoutes: ["Todas"],
    monthlyTarget: 0.0,
    status: "ACTIVE",
    notes: "Administração Financeira e Fechamento de Cargas.",
  },
];

export default function LukeVendedoresPage() {
  const { hideValues, togglePrivacy, formatValue } = usePrivacy();
  const [vendors, setVendors] = useState<VendorItem[]>(INITIAL_VENDORS);
  const [loadingFirestore, setLoadingFirestore] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorItem | null>(null);

  const [formData, setFormData] = useState<Partial<VendorItem>>({
    name: "",
    email: "",
    role: "VENDOR",
    phone: "",
    color: "#10b981",
    vehicle: "Fiat Strada",
    vehiclePlate: "LUK-1234",
    commissionRate: 8.0,
    assignedRoutes: ["R"],
    monthlyTarget: 40000.0,
    status: "ACTIVE",
    notes: "",
  });

  const tenantId = "tenant_luke_001";

  // Carregar do Firestore
  const fetchVendors = async () => {
    try {
      setLoadingFirestore(true);
      const snapshot = await getDocs(collection(db, `tenants/${tenantId}/users`));
      if (!snapshot.empty) {
        const loaded: VendorItem[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          loaded.push({
            id: docSnap.id,
            name: d.name || "Vendedor",
            email: d.email || "",
            role: d.role || "VENDOR",
            phone: d.phone || "",
            color: d.color || getVendorColor(d.name),
            vehicle: d.vehicle || "Veículo Comercial",
            vehiclePlate: d.vehiclePlate || "---",
            commissionRate: Number(d.commissionRate || 8),
            assignedRoutes: Array.isArray(d.assignedRoutes) ? d.assignedRoutes : [d.assignedRoutes || "R"],
            monthlyTarget: Number(d.monthlyTarget || 35000),
            status: d.status || "ACTIVE",
            notes: d.notes || "",
          });
        });
        setVendors(loaded);
      }
    } catch (err: any) {
      console.warn("Firestore fetch offline/fallback:", err?.message);
    } finally {
      setLoadingFirestore(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // Sincronizar Firestore
  const handleSyncFirestore = async () => {
    setLoadingFirestore(true);
    setSyncMessage(null);
    try {
      for (const v of vendors) {
        await setDoc(
          doc(db, `tenants/${tenantId}/users`, v.id),
          { ...v, updatedAt: new Date() },
          { merge: true }
        );
      }
      setSyncMessage("✅ Equipe e cores sincronizadas com o Firestore com sucesso!");
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (err: any) {
      setSyncMessage(`❌ Erro ao sincronizar: ${err?.message}`);
    } finally {
      setLoadingFirestore(false);
    }
  };

  // Filtragem
  const filtered = useMemo(() => {
    return vendors.filter((v) => {
      const matchSearch =
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.assignedRoutes && v.assignedRoutes.join(" ").toLowerCase().includes(searchTerm.toLowerCase()));

      const matchRole =
        selectedRoleFilter === "ALL" || v.role === selectedRoleFilter;

      return matchSearch && matchRole;
    });
  }, [vendors, searchTerm, selectedRoleFilter]);

  // Modal Handlers
  const handleOpenModal = (v?: VendorItem) => {
    if (v) {
      setEditingVendor(v);
      setFormData(v);
    } else {
      setEditingVendor(null);
      setFormData({
        id: `usr-${Date.now()}`,
        name: "",
        email: "",
        role: "VENDOR",
        phone: "",
        color: VENDOR_COLOR_PALETTE[vendors.length % VENDOR_COLOR_PALETTE.length].hex,
        vehicle: "Fiat Strada",
        vehiclePlate: "LUK-1234",
        commissionRate: 8.0,
        assignedRoutes: ["R"],
        monthlyTarget: 40000.0,
        status: "ACTIVE",
        notes: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.email?.trim()) return;

    const payload: VendorItem = {
      id: formData.id || `usr-${Date.now()}`,
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role || "VENDOR",
      phone: formData.phone || "",
      color: formData.color || getVendorColor(formData.name),
      vehicle: formData.vehicle || "Veículo Comercial",
      vehiclePlate: formData.vehiclePlate || "---",
      commissionRate: Number(formData.commissionRate || 8),
      assignedRoutes: Array.isArray(formData.assignedRoutes)
        ? formData.assignedRoutes
        : [formData.assignedRoutes || "R"],
      monthlyTarget: Number(formData.monthlyTarget || 35000),
      status: formData.status || "ACTIVE",
      notes: formData.notes || "",
    };

    if (editingVendor) {
      setVendors((prev) =>
        prev.map((v) => (v.id === editingVendor.id ? payload : v))
      );
    } else {
      setVendors((prev) => [...prev, payload]);
    }

    try {
      await setDoc(doc(db, `tenants/${tenantId}/users`, payload.id), {
        ...payload,
        updatedAt: new Date(),
      });
    } catch (err) {
      console.warn("Gravado localmente:", err);
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = async (v: VendorItem) => {
    const updatedStatus: "ACTIVE" | "INACTIVE" =
      v.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const updated = { ...v, status: updatedStatus };
    setVendors((prev) => prev.map((item) => (item.id === v.id ? updated : item)));

    try {
      await setDoc(
        doc(db, `tenants/${tenantId}/users`, v.id),
        { status: updatedStatus, updatedAt: new Date() },
        { merge: true }
      );
    } catch (e) {}
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente remover este integrante da equipe?")) {
      setVendors((prev) => prev.filter((v) => v.id !== id));
      try {
        await deleteDoc(doc(db, `tenants/${tenantId}/users`, id));
      } catch (e) {}
    }
  };

  const totalTarget = useMemo(() => {
    return vendors.reduce((acc, curr) => acc + (curr.monthlyTarget || 0), 0);
  }, [vendors]);

  const activeVendors = useMemo(() => {
    return vendors.filter((v) => v.status === "ACTIVE").length;
  }, [vendors]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-extrabold text-brand-offwhite">Vendedores & Equipe</h2>
            <span className="bg-brand-gold/20 text-brand-gold text-xs px-2.5 py-1 rounded-full font-bold border border-brand-gold/30">
              {vendors.length} integrantes
            </span>
          </div>
          <p className="text-brand-offwhite/60 text-sm mt-1">
            Gestão completa da equipe, comissões, metas e cores personalizadas para a Gestão de Rotas.
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {/* Atalho para Gestão de Rotas */}
          <Link
            href="/luke/rotas"
            className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-brand-blue/30 text-brand-offwhite border border-brand-blue/50 hover:bg-brand-blue/50 transition shadow-xs"
          >
            <Calendar size={15} className="text-brand-gold" />
            <span className="hidden sm:inline">Gestão de Rotas</span>
          </Link>

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
            onClick={handleSyncFirestore}
            disabled={loadingFirestore}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-brand-blue/40 border border-brand-gold/40 text-brand-offwhite hover:bg-brand-blue/60 px-3.5 py-2.5 rounded-xl font-semibold transition text-xs shadow-md"
            title="Sincronizar equipe com o Firestore"
          >
            <RefreshCw size={14} className={loadingFirestore ? "animate-spin text-brand-gold" : "text-brand-gold"} />
            <span>Sincronizar</span>
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-brand-gold text-brand-black px-4 py-2.5 rounded-xl font-extrabold hover:bg-yellow-500 transition shadow-lg text-xs shrink-0"
          >
            <Plus size={16} />
            <span>Novo Vendedor</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Equipe</span>
            <Users size={18} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">{activeVendors} ativos</p>
          <span className="text-[11px] text-brand-offwhite/50">Em campo e base operacional</span>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Veículos</span>
            <Truck size={18} className="text-brand-gold" />
          </div>
          <p className="text-2xl font-black text-brand-offwhite mt-2">
            {vendors.filter((v) => v.vehiclePlate !== "---").length} frotas
          </p>
          <span className="text-[11px] text-brand-gold font-medium">Abastecidos com estoque</span>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Meta Total</span>
            <Target size={18} className="text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-400 mt-2">
            {formatValue(totalTarget, "currency")}
          </p>
          <span className="text-[11px] text-brand-offwhite/50">Faturamento alvo do time</span>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Comissão Média</span>
            <DollarSign size={18} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">8,0%</p>
          <span className="text-[11px] text-brand-offwhite/50">Sobre vendas liquidadas</span>
        </div>
      </div>

      {/* Tabela de Vendedores */}
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
              placeholder="Buscar nome, e-mail ou veículo..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="bg-brand-black border border-brand-blue/50 text-brand-offwhite text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-gold"
            >
              <option value="ALL">Todos os Cargos</option>
              <option value="VENDOR">Vendedor de Rua</option>
              <option value="ADMIN_VENDOR">Admin & Vendedor</option>
              <option value="ADMIN">Administração</option>
              <option value="SUPERVISOR">Supervisor</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-blue/10 border-b border-brand-blue/30 text-brand-offwhite/70 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Vendedor & Cor</th>
                <th className="p-4 font-medium">Função</th>
                <th className="p-4 font-medium">Veículo</th>
                <th className="p-4 font-medium">Prefixos Habituais</th>
                <th className="p-4 font-medium">Comissão</th>
                <th className="p-4 font-medium">Meta</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-blue/10 text-sm">
              {filtered.map((user) => {
                const userColor = user.color || getVendorColor(user.name);
                return (
                  <tr key={user.id} className="hover:bg-brand-blue/5 transition group">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div
                          style={{ borderColor: userColor }}
                          className="w-10 h-10 rounded-full bg-brand-black/60 border-2 flex items-center justify-center font-black text-white shrink-0 shadow-sm relative"
                        >
                          <span style={{ color: userColor }}>
                            {user.name ? user.name.charAt(0).toUpperCase() : "V"}
                          </span>
                          <span
                            style={{ backgroundColor: userColor }}
                            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-brand-graphite"
                          />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-brand-offwhite font-bold">{user.name}</p>
                            <VendorBadge vendorName={user.name} color={userColor} size="xs" variant="chip" />
                          </div>
                          <p className="text-xs text-brand-offwhite/50">{user.email}</p>
                          <div className="mt-0.5">
                            {user.phone ? (
                              <a
                                href={getWhatsAppLink(user.phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 text-[11px] text-green-400 font-mono hover:underline font-bold"
                              >
                                <MessageCircle size={11} className="text-green-400" />
                                <span>{formatPhoneBR(user.phone)}</span>
                              </a>
                            ) : (
                              <span className="text-[11px] text-brand-offwhite/40 italic">Sem WhatsApp</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-md font-semibold ${
                          user.role === "ADMIN_VENDOR"
                            ? "bg-brand-gold/20 text-brand-gold border border-brand-gold/30"
                            : user.role === "ADMIN"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        }`}
                      >
                        {user.role === "ADMIN_VENDOR"
                          ? "Admin & Vendedor"
                          : user.role === "ADMIN"
                          ? "Administração"
                          : user.role === "SUPERVISOR"
                          ? "Supervisor"
                          : "Vendedor"}
                      </span>
                    </td>

                    <td className="p-4 text-xs text-brand-offwhite/80">
                      <div className="flex items-center space-x-1.5">
                        <Truck size={14} className="text-brand-gold/70 shrink-0" />
                        <span>{user.vehicle}</span>
                      </div>
                      <span className="text-[11px] text-brand-offwhite/40 font-mono pl-5">
                        {user.vehiclePlate}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-[170px]">
                        {user.assignedRoutes && user.assignedRoutes.length > 0 ? (
                          user.assignedRoutes.slice(0, 4).map((r) => (
                            <span
                              key={r}
                              className="px-1.5 py-0.5 bg-brand-black text-brand-offwhite/80 text-[10px] rounded border border-brand-blue/30 font-mono font-bold"
                            >
                              {r}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-brand-offwhite/40 italic">Via Agenda</span>
                        )}
                        {user.assignedRoutes && user.assignedRoutes.length > 4 && (
                          <span className="text-[10px] text-brand-gold font-bold">
                            +{user.assignedRoutes.length - 4}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 font-mono font-bold text-emerald-400 text-xs">
                      {user.commissionRate > 0 ? `${user.commissionRate.toFixed(1)}%` : "Fixo"}
                    </td>

                    <td className="p-4 font-bold text-brand-offwhite text-xs font-mono">
                      {user.monthlyTarget > 0 ? formatValue(user.monthlyTarget, "currency") : "---"}
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition ${
                          user.status === "ACTIVE"
                            ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                        }`}
                      >
                        {user.status === "ACTIVE" ? "Ativo" : "Inativo"}
                      </button>
                    </td>

                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenModal(user)}
                        title="Editar Vendedor"
                        className="text-brand-offwhite/50 hover:text-brand-gold p-1.5 rounded-lg hover:bg-brand-blue/10 transition"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        title="Excluir"
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

      {/* Modal de Cadastro / Edição */}
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
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-offwhite">
                  {editingVendor ? "Editar Vendedor" : "Novo Vendedor"}
                </h3>
                <p className="text-xs text-brand-offwhite/60">
                  Configure os dados, cor de identificação nas rotas, veículo e metas.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveVendor} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                    placeholder="Ex: Alisson da Silva"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                    placeholder="vendedor@luke.com"
                  />
                </div>
              </div>

              {/* Seletor de Cor do Vendedor */}
              <div className="p-3.5 bg-brand-black/60 rounded-xl border border-brand-blue/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-1.5 text-xs font-bold text-brand-gold uppercase tracking-wider">
                    <Palette size={14} />
                    <span>Cor de Identificação no Sistema & Rotas</span>
                  </label>
                  <VendorBadge
                    vendorName={formData.name || "Preview"}
                    color={formData.color}
                    size="xs"
                    variant="solid"
                  />
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {VENDOR_COLOR_PALETTE.map((c) => {
                    const isSelected = formData.color === c.hex;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: c.hex })}
                        style={{ backgroundColor: c.hex }}
                        className={`h-8 rounded-lg flex items-center justify-center transition shadow-sm relative ${
                          isSelected
                            ? "ring-2 ring-white ring-offset-2 ring-offset-brand-graphite scale-105"
                            : "opacity-80 hover:opacity-100"
                        }`}
                        title={c.name}
                      >
                        {isSelected && <CheckCircle2 size={15} className="text-white drop-shadow" />}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <span className="text-[11px] text-brand-offwhite/50">Código Hex:</span>
                  <input
                    type="text"
                    value={formData.color || "#10b981"}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-28 px-2 py-1 bg-brand-black border border-brand-blue/40 rounded text-xs font-mono text-brand-offwhite uppercase"
                    placeholder="#10B981"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    WhatsApp (DDD + Número)
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                    placeholder="Ex: 31988887777"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Função
                  </label>
                  <select
                    value={formData.role || "VENDOR"}
                    onChange={(e: any) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  >
                    <option value="VENDOR">Vendedor de Rua</option>
                    <option value="ADMIN_VENDOR">Admin & Vendedor</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="SUPERVISOR">Supervisor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Veículo
                  </label>
                  <input
                    type="text"
                    value={formData.vehicle || ""}
                    onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                    placeholder="Ex: Fiat Strada"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Placa
                  </label>
                  <input
                    type="text"
                    value={formData.vehiclePlate || ""}
                    onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite font-mono uppercase focus:outline-none focus:border-brand-gold"
                    placeholder="HMN-8840"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Comissão (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.commissionRate || 8}
                    onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-emerald-400 font-bold focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Meta Mensal (R$)
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyTarget || 40000}
                    onChange={(e) => setFormData({ ...formData, monthlyTarget: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-gold font-bold focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              {/* Informação sobre Rotas Dinâmicas (Áudio 6) */}
              <div className="p-3 bg-brand-blue/10 border border-brand-blue/30 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-brand-offwhite/90">
                    Prefixos ou Rotas Habituais (Opcional)
                  </label>
                  <span className="text-[10px] text-brand-gold font-semibold uppercase">Gestão Dinâmica</span>
                </div>
                <input
                  type="text"
                  value={Array.isArray(formData.assignedRoutes) ? formData.assignedRoutes.join(", ") : formData.assignedRoutes || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      assignedRoutes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite focus:outline-none focus:border-brand-gold font-mono"
                  placeholder="Ex: R (Rotas R1 a R12), F, REP"
                />
                <p className="text-[11px] text-brand-offwhite/50">
                  💡 A atribuição de dias específicos e rotas é realizada dinamicamente através da <strong>Gestão de Rotas</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                  Observações
                </label>
                <textarea
                  rows={2}
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  placeholder="Informações de suporte..."
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
                  Salvar Vendedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
