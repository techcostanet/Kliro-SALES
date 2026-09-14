"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Settings,
  Users,
  CreditCard,
  Map,
  History,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Shield,
  Lock,
  Unlock,
  Eye,
  Calendar,
  Filter,
  Check,
  Building2,
  RefreshCw,
  RotateCcw,
  Phone,
  Mail,
  UserCheck,
  AlertCircle,
  Cloud,
} from "lucide-react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import NumberInput from "@/components/NumberInput";
import {
  ALL_MENU_KEYS,
  ROLE_PRESETS,
  UserPermissions,
  UserRole,
  MenuPermissionKey,
} from "@/lib/permissionsContext";
import { logActivity, ActivityLogItem } from "@/lib/activityLogger";
import { formatDateTimeBR, maskPhone, formatNumberBR } from "@/lib/formatters";
import ToastFeedback, { ToastMessage } from "@/components/ToastFeedback";
import {
  MASTER_ROUTES_CATALOG,
  RouteMaster,
  ensureRoutesSeeded,
  seedAllDefaultRoutes,
  mergeRoutesWithCatalog,
} from "@/lib/routesCatalog";

// ==========================================
// INTERFACES
// ==========================================
export interface SystemUserItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: "ACTIVE" | "INACTIVE";
  permissions: UserPermissions;
  allowedPaymentTerms: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentTermItem {
  id: string;
  name: string;
  type: "A_VISTA" | "PRAZO" | "CONSIGNADO" | "MISTO" | "OUTRO";
  days: string;
  active: boolean;
  notes?: string;
  createdAt?: string;
}

export interface ManagedRouteItem {
  id: string;
  code: string;
  name: string;
  prefix: "R" | "F" | "G" | "Y" | "ESPECIAL" | "OUTROS";
  defaultVendorName?: string;
  targetClientsCount: number;
  estimatedRevenue: number;
  region: string;
  active: boolean;
}

const INITIAL_PAYMENT_TERMS: PaymentTermItem[] = [
  { id: "pt-1", name: "À Vista (Dinheiro / PIX)", type: "A_VISTA", days: "0", active: true, notes: "Pagamento imediato na entrega" },
  { id: "pt-2", name: "Prazo 15 Dias", type: "PRAZO", days: "15", active: true, notes: "Boleto ou P.A. 15 dias" },
  { id: "pt-3", name: "Prazo 30 Dias", type: "PRAZO", days: "30", active: true, notes: "Boleto ou P.A. padrão mensal" },
  { id: "pt-4", name: "Prazo 14/28 Dias", type: "PRAZO", days: "14, 28", active: true, notes: "Duas parcelas quinzenais" },
  { id: "pt-5", name: "Consignado", type: "CONSIGNADO", days: "30", active: true, notes: "Acerto de estoque na próxima visita" },
  { id: "pt-6", name: "Consignado + À Vista", type: "MISTO", days: "0, 30", active: true, notes: "Parte imediata e restante consignado" },
  { id: "pt-7", name: "Compra Lâmina", type: "OUTRO", days: "0", active: true, notes: "Condição promocional específica" },
  { id: "pt-8", name: "Intermitente", type: "OUTRO", days: "0", active: true, notes: "Negociação flexível de campo" },
];

const INITIAL_USERS: SystemUserItem[] = [
  {
    id: "usr-admin-01",
    name: "Lucas (Administrador Geral)",
    email: "lucas@luke.com",
    phone: "(31) 98888-0001",
    role: "ADMIN",
    status: "ACTIVE",
    permissions: ROLE_PRESETS.ADMIN,
    allowedPaymentTerms: ["pt-1", "pt-2", "pt-3", "pt-4", "pt-5", "pt-6", "pt-7", "pt-8"],
  },
  {
    id: "usr-vendor-alisson",
    name: "Alisson (Vendedor R)",
    email: "alisson@luke.com",
    phone: "(31) 98744-1234",
    role: "VENDEDOR",
    status: "ACTIVE",
    permissions: ROLE_PRESETS.VENDEDOR,
    allowedPaymentTerms: ["pt-1", "pt-2", "pt-3", "pt-5", "pt-6"],
  },
  {
    id: "usr-vendor-alexandre",
    name: "Alexandre (Vendedor F)",
    email: "alexandre@luke.com",
    phone: "(31) 98755-5678",
    role: "VENDEDOR",
    status: "ACTIVE",
    permissions: ROLE_PRESETS.VENDEDOR,
    allowedPaymentTerms: ["pt-1", "pt-2", "pt-3", "pt-5", "pt-6"],
  },
];

