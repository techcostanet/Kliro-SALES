"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Shield,
  User,
  Phone,
  Truck,
  DollarSign,
  MapPin,
  CheckCircle2,
  X,
  RefreshCw,
  Users,
  Target,
} from "lucide-react";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface VendorItem {
  id: string;
  name: string;
  email: string;
  role: "VENDOR" | "ADMIN_VENDOR" | "ADMIN" | "SUPERVISOR";
  phone: string;
  vehicle: string;
  vehiclePlate: string;
  commissionRate: number;
  assignedRoutes: string[];
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
    vehicle: "Chevrolet Montana",
    vehiclePlate: "HMN-8840",
    commissionRate: 8.0,
    assignedRoutes: ["R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8", "R9", "R10", "R11", "R12"],
    monthlyTarget: 45000.0,
    status: "ACTIVE",
    notes: "Vendedor de rota principal LUKE Brasil.",
  },
  {
    id: "usr-002",
    name: "Alexandre",
    email: "alexandre@luke.com",
    role: "VENDOR",
    phone: "(31) 99123-5566",
    vehicle: "Renault Clio Express",
    vehiclePlate: "KLU-9921",
    commissionRate: 8.0,
    assignedRoutes: ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"],
    monthlyTarget: 40000.0,
    status: "ACTIVE",
    notes: "Atendimento rotas F.",
  },
  {
    id: "usr-003",
    name: "Lucas",
    email: "lucas@luke.com",
    role: "ADMIN_VENDOR",
    phone: "(31) 98888-0001",
    vehicle: "Fiat Strada Freedom",
    vehiclePlate: "LUK-2025",
    commissionRate: 10.0,
    assignedRoutes: ["R1", "R2", "F1", "Representante"],
    monthlyTarget: 50000.0,
    status: "ACTIVE",
    notes: "Diretor Comercial e Vendedor.",
  },
  {
    id: "usr-004",
    name: "Sabrina",
    email: "sabrina@luke.com",
    role: "ADMIN",
    phone: "(31) 97777-1111",
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
    phone: "(31) 99999-9999",
    vehicle: "Veículo Comercial",
    vehiclePlate: "ABC-1234",
    commissionRate: 8.0,
    assignedRoutes: ["R1", "R2"],
    monthlyTarget: 35000.0,
    status: "ACTIVE",
    notes: "",
  });

  const tenantId = "tenant_luke_001";

  // Carrega do Firestore se disponível
  const fetchVendorsFromFirestore = async () => {
    try {
      setLoadingFirestore(true);
      const snapshot = await getDocs(collection(db, `tenants/${tenantId}/users`));
      if (!snapshot.empty) {
        const loaded: VendorItem[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push({ id: docSnap.id, ...docSnap.data() } as VendorItem);
        });
        setVendors(loaded);
      }
    } catch (err: any) {
      console.warn("Firestore fetch offline/fallback para initial vendors:", err.message);
    } finally {
      setLoadingFirestore(false);
    }
  };

  useEffect(() => {
    fetchVendorsFromFirestore();
  }, []);

  // Sincronizar todos no Firestore
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
      setSyncMessage("✅ Equipe comercial sincronizada com o Firestore com sucesso!");
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (err: any) {
      setSyncMessage(`❌ Erro ao sincronizar: ${err.message}`);
    } finally {
      setLoadingFirestore(false);
    }
  };

  const filtered = vendors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.phone.includes(searchTerm) ||
      v.vehicle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      selectedRoleFilter === "ALL" || v.role === selectedRoleFilter;

    return matchesSearch && matchesRole;
  });

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
        phone: "(31) 98888-0000",
        vehicle: "Fiat Strada",
        vehiclePlate: "LUK-1234",
        commissionRate: 8.0,
        assignedRoutes: ["R1", "R2"],
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
      phone: formData.phone || "(31) 99999-9999",
      vehicle: formData.vehicle || "Veículo Comercial",
      vehiclePlate: formData.vehiclePlate || "---",
      commissionRate: Number(formData.commissionRate || 8),
      assignedRoutes: Array.isArray(formData.assignedRoutes)
        ? formData.assignedRoutes
        : [formData.assignedRoutes || "R1"],
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
    if (confirm("Deseja realmente remover este vendedor da equipe comercial?")) {
      setVendors((prev) => prev.filter((v) => v.id !== id));
      try {
        await deleteDoc(doc(db, `tenants/${tenantId}/users`, id));
      } catch (e) {}
    }
  };

  const totalTarget = vendors.reduce((acc, curr) => acc + (curr.monthlyTarget || 0), 0);
  const activeVendors = vendors.filter((v) => v.status === "ACTIVE").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-extrabold text-brand-offwhite">Equipe Comercial</h2>
            <span className="bg-brand-gold/20 text-brand-gold text-xs px-2.5 py-1 rounded-full font-bold border border-brand-gold/30">
              {vendors.length} integrantes
            </span>
          </div>
          <p className="text-brand-offwhite/60 text-sm mt-1">
            Gestão completa de vendedores de rua, comissões, rotas e supervisão da LUKE Brasil.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={handleSyncFirestore}
            disabled={loadingFirestore}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-brand-blue/40 border border-brand-gold/40 text-brand-offwhite hover:bg-brand-blue/60 px-4 py-2.5 rounded-xl font-semibold transition text-sm shadow-md"
            title="Sincronizar equipe com o Firestore"
          >
            <RefreshCw size={16} className={loadingFirestore ? "animate-spin text-brand-gold" : "text-brand-gold"} />
            <span>Sincronizar Firestore</span>
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-brand-gold text-brand-black px-4 py-2.5 rounded-xl font-extrabold hover:bg-yellow-500 transition shadow-lg text-sm"
          >
            <Plus size={18} />
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
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Equipe Ativa</span>
            <Users size={18} className="text-green-400" />
          </div>
          <p className="text-2xl font-black text-green-400 mt-2">{activeVendors} vendedores</p>
          <span className="text-[11px] text-brand-offwhite/50">Atuando em campo e base</span>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Veículos em Rota</span>
            <Truck size={18} className="text-brand-gold" />
          </div>
          <p className="text-2xl font-black text-brand-offwhite mt-2">
            {vendors.filter((v) => v.vehiclePlate !== "---").length} veículos
          </p>
          <span className="text-[11px] text-brand-gold font-medium">Abastecidos com estoque</span>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Meta Mensal Total</span>
            <Target size={18} className="text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-400 mt-2">
            R$ {totalTarget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
              placeholder="Buscar por nome, e-mail ou veículo..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="bg-brand-black border border-brand-blue/50 text-brand-offwhite text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-gold"
            >
              <option value="ALL">Todos os Cargos</option>
              <option value="VENDOR">Vendedores de Campo</option>
              <option value="ADMIN_VENDOR">Admin & Vendedor</option>
              <option value="ADMIN">Administração Base</option>
              <option value="SUPERVISOR">Supervisores</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-blue/10 border-b border-brand-blue/30 text-brand-offwhite/70 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Nome & Contato</th>
                <th className="p-4 font-medium">Cargo / Função</th>
                <th className="p-4 font-medium">Veículo & Placa</th>
                <th className="p-4 font-medium">Rotas Atribuídas</th>
                <th className="p-4 font-medium">Comissão</th>
                <th className="p-4 font-medium">Meta Mensal</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-blue/10 text-sm">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-brand-blue/5 transition group">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-brand-blue/30 border border-brand-blue/50 flex items-center justify-center text-brand-gold shrink-0">
                        {user.role === "ADMIN" || user.role === "ADMIN_VENDOR" ? (
                          <Shield size={18} />
                        ) : (
                          <User size={18} />
                        )}
                      </div>
                      <div>
                        <p className="text-brand-offwhite font-bold">{user.name}</p>
                        <p className="text-xs text-brand-offwhite/50">{user.email}</p>
                        <p className="text-[11px] text-brand-gold flex items-center space-x-1 mt-0.5">
                          <Phone size={10} />
                          <span>{user.phone}</span>
                        </p>
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
                        : "Vendedor de Rua"}
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
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      {user.assignedRoutes.slice(0, 4).map((r) => (
                        <span
                          key={r}
                          className="px-1.5 py-0.5 bg-brand-black text-brand-offwhite/80 text-[10px] rounded border border-brand-blue/30 font-mono"
                        >
                          {r}
                        </span>
                      ))}
                      {user.assignedRoutes.length > 4 && (
                        <span className="text-[10px] text-brand-gold font-bold">
                          +{user.assignedRoutes.length - 4}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-4 font-mono font-bold text-emerald-400 text-xs">
                    {user.commissionRate > 0 ? `${user.commissionRate.toFixed(1)}%` : "Fixo"}
                  </td>

                  <td className="p-4 font-bold text-brand-offwhite text-xs">
                    {user.monthlyTarget > 0
                      ? `R$ ${user.monthlyTarget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                      : "---"}
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
              ))}
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
                  {editingVendor ? "Editar Vendedor / Integrante" : "Cadastrar Novo Vendedor"}
                </h3>
                <p className="text-xs text-brand-offwhite/60">
                  Defina os acessos, veículo, rotas de atendimento e comissões.
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
                    E-mail de Acesso
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                    placeholder="(31) 98888-7777"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Cargo / Função
                  </label>
                  <select
                    value={formData.role || "VENDOR"}
                    onChange={(e: any) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  >
                    <option value="VENDOR">Vendedor de Rua (Modo Rua)</option>
                    <option value="ADMIN_VENDOR">Admin & Vendedor</option>
                    <option value="ADMIN">Administrador Geral</option>
                    <option value="SUPERVISOR">Supervisor Comercial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Veículo de Entrega
                  </label>
                  <input
                    type="text"
                    value={formData.vehicle || ""}
                    onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                    placeholder="Ex: Fiat Strada Freedom"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Placa do Veículo
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

              <div>
                <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                  Rotas Atendidas (Separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={Array.isArray(formData.assignedRoutes) ? formData.assignedRoutes.join(", ") : formData.assignedRoutes || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      assignedRoutes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold font-mono"
                  placeholder="Ex: R1, R2, R3, R4"
                />
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
                  placeholder="Informações de suporte, observações de rota..."
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