export default function LukeConfiguracoesPage() {
  const tenantId = "tenant_luke_001";

  // Tab State
  const [activeTab, setActiveTab] = useState<"USERS" | "PAYMENT_TERMS" | "ROUTES" | "LOGS">("USERS");

  // Toast State
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // ----------------------------------------------------
  // TAB 1: GESTÃO DE USUÁRIOS & PERMISSÕES
  // ----------------------------------------------------
  const [users, setUsers] = useState<SystemUserItem[]>(INITIAL_USERS);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUserItem | null>(null);
  const [userFormData, setUserFormData] = useState<Partial<SystemUserItem>>({
    name: "",
    email: "",
    phone: "",
    role: "VENDEDOR",
    status: "ACTIVE",
    permissions: ROLE_PRESETS.VENDEDOR,
    allowedPaymentTerms: ["pt-1", "pt-2", "pt-3"],
  });

  // ----------------------------------------------------
  // TAB 2: CONDIÇÕES DE PAGAMENTO
  // ----------------------------------------------------
  const [paymentTerms, setPaymentTerms] = useState<PaymentTermItem[]>(INITIAL_PAYMENT_TERMS);
  const [ptModalOpen, setPtModalOpen] = useState(false);
  const [editingPt, setEditingPt] = useState<PaymentTermItem | null>(null);
  const [ptFormData, setPtFormData] = useState<Partial<PaymentTermItem>>({
    name: "",
    type: "PRAZO",
    days: "30",
    active: true,
    notes: "",
  });

  // ----------------------------------------------------
  // TAB 3: ADMINISTRAÇÃO DE ROTAS
  // ----------------------------------------------------
  const [routes, setRoutes] = useState<ManagedRouteItem[]>(() =>
    MASTER_ROUTES_CATALOG.map((r) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      prefix: r.prefix,
      defaultVendorName: r.defaultVendorName || "Alisson",
      targetClientsCount: r.targetClientsCount || 20,
      estimatedRevenue: r.estimatedRevenue || 4500,
      region: r.region || "Geral",
      active: r.active ?? true,
    }))
  );
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<ManagedRouteItem | null>(null);
  const [routeFormData, setRouteFormData] = useState<Partial<ManagedRouteItem>>({
    code: "",
    name: "",
    prefix: "R",
    defaultVendorName: "Alisson",
    targetClientsCount: 20,
    estimatedRevenue: 4500,
    region: "",
    active: true,
  });
  const [restoringRoutes, setRestoringRoutes] = useState(false);

  // ----------------------------------------------------
  // TAB 4: LOGS DE ATIVIDADES DO SISTEMA
  // ----------------------------------------------------
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [logSearch, setLogSearch] = useState("");
  const [logEntityFilter, setLogEntityFilter] = useState("ALL");
  const [logLoading, setLogLoading] = useState(false);

  // ----------------------------------------------------
  // CARREGAR DADOS DO FIRESTORE
  // ----------------------------------------------------
  const loadAllData = async () => {
    try {
      // 1. Usuários
      const userSnap = await getDocs(collection(db, `tenants/${tenantId}/users`));
      if (!userSnap.empty) {
        const loadedUsers: SystemUserItem[] = [];
        userSnap.forEach((d) => {
          loadedUsers.push({ id: d.id, ...d.data() } as SystemUserItem);
        });
        setUsers(loadedUsers);
      }

      // 2. Condições de Pagamento
      const ptSnap = await getDocs(collection(db, `tenants/${tenantId}/payment_terms`));
      if (!ptSnap.empty) {
        const loadedPt: PaymentTermItem[] = [];
        ptSnap.forEach((d) => {
          loadedPt.push({ id: d.id, ...d.data() } as PaymentTermItem);
        });
        setPaymentTerms(loadedPt);
      }

      // 3. Rotas: Garante auto-seeding do catálogo mestre e preservação total de rotas customizadas
      const fullRoutes = await ensureRoutesSeeded(tenantId, db);
      if (fullRoutes && fullRoutes.length > 0) {
        setRoutes(fullRoutes);
      }

      // 4. Logs
      fetchLogs();
    } catch (err: any) {
      console.warn("Carregamento de configurações offline/fallback:", err?.message);
    }
  };

  const fetchLogs = async () => {
    try {
      setLogLoading(true);
      const q = query(
        collection(db, `tenants/${tenantId}/activity_logs`),
        orderBy("timestamp", "desc"),
        limit(100)
      );
      const snap = await getDocs(q);
      const loadedLogs: ActivityLogItem[] = [];
      snap.forEach((d) => {
        loadedLogs.push({ id: d.id, ...d.data() } as ActivityLogItem);
      });
      setLogs(loadedLogs);
    } catch (e: any) {
      console.warn("Erro ao buscar logs:", e?.message);
    } finally {
      setLogLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // ----------------------------------------------------
  // HANDLERS: USUÁRIOS
  // ----------------------------------------------------
  const handleOpenUserModal = (usr?: SystemUserItem) => {
    if (usr) {
      setEditingUser(usr);
      setUserFormData({
        ...usr,
        permissions: usr.permissions || ROLE_PRESETS[usr.role] || ROLE_PRESETS.VENDEDOR,
        allowedPaymentTerms: usr.allowedPaymentTerms || [],
      });
    } else {
      setEditingUser(null);
      setUserFormData({
        name: "",
        email: "",
        phone: "",
        role: "VENDEDOR",
        status: "ACTIVE",
        permissions: ROLE_PRESETS.VENDEDOR,
        allowedPaymentTerms: ["pt-1", "pt-2", "pt-3"],
      });
    }
    setUserModalOpen(true);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setUserFormData((prev) => ({
      ...prev,
      role: newRole,
      permissions: ROLE_PRESETS[newRole] || prev.permissions,
    }));
  };

  const handlePermissionToggle = (key: MenuPermissionKey) => {
    setUserFormData((prev) => {
      const current = prev.permissions || ROLE_PRESETS.CUSTOM;
      return {
        ...prev,
        role: "CUSTOM",
        permissions: {
          ...current,
          [key]: !current[key],
        },
      };
    });
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.name?.trim() || !userFormData.email?.trim()) {
      alert("Por favor, informe ao menos o Nome e E-mail do usuário.");
      return;
    }

    const userId = editingUser?.id || `usr-${Date.now()}`;
    const userPayload: SystemUserItem = {
      id: userId,
      name: userFormData.name.trim(),
      email: userFormData.email.trim().toLowerCase(),
      phone: userFormData.phone || "",
      role: userFormData.role || "VENDEDOR",
      status: userFormData.status || "ACTIVE",
      permissions: userFormData.permissions || ROLE_PRESETS.VENDEDOR,
      allowedPaymentTerms: userFormData.allowedPaymentTerms || [],
      updatedAt: new Date().toISOString(),
      createdAt: editingUser?.createdAt || new Date().toISOString(),
    };

    setIsSaving(true);
    try {
      await setDoc(doc(db, `tenants/${tenantId}/users`, userId), userPayload);

      if (editingUser) {
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? userPayload : u)));
      } else {
        setUsers((prev) => [userPayload, ...prev]);
      }

      await logActivity(tenantId, {
        userName: "Administrador",
        userEmail: "admin@luke.com",
        action: editingUser ? "USUARIO_EDITADO" : "USUARIO_CRIADO",
        entity: "USUARIO",
        entityId: userId,
        details: `${editingUser ? "Editou" : "Cadastrou"} usuário ${userPayload.name} (${userPayload.role}) com permissões personalizadas.`,
      });

      setUserModalOpen(false);
      setToast({
        type: "cloud_success",
        title: editingUser ? "Usuário Atualizado na Nuvem!" : "Usuário Cadastrado na Nuvem!",
        message: `${userPayload.name} foi salvo e sincronizado no Firestore com sucesso.`,
        isCloud: true,
      });
      fetchLogs();
    } catch (err: any) {
      console.error("Erro ao salvar usuário no Firestore:", err);
      setToast({
        type: "cloud_error",
        title: "Falha ao Salvar Usuário na Nuvem",
        message: err?.message || "Não foi possível gravar o usuário no banco de dados.",
        isCloud: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (usr: SystemUserItem) => {
    if (!confirm(`Deseja realmente excluir o usuário "${usr.name}"?`)) return;
    try {
      await deleteDoc(doc(db, `tenants/${tenantId}/users`, usr.id));
      setUsers((prev) => prev.filter((u) => u.id !== usr.id));
      await logActivity(tenantId, {
        userName: "Administrador",
        userEmail: "admin@luke.com",
        action: "USUARIO_EXCLUIDO",
        entity: "USUARIO",
        entityId: usr.id,
        details: `Excluiu o usuário ${usr.name} do sistema.`,
      });
      setToast({
        type: "info",
        title: "Usuário Excluído",
        message: `${usr.name} foi removido do cadastro.`,
      });
      fetchLogs();
    } catch (err: any) {
      console.error("Erro ao excluir usuário no Firestore:", err);
      setToast({
        type: "error",
        title: "Erro ao Excluir",
        message: err?.message || "Não foi possível remover o usuário do banco de dados.",
      });
    }
  };

  // ----------------------------------------------------
  // HANDLERS: CONDIÇÕES DE PAGAMENTO
  // ----------------------------------------------------
  const handleOpenPtModal = (pt?: PaymentTermItem) => {
    if (pt) {
      setEditingPt(pt);
      setPtFormData({ ...pt });
    } else {
      setEditingPt(null);
      setPtFormData({
        name: "",
        type: "PRAZO",
        days: "30",
        active: true,
        notes: "",
      });
    }
    setPtModalOpen(true);
  };

  const handleSavePt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ptFormData.name?.trim()) return;

    const ptId = editingPt?.id || `pt-${Date.now()}`;
    const payload: PaymentTermItem = {
      id: ptId,
      name: ptFormData.name.trim(),
      type: ptFormData.type || "PRAZO",
      days: ptFormData.days || "0",
      active: ptFormData.active ?? true,
      notes: ptFormData.notes || "",
      createdAt: editingPt?.createdAt || new Date().toISOString(),
    };

    setIsSaving(true);
    try {
      await setDoc(doc(db, `tenants/${tenantId}/payment_terms`, ptId), payload);

      if (editingPt) {
        setPaymentTerms((prev) => prev.map((p) => (p.id === editingPt.id ? payload : p)));
      } else {
        setPaymentTerms((prev) => [...prev, payload]);
      }

      await logActivity(tenantId, {
        userName: "Administrador",
        userEmail: "admin@luke.com",
        action: editingPt ? "CONDICAO_PAGTO_EDITADA" : "CONDICAO_PAGTO_CRIADA",
        entity: "CONDICAO_PAGTO",
        entityId: ptId,
        details: `${editingPt ? "Editou" : "Criou"} condição de pagamento "${payload.name}" (${payload.type}).`,
      });

      setPtModalOpen(false);
      setToast({
        type: "cloud_success",
        title: editingPt ? "Condição Atualizada na Nuvem!" : "Condição Criada na Nuvem!",
        message: `"${payload.name}" foi salva e sincronizada no Firestore com sucesso.`,
        isCloud: true,
      });
      fetchLogs();
    } catch (err: any) {
      console.error("Erro ao salvar condição de pagamento:", err);
      setToast({
        type: "cloud_error",
        title: "Falha ao Salvar na Nuvem",
        message: err?.message || "Não foi possível gravar a condição no banco de dados.",
        isCloud: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePt = async (pt: PaymentTermItem) => {
    if (!confirm(`Deseja realmente excluir a condição "${pt.name}"?`)) return;
    try {
      await deleteDoc(doc(db, `tenants/${tenantId}/payment_terms`, pt.id));
      setPaymentTerms((prev) => prev.filter((p) => p.id !== pt.id));
      await logActivity(tenantId, {
        userName: "Administrador",
        userEmail: "admin@luke.com",
        action: "CONDICAO_PAGTO_EXCLUIDA",
        entity: "CONDICAO_PAGTO",
        entityId: pt.id,
        details: `Excluiu a condição de pagamento "${pt.name}".`,
      });
      setToast({
        type: "cloud_success",
        title: "Condição Excluída da Nuvem",
        message: `"${pt.name}" foi removida do banco de dados Firestore.`,
        isCloud: true,
      });
      fetchLogs();
    } catch (err: any) {
      setToast({
        type: "cloud_error",
        title: "Erro ao Excluir na Nuvem",
        message: err?.message || "Não foi possível remover a condição.",
        isCloud: true,
      });
    }
  };

  // ----------------------------------------------------
  // HANDLERS: ROTAS
  // ----------------------------------------------------
  const handleOpenRouteModal = (rt?: ManagedRouteItem) => {
    if (rt) {
      setEditingRoute(rt);
      setRouteFormData({ ...rt });
    } else {
      setEditingRoute(null);
      setRouteFormData({
        code: "",
        name: "",
        prefix: "R",
        defaultVendorName: "Alisson",
        targetClientsCount: 20,
        estimatedRevenue: 4500,
        region: "",
        active: true,
      });
    }
    setRouteModalOpen(true);
  };

  const handleSaveRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeFormData.code?.trim() || !routeFormData.name?.trim()) {
      alert("Por favor, informe Código e Nome da Rota.");
      return;
    }

    const routeId = editingRoute?.id || `route-${routeFormData.code?.toLowerCase().replace(/\s+/g, "-")}`;
    const payload: ManagedRouteItem = {
      id: routeId,
      code: routeFormData.code.trim().toUpperCase(),
      name: routeFormData.name.trim(),
      prefix: (routeFormData.prefix as any) || "R",
      defaultVendorName: routeFormData.defaultVendorName || "Alisson",
      targetClientsCount: Number(routeFormData.targetClientsCount || 20),
      estimatedRevenue: Number(routeFormData.estimatedRevenue || 4500),
      region: routeFormData.region || "Geral",
      active: routeFormData.active ?? true,
    };

    setIsSaving(true);
    try {
      await setDoc(doc(db, `tenants/${tenantId}/routes`, routeId), payload, { merge: true });

      if (editingRoute) {
        setRoutes((prev) => prev.map((r) => (r.id === editingRoute.id ? payload : r)));
      } else {
        setRoutes((prev) => {
          const withoutCurrent = prev.filter((r) => r.id !== payload.id && r.code !== payload.code);
          return [...withoutCurrent, payload].sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
        });
      }

      await logActivity(tenantId, {
        userName: "Administrador",
        userEmail: "admin@luke.com",
        action: editingRoute ? "ROTA_EDITADA" : "ROTA_CRIADA",
        entity: "ROTA",
        entityId: routeId,
        details: `${editingRoute ? "Editou" : "Cadastrou nova"} rota ${payload.code} - ${payload.name} (Vendedor: ${payload.defaultVendorName}).`,
      });

      setRouteModalOpen(false);
      setToast({
        type: "cloud_success",
        title: editingRoute ? "Rota Atualizada na Nuvem!" : "Nova Rota Cadastrada na Nuvem!",
        message: `${payload.code} - ${payload.name} foi salva e sincronizada no Firestore com sucesso.`,
        isCloud: true,
      });
      fetchLogs();
    } catch (err: any) {
      console.error("Erro ao salvar rota no Firestore:", err);
      setToast({
        type: "cloud_error",
        title: "Falha ao Salvar Rota na Nuvem",
        message: err?.message || "Não foi possível persistir a rota no banco de dados.",
        isCloud: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreDefaultRoutes = async () => {
    if (
      !confirm(
        "Deseja restaurar e sincronizar o catálogo padrão de rotas no Firestore?\n\nIsso garantirá que todas as rotas fixas padrão estejam salvas no banco. As rotas customizadas que você cadastrou continuarão salvas."
      )
    ) {
      return;
    }
    try {
      setRestoringRoutes(true);
      const synced = await seedAllDefaultRoutes(tenantId, db);
      setRoutes(synced);
      setToast({
        type: "success",
        title: "Catálogo Sincronizado!",
        message: `${synced.length} rotas ativas sincronizadas no Firestore com sucesso.`,
      });
      await logActivity(tenantId, {
        userName: "Administrador",
        userEmail: "admin@luke.com",
        action: "ROTA_EDITADA",
        entity: "ROTA",
        entityId: "sync-catalog",
        details: "Restaurou/sincronizou catálogo mestre de rotas no Firestore.",
      });
      fetchLogs();
    } catch (err: any) {
      setToast({
        type: "error",
        title: "Erro na Sincronização",
        message: err?.message || "Não foi possível sincronizar as rotas.",
      });
    } finally {
      setRestoringRoutes(false);
    }
  };

  const handleDeleteRoute = async (rt: ManagedRouteItem) => {
    if (!confirm(`Deseja realmente excluir a rota "${rt.code} - ${rt.name}"?`)) return;
    try {
      await deleteDoc(doc(db, `tenants/${tenantId}/routes`, rt.id));
      setRoutes((prev) => prev.filter((r) => r.id !== rt.id));
      await logActivity(tenantId, {
        userName: "Administrador",
        userEmail: "admin@luke.com",
        action: "ROTA_EXCLUIDA",
        entity: "ROTA",
        entityId: rt.id,
        details: `Excluiu a rota ${rt.code} - ${rt.name} do sistema.`,
      });
      setToast({
        type: "info",
        title: "Rota Excluída",
        message: `A rota ${rt.code} foi removida.`,
      });
      fetchLogs();
    } catch (err: any) {
      console.error("Erro ao excluir rota no Firestore:", err);
      setToast({
        type: "error",
        title: "Erro ao Excluir",
        message: err?.message || "Não foi possível remover a rota do banco de dados.",
      });
    }
  };

  // ----------------------------------------------------
  // FILTRAGEM DE LOGS
  // ----------------------------------------------------
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchesText =
        l.details?.toLowerCase().includes(logSearch.toLowerCase()) ||
        l.userName?.toLowerCase().includes(logSearch.toLowerCase()) ||
        l.action?.toLowerCase().includes(logSearch.toLowerCase());
      const matchesEntity = logEntityFilter === "ALL" || l.entity === logEntityFilter;
      return matchesText && matchesEntity;
    });
  }, [logs, logSearch, logEntityFilter]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <ToastFeedback toast={toast} onClose={() => setToast(null)} />

      {/* Header do Módulo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-brand-gold/20 text-brand-gold rounded-xl border border-brand-gold/30">
              <Settings size={22} />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-brand-offwhite tracking-tight">
                Configurações do Sistema
              </h2>
              <p className="text-brand-offwhite/60 text-xs mt-0.5">
                Administração centralizada de usuários, perfis de permissão, rotas, condições comerciais e logs de auditoria.
              </p>
            </div>
          </div>
        </div>

        {/* Botão de Atualização Rápida */}
        <button
          onClick={loadAllData}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-brand-graphite border border-brand-blue/40 text-brand-offwhite/80 hover:text-brand-gold rounded-xl text-xs font-bold transition shadow-sm"
        >
          <RefreshCw size={14} />
          <span>Recarregar Dados</span>
        </button>
      </div>

      {/* Tabs de Navegação das Configurações */}
      <div className="flex border-b border-brand-blue/30 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("USERS")}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition whitespace-nowrap ${
            activeTab === "USERS"
              ? "border-brand-gold text-brand-gold bg-brand-gold/10 rounded-t-lg"
              : "border-transparent text-brand-offwhite/60 hover:text-brand-offwhite hover:border-brand-blue/40"
          }`}
        >
          <Users size={16} />
          <span>Usuários & Permissões ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("PAYMENT_TERMS")}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition whitespace-nowrap ${
            activeTab === "PAYMENT_TERMS"
              ? "border-brand-gold text-brand-gold bg-brand-gold/10 rounded-t-lg"
              : "border-transparent text-brand-offwhite/60 hover:text-brand-offwhite hover:border-brand-blue/40"
          }`}
        >
          <CreditCard size={16} />
          <span>Condições de Pagamento ({paymentTerms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("ROUTES")}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition whitespace-nowrap ${
            activeTab === "ROUTES"
              ? "border-brand-gold text-brand-gold bg-brand-gold/10 rounded-t-lg"
              : "border-transparent text-brand-offwhite/60 hover:text-brand-offwhite hover:border-brand-blue/40"
          }`}
        >
          <Map size={16} />
          <span>Gestão de Rotas ({routes.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("LOGS");
            fetchLogs();
          }}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition whitespace-nowrap ${
            activeTab === "LOGS"
              ? "border-brand-gold text-brand-gold bg-brand-gold/10 rounded-t-lg"
              : "border-transparent text-brand-offwhite/60 hover:text-brand-offwhite hover:border-brand-blue/40"
          }`}
        >
          <History size={16} />
          <span>Logs de Atividades ({logs.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: USUÁRIOS E PERMISSÕES (REQUISITOS 1 E 3)                          */}
      {/* ========================================================================= */}
      {activeTab === "USERS" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-brand-graphite/60 p-4 rounded-xl border border-brand-blue/30">
            <div>
              <h3 className="text-sm font-black text-brand-offwhite">
                Cadastro de Usuários do SaaS
              </h3>
              <p className="text-xs text-brand-offwhite/60 mt-0.5">
                Controle de acesso por abas e menus, papéis (Admin, Gerente, Vendedor, Financeiro) e condições comerciais permitidas.
              </p>
            </div>
            <button
              onClick={() => handleOpenUserModal()}
              className="flex items-center space-x-1.5 bg-brand-gold text-brand-black px-4 py-2 rounded-xl text-xs font-black hover:bg-yellow-500 transition shadow-lg shrink-0"
            >
              <Plus size={15} />
              <span>Novo Usuário</span>
            </button>
          </div>

          <div className="bg-brand-graphite rounded-xl border border-brand-blue/30 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-brand-blue/20 border-b border-brand-blue/30 text-brand-offwhite/70 uppercase tracking-wider font-bold">
                    <th className="p-3.5">Nome / Usuário</th>
                    <th className="p-3.5">E-mail & Telefone</th>
                    <th className="p-3.5">Perfil de Acesso</th>
                    <th className="p-3.5">Abas Liberadas</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-blue/10">
                  {users.map((usr) => {
                    const activeCount = Object.values(usr.permissions || {}).filter(Boolean).length;
                    return (
                      <tr key={usr.id} className="hover:bg-brand-blue/5 transition">
                        <td className="p-3.5 font-bold text-brand-offwhite">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-brand-gold/20 text-brand-gold border border-brand-gold/30 flex items-center justify-center font-black">
                              {usr.name[0]?.toUpperCase() || "U"}
                            </div>
                            <span>{usr.name}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-brand-offwhite/70">
                          <p className="font-mono">{usr.email}</p>
                          <p className="text-[11px] text-brand-offwhite/40">{maskPhone(usr.phone) || "Sem telefone"}</p>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase border ${
                              usr.role === "ADMIN"
                                ? "bg-red-500/20 text-red-400 border-red-500/40"
                                : usr.role === "GERENTE"
                                ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                                : usr.role === "FINANCEIRO"
                                ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            }`}
                          >
                            {usr.role}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 bg-brand-black/60 rounded border border-brand-blue/40 text-[11px] font-mono font-bold text-brand-gold">
                            {activeCount} de {ALL_MENU_KEYS.length} abas
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              usr.status === "ACTIVE"
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-neutral-500/20 text-neutral-400 border border-neutral-500/30"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{usr.status === "ACTIVE" ? "Ativo" : "Inativo"}</span>
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleOpenUserModal(usr)}
                              className="p-1.5 text-brand-offwhite/70 hover:text-brand-gold hover:bg-brand-blue/20 rounded-lg transition"
                              title="Editar Usuário e Permissões"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(usr)}
                              className="p-1.5 text-brand-offwhite/50 hover:text-red-400 hover:bg-brand-blue/20 rounded-lg transition"
                              title="Excluir Usuário"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: CONDIÇÕES DE PAGAMENTO (REQUISITO 5)                               */}
      {/* ========================================================================= */}
      {activeTab === "PAYMENT_TERMS" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-brand-graphite/60 p-4 rounded-xl border border-brand-blue/30">
            <div>
              <h3 className="text-sm font-black text-brand-offwhite">
                Condições de Pagamento do Sistema
              </h3>
              <p className="text-xs text-brand-offwhite/60 mt-0.5">
                Crie, edite e organize as condições comerciais disponíveis para atribuição a clientes e autorização para vendedores.
              </p>
            </div>
            <button
              onClick={() => handleOpenPtModal()}
              className="flex items-center space-x-1.5 bg-brand-gold text-brand-black px-4 py-2 rounded-xl text-xs font-black hover:bg-yellow-500 transition shadow-lg shrink-0"
            >
              <Plus size={15} />
              <span>Nova Condição</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentTerms.map((pt) => (
              <div
                key={pt.id}
                className="bg-brand-graphite p-4 rounded-xl border border-brand-blue/30 hover:border-brand-gold/50 transition shadow-md flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-brand-offwhite text-sm">
                        {pt.name}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-brand-black/60 rounded border border-brand-blue/30 text-brand-gold font-bold mt-1 inline-block">
                        {pt.type} &bull; {pt.days === "0" ? "À Vista" : `${pt.days} dias`}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        pt.active
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : "bg-neutral-500/20 text-neutral-400 border-neutral-500/30"
                      }`}
                    >
                      {pt.active ? "Ativa" : "Inativa"}
                    </span>
                  </div>

                  {pt.notes && (
                    <p className="text-xs text-brand-offwhite/60 mt-2 italic">
                      "{pt.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-brand-blue/20">
                  <button
                    onClick={() => handleOpenPtModal(pt)}
                    className="flex items-center space-x-1 text-xs text-brand-offwhite/70 hover:text-brand-gold px-2 py-1 rounded transition"
                  >
                    <Edit2 size={13} />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDeletePt(pt)}
                    className="flex items-center space-x-1 text-xs text-brand-offwhite/50 hover:text-red-400 px-2 py-1 rounded transition"
                  >
                    <Trash2 size={13} />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: ADMINISTRAÇÃO DE NOVAS ROTAS (REQUISITO 6)                         */}
      {/* ========================================================================= */}
      {activeTab === "ROUTES" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-brand-graphite/60 p-4 rounded-xl border border-brand-blue/30">
            <div>
              <h3 className="text-sm font-black text-brand-offwhite">
                Cadastro e Gestão de Rotas
              </h3>
              <p className="text-xs text-brand-offwhite/60 mt-0.5">
                Criação de novas rotas, edição de nomenclaturas, vinculação de vendedores, inativação e exclusão.
              </p>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={handleRestoreDefaultRoutes}
                disabled={restoringRoutes}
                title="Sincroniza e restaura todas as rotas fixas padrão no Firestore, preservando as customizadas"
                className="flex items-center space-x-1.5 bg-brand-blue/30 text-brand-offwhite border border-brand-blue/50 hover:bg-brand-blue/50 px-3.5 py-2 rounded-xl text-xs font-bold transition disabled:opacity-50"
              >
                <RotateCcw size={14} className={restoringRoutes ? "animate-spin text-brand-gold" : "text-brand-offwhite/70"} />
                <span>{restoringRoutes ? "Sincronizando..." : "Restaurar Catálogo Padrão"}</span>
              </button>
              <button
                onClick={() => handleOpenRouteModal()}
                className="flex items-center space-x-1.5 bg-brand-gold text-brand-black px-4 py-2 rounded-xl text-xs font-black hover:bg-yellow-500 transition shadow-lg shrink-0"
              >
                <Plus size={15} />
                <span>Nova Rota</span>
              </button>
            </div>
          </div>

          <div className="bg-brand-graphite rounded-xl border border-brand-blue/30 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-brand-blue/20 border-b border-brand-blue/30 text-brand-offwhite/70 uppercase tracking-wider font-bold">
                    <th className="p-3.5">Código</th>
                    <th className="p-3.5">Nome da Rota</th>
                    <th className="p-3.5">Vendedor Padrão</th>
                    <th className="p-3.5">Região / Bairros</th>
                    <th className="p-3.5">Clientes Meta</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-blue/10">
                  {routes.map((rt) => (
                    <tr key={rt.id} className="hover:bg-brand-blue/5 transition">
                      <td className="p-3.5 font-mono font-bold text-brand-gold">
                        <span className="px-2 py-0.5 bg-brand-blue/30 rounded border border-brand-gold/30">
                          {rt.code}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-brand-offwhite">
                        {rt.name}
                      </td>
                      <td className="p-3.5 text-brand-offwhite/80">
                        {rt.defaultVendorName}
                      </td>
                      <td className="p-3.5 text-brand-offwhite/60">
                        {rt.region || "Geral"}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-brand-offwhite/80">
                        {rt.targetClientsCount} clientes
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            rt.active
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-neutral-500/20 text-neutral-400 border-neutral-500/30"
                          }`}
                        >
                          {rt.active ? "Ativa" : "Inativa"}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenRouteModal(rt)}
                            className="p-1.5 text-brand-offwhite/70 hover:text-brand-gold hover:bg-brand-blue/20 rounded-lg transition"
                            title="Editar Rota"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteRoute(rt)}
                            className="p-1.5 text-brand-offwhite/50 hover:text-red-400 hover:bg-brand-blue/20 rounded-lg transition"
                            title="Excluir Rota"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 4: LOGS DE ATIVIDADES DO SISTEMA (REQUISITO 2)                        */}
      {/* ========================================================================= */}
      {activeTab === "LOGS" && (
        <div className="space-y-4">
          {/* Barra de Filtro de Logs */}
          <div className="bg-brand-graphite p-4 rounded-xl border border-brand-blue/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-brand-offwhite/40" size={15} />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Buscar por usuário, ação ou detalhe do log..."
                className="w-full pl-9 pr-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={logEntityFilter}
                onChange={(e) => setLogEntityFilter(e.target.value)}
                className="bg-brand-black border border-brand-blue/40 text-brand-offwhite text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-brand-gold"
              >
                <option value="ALL">Todas as Entidades</option>
                <option value="CLIENTE">Clientes</option>
                <option value="ROTA">Rotas</option>
                <option value="USUARIO">Usuários</option>
                <option value="CONDICAO_PAGTO">Condições Pagto</option>
                <option value="PRODUTO">Produtos</option>
                <option value="TRANSACAO">Transações</option>
                <option value="FINANCEIRO">Financeiro</option>
              </select>

              <button
                onClick={fetchLogs}
                className="p-2 bg-brand-black border border-brand-blue/40 text-brand-offwhite/70 hover:text-brand-gold rounded-lg transition"
                title="Recarregar Logs"
              >
                <RefreshCw size={15} className={logLoading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Tabela de Auditoria de Logs */}
          <div className="bg-brand-graphite rounded-xl border border-brand-blue/30 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-brand-blue/20 border-b border-brand-blue/30 text-brand-offwhite/70 uppercase tracking-wider font-bold">
                    <th className="p-3.5">Data & Horário</th>
                    <th className="p-3.5">Responsável</th>
                    <th className="p-3.5">Ação / Evento</th>
                    <th className="p-3.5">Entidade</th>
                    <th className="p-3.5">Detalhamento da Atividade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-blue/10">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-brand-offwhite/40 italic">
                        {logLoading ? "Carregando logs do sistema..." : "Nenhuma atividade registrada encontrada com os filtros selecionados."}
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((l) => (
                      <tr key={l.id || Math.random().toString()} className="hover:bg-brand-blue/5 transition">
                        <td className="p-3.5 font-mono text-brand-offwhite/60 whitespace-nowrap">
                          {formatDateTimeBR(l.timestamp)}
                        </td>
                        <td className="p-3.5 font-bold text-brand-offwhite whitespace-nowrap">
                          <div>
                            <p>{l.userName}</p>
                            <p className="text-[10px] font-mono text-brand-offwhite/40 font-normal">{l.userEmail}</p>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 bg-brand-blue/20 text-brand-gold rounded font-mono font-bold text-[10px]">
                            {l.action}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 bg-brand-black/60 rounded text-[10px] font-bold text-brand-offwhite/70 border border-brand-blue/30">
                            {l.entity}
                          </span>
                        </td>
                        <td className="p-3.5 text-brand-offwhite/90">
                          {l.details}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CADASTRO / EDIÇÃO DE USUÁRIO & PERMISSÕES GRANULARES (REQ 1 E 3)   */}
      {/* ========================================================================= */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-brand-graphite border border-brand-blue/50 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-brand-blue/30 flex justify-between items-center bg-brand-black/40">
              <div className="flex items-center space-x-2">
                <Users className="text-brand-gold" size={20} />
                <h3 className="text-lg font-black text-brand-offwhite">
                  {editingUser ? `Editar Usuário: ${editingUser.name}` : "Novo Usuário do Sistema SaaS"}
                </h3>
              </div>
              <button
                onClick={() => setUserModalOpen(false)}
                className="text-brand-offwhite/50 hover:text-brand-offwhite"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
              {/* Dados Básicos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-offwhite mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={userFormData.name || ""}
                    onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                    placeholder="Ex: Carlos Eduardo"
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-offwhite mb-1">
                    E-mail de Acesso *
                  </label>
                  <input
                    type="email"
                    required
                    value={userFormData.email || ""}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    placeholder="carlos@empresa.com"
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite font-mono focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-offwhite mb-1">
                    Telefone / WhatsApp (com Máscara)
                  </label>
                  <input
                    type="text"
                    value={userFormData.phone || ""}
                    onChange={(e) => setUserFormData({ ...userFormData, phone: maskPhone(e.target.value) })}
                    placeholder="(31) 98888-7777"
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-offwhite mb-1">
                    Perfil de Permissão (Modelo Pré-definido)
                  </label>
                  <select
                    value={userFormData.role || "VENDEDOR"}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite font-bold focus:outline-none focus:border-brand-gold"
                  >
                    <option value="ADMIN">ADMINISTRADOR (Acesso Total)</option>
                    <option value="GERENTE">GERENTE GERAL</option>
                    <option value="VENDEDOR">VENDEDOR / RUA</option>
                    <option value="FINANCEIRO">FINANCEIRO</option>
                    <option value="OPERACIONAL">OPERACIONAL / CARGAS</option>
                    <option value="CUSTOM">PERSONALIZADO</option>
                  </select>
                </div>
              </div>

              {/* Matriz de Permissões por Abas e Menus */}
              <div className="p-4 bg-brand-black/60 rounded-xl border border-brand-blue/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield size={16} className="text-brand-gold" />
                    <h4 className="text-xs font-black uppercase text-brand-offwhite">
                      Permissões por Telas e Menus do Sistema
                    </h4>
                  </div>
                  <span className="text-[10px] text-brand-gold font-mono">
                    Marque as abas autorizadas para este usuário
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
                  {ALL_MENU_KEYS.map((menu) => {
                    const isGranted = userFormData.permissions?.[menu.key] ?? false;
                    return (
                      <label
                        key={menu.key}
                        className={`flex items-start space-x-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                          isGranted
                            ? "bg-brand-blue/20 border-brand-gold/40 text-brand-offwhite"
                            : "bg-brand-graphite/40 border-brand-blue/20 text-brand-offwhite/50 hover:bg-brand-blue/10"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isGranted}
                          onChange={() => handlePermissionToggle(menu.key)}
                          className="mt-0.5 rounded border-brand-blue/40 text-brand-gold focus:ring-0"
                        />
                        <div>
                          <p className="font-bold">{menu.label}</p>
                          <p className="text-[10px] text-brand-offwhite/50 leading-tight">
                            {menu.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Condições de Pagamento Autorizadas para este Usuário */}
              <div className="p-4 bg-brand-black/60 rounded-xl border border-brand-blue/30 space-y-2">
                <div className="flex items-center space-x-2">
                  <CreditCard size={15} className="text-brand-gold" />
                  <h4 className="text-xs font-black uppercase text-brand-offwhite">
                    Condições de Pagamento que o Usuário Pode Usar
                  </h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {paymentTerms.map((pt) => {
                    const isAllowed = userFormData.allowedPaymentTerms?.includes(pt.id);
                    return (
                      <label
                        key={pt.id}
                        className={`flex items-center space-x-2 p-2 rounded-lg border text-xs cursor-pointer transition ${
                          isAllowed
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold"
                            : "bg-brand-graphite/40 border-brand-blue/20 text-brand-offwhite/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isAllowed}
                          onChange={() => {
                            const cur = userFormData.allowedPaymentTerms || [];
                            const updated = cur.includes(pt.id)
                              ? cur.filter((id) => id !== pt.id)
                              : [...cur, pt.id];
                            setUserFormData({ ...userFormData, allowedPaymentTerms: updated });
                          }}
                          className="rounded border-brand-blue/40 text-emerald-500 focus:ring-0"
                        />
                        <span className="truncate">{pt.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Ações do Modal */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-brand-blue/30">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-brand-offwhite/70 hover:text-brand-offwhite"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-brand-gold text-brand-black font-extrabold text-xs rounded-xl hover:bg-yellow-500 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw size={14} className="animate-spin text-brand-black" />
                      <span>Gravando na nuvem...</span>
                    </>
                  ) : (
                    <>
                      <Cloud size={14} />
                      <span>Salvar Usuário & Permissões</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONDIÇÃO DE PAGAMENTO (REQ 5)                                      */}
      {/* ========================================================================= */}
      {ptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-brand-graphite border border-brand-blue/50 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-brand-blue/30 flex justify-between items-center bg-brand-black/40">
              <div className="flex items-center space-x-2">
                <CreditCard className="text-brand-gold" size={18} />
                <h3 className="text-sm font-black text-brand-offwhite">
                  {editingPt ? "Editar Condição de Pagamento" : "Nova Condição Comercial"}
                </h3>
              </div>
              <button
                onClick={() => setPtModalOpen(false)}
                className="text-brand-offwhite/50 hover:text-brand-offwhite"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSavePt} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-offwhite mb-1">
                  Nome da Condição *
                </label>
                <input
                  type="text"
                  required
                  value={ptFormData.name || ""}
                  onChange={(e) => setPtFormData({ ...ptFormData, name: e.target.value })}
                  placeholder="Ex: Prazo 21 Dias ou Entrada + 30D"
                  className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-offwhite mb-1">
                    Tipo de Liquidação
                  </label>
                  <select
                    value={ptFormData.type || "PRAZO"}
                    onChange={(e: any) => setPtFormData({ ...ptFormData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  >
                    <option value="A_VISTA">À Vista</option>
                    <option value="PRAZO">Prazo</option>
                    <option value="CONSIGNADO">Consignado</option>
                    <option value="MISTO">Misto / Entrada + Prazo</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-offwhite mb-1">
                    Dias de Vencimento
                  </label>
                  <input
                    type="text"
                    value={ptFormData.days || "30"}
                    onChange={(e) => setPtFormData({ ...ptFormData, days: e.target.value })}
                    placeholder="Ex: 15 ou 14, 28"
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite font-mono focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-offwhite mb-1">
                  Instruções / Observações
                </label>
                <textarea
                  rows={2}
                  value={ptFormData.notes || ""}
                  onChange={(e) => setPtFormData({ ...ptFormData, notes: e.target.value })}
                  placeholder="Regras de desconto, exigência de aprovação financeira..."
                  className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-brand-blue/30">
                <button
                  type="button"
                  onClick={() => setPtModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-brand-offwhite/70 hover:text-brand-offwhite"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-brand-gold text-brand-black font-extrabold text-xs rounded-xl hover:bg-yellow-500 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw size={14} className="animate-spin text-brand-black" />
                      <span>Gravando na nuvem...</span>
                    </>
                  ) : (
                    <>
                      <Cloud size={14} />
                      <span>Salvar Condição</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADMINISTRAÇÃO DE ROTA (REQ 6)                                      */}
      {/* ========================================================================= */}
      {routeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-brand-graphite border border-brand-blue/50 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-brand-blue/30 flex justify-between items-center bg-brand-black/40">
              <div className="flex items-center space-x-2">
                <Map className="text-brand-gold" size={18} />
                <h3 className="text-sm font-black text-brand-offwhite">
                  {editingRoute ? `Editar Rota: ${editingRoute.code}` : "Cadastrar Nova Rota"}
                </h3>
              </div>
              <button
                onClick={() => setRouteModalOpen(false)}
                className="text-brand-offwhite/50 hover:text-brand-offwhite"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveRoute} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-offwhite mb-1">
                    Código da Rota *
                  </label>
                  <input
                    type="text"
                    required
                    value={routeFormData.code || ""}
                    onChange={(e) => setRouteFormData({ ...routeFormData, code: e.target.value.toUpperCase() })}
                    placeholder="Ex: R13 ou F13"
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-gold font-mono font-bold focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-offwhite mb-1">
                    Prefixo
                  </label>
                  <select
                    value={routeFormData.prefix || "R"}
                    onChange={(e: any) => setRouteFormData({ ...routeFormData, prefix: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite font-bold focus:outline-none focus:border-brand-gold"
                  >
                    <option value="R">Prefixo R</option>
                    <option value="F">Prefixo F</option>
                    <option value="G">Prefixo G</option>
                    <option value="Y">Prefixo Y</option>
                    <option value="ESPECIAL">Especial</option>
                    <option value="OUTROS">Outros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-offwhite mb-1">
                  Nome Completo da Rota *
                </label>
                <input
                  type="text"
                  required
                  value={routeFormData.name || ""}
                  onChange={(e) => setRouteFormData({ ...routeFormData, name: e.target.value })}
                  placeholder="Ex: Rota R13 - Betim Centro & Laranjeiras"
                  className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-offwhite mb-1">
                    Vendedor Titular Padrão
                  </label>
                  <input
                    type="text"
                    value={routeFormData.defaultVendorName || ""}
                    onChange={(e) => setRouteFormData({ ...routeFormData, defaultVendorName: e.target.value })}
                    placeholder="Alisson, Alexandre, Lucas..."
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-offwhite mb-1">
                    Região / Setor
                  </label>
                  <input
                    type="text"
                    value={routeFormData.region || ""}
                    onChange={(e) => setRouteFormData({ ...routeFormData, region: e.target.value })}
                    placeholder="Barreiro, Pampulha, Betim..."
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-offwhite mb-1">
                    Meta de Clientes
                  </label>
                  <NumberInput
                    value={routeFormData.targetClientsCount ?? 20}
                    onChange={(val) => setRouteFormData({ ...routeFormData, targetClientsCount: val })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite font-mono focus:outline-none focus:border-brand-gold"
                    placeholder="20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-offwhite mb-1">
                    Status da Rota
                  </label>
                  <select
                    value={routeFormData.active ? "ACTIVE" : "INACTIVE"}
                    onChange={(e) => setRouteFormData({ ...routeFormData, active: e.target.value === "ACTIVE" })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite font-bold focus:outline-none focus:border-brand-gold"
                  >
                    <option value="ACTIVE">Ativa (Visível na Operação)</option>
                    <option value="INACTIVE">Inativa</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-brand-blue/30">
                <button
                  type="button"
                  onClick={() => setRouteModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-brand-offwhite/70 hover:text-brand-offwhite"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-brand-gold text-brand-black font-extrabold text-xs rounded-xl hover:bg-yellow-500 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw size={14} className="animate-spin text-brand-black" />
                      <span>Gravando na nuvem...</span>
                    </>
                  ) : (
                    <>
                      <Cloud size={14} />
                      <span>Salvar Rota</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
