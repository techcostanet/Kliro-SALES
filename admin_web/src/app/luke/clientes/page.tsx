"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Store,
  Plus,
  Search,
  Edit2,
  Trash2,
  MapPin,
  CheckCircle2,
  X,
  CreditCard,
  Building2,
  UserCheck,
  MessageCircle,
  Eye,
  EyeOff,
  UserPlus,
  Check,
  AlertCircle,
  Camera,
  Upload,
  Sparkles,
  RefreshCw,
  Cloud,
  CloudUpload,
} from "lucide-react";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  ClientItem,
  BuyerContact,
  BASE_CLIENTS_CATALOG,
  mergeClientsWithCatalog,
  seedAllDefaultClients,
} from "@/lib/clientsCatalog";
import { usePrivacy } from "@/lib/privacyContext";
import {
  formatCurrency,
  formatPhoneBR,
  getWhatsAppLink,
  maskPhone,
  formatCurrencyInput,
  fetchAddressByCep,
} from "@/lib/formatters";
import ToastFeedback, { ToastMessage } from "@/components/ToastFeedback";
import ColumnOrganizer, { ColumnDefinition } from "@/components/ColumnOrganizer";
import { logActivity } from "@/lib/activityLogger";

export type { ClientItem, BuyerContact };

const DEFAULT_ROUTES = [
  "Todas",
  "R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8", "R9", "R10", "R11", "R12",
  "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12",
  "G1", "G2", "G3", "G4", "Y1", "Y2", "Y3", "Y4", "CENTRO", "RESERVA 1", "RESERVA 2", "Representante"
];

const DEFAULT_CONDITIONS = [
  "Todas",
  "prazo 30 dias",
  "prazo + consignado",
  "consignado + a vista",
  "Prazo 15 Dias",
  "Prazo 14/28 Dias",
  "Consignado",
  "A Vista",
  "Compra Lamina",
  "Intermitente"
];

// Colunas Configuráveis para a Tabela (Requisito 15)
const CLIENT_COLUMNS: ColumnDefinition[] = [
  { key: "client", label: "Cliente / Fachada", defaultVisible: true },
  { key: "buyers", label: "Compradores & WhatsApp", defaultVisible: true },
  { key: "route", label: "Rota & Ordem", defaultVisible: true },
  { key: "address", label: "Endereço & Cidade", defaultVisible: true },
  { key: "condition", label: "Condição Comercial & P.A.", defaultVisible: true },
  { key: "limit", label: "Limite Mensal", defaultVisible: true },
  { key: "status", label: "Status", defaultVisible: true },
  { key: "actions", label: "Ações", defaultVisible: true, alwaysVisible: true },
];

export default function LukeClientesPage() {
  const { hideValues, togglePrivacy, formatValue } = usePrivacy();
  const tenantId = "tenant_luke_001";

  // Toast Feedback State (Requisito 13)
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Column Organizer State (Requisito 15)
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("kliro_cols_clientes");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return CLIENT_COLUMNS.map((c) => c.key);
  });

  const [clients, setClients] = useState<ClientItem[]>(() => mergeClientsWithCatalog([]));
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const [loadingFirestore, setLoadingFirestore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("Todas");
  const [selectedCondition, setSelectedCondition] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Rotas Dinâmicas carregadas do Firestore ou Fallback
  const [availableRoutes, setAvailableRoutes] = useState<string[]>(DEFAULT_ROUTES);
  // Condições Dinâmicas carregadas do Firestore ou Fallback
  const [availableConditions, setAvailableConditions] = useState<string[]>(DEFAULT_CONDITIONS);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<ClientItem>>({
    routeId: "R1",
    order: 1,
    code: "R1C01",
    name: "",
    imageUrl: "",
    buyers: [{ name: "", phone: "", role: "Proprietário" }],
    conferenceInfo: "prazo 30 dias",
    acceptsPA: true,
    status: "ACTIVE",
    phone: "",
    document: "",
    cep: "30140-000",
    street: "Rua Principal",
    number: "100",
    complement: "",
    neighborhood: "Centro",
    city: "Belo Horizonte",
    state: "MG",
    reference: "",
    creditLimit: 2000,
    businessType: "Comércio / Distribuição",
    notes: "",
  });

  // Estado de Máscara Monetária do Limite de Compra (Requisito 8)
  const [creditLimitDisplay, setCreditLimitDisplay] = useState("R$ 2.000,00");
  // Estado de Busca Automática do CEP (Requisito 9)
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper: Gera o código automático do cliente com base na rota e ordem (Requisito 7)
  const generateClientCode = (routeId: string, order: number | string): string => {
    const cleanRoute = (routeId || "R1").trim().toUpperCase();
    const numOrder = Number(order) || 1;
    return `${cleanRoute}C${String(numOrder).padStart(2, "0")}`;
  };

  // Carrega Clientes, Rotas e Condições do Firestore
  const fetchClientsFromFirestore = async () => {
    try {
      setLoadingFirestore(true);

      // Carregar Rotas Ativas (mesclando catálogo padrão com rotas do Firestore)
      try {
        const routesSnap = await getDocs(collection(db, `tenants/${tenantId}/routes`));
        const rCodesSet = new Set<string>(DEFAULT_ROUTES);
        if (!routesSnap.empty) {
          routesSnap.forEach((d) => {
            const data = d.data();
            if (data.code && data.active !== false) rCodesSet.add(data.code);
          });
        }
        setAvailableRoutes(Array.from(rCodesSet));
      } catch (e) {}

      // Carregar Condições de Pagamento Ativas
      try {
        const ptSnap = await getDocs(collection(db, `tenants/${tenantId}/payment_terms`));
        if (!ptSnap.empty) {
          const terms: string[] = ["Todas"];
          ptSnap.forEach((d) => {
            const data = d.data();
            if (data.name && data.active !== false) terms.push(data.name);
          });
          setAvailableConditions(terms);
        }
      } catch (e) {}

      // Carregar Clientes do Firestore e Mesclar com Catálogo Mestre
      const snapshot = await getDocs(collection(db, `tenants/${tenantId}/clients`));
      const loaded: ClientItem[] = [];
      if (!snapshot.empty) {
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          loaded.push({
            id: docSnap.id,
            routeId: d.routeId || "R1",
            order: Number(d.order || 0),
            code: d.code || generateClientCode(d.routeId || "R1", d.order || 1),
            name: d.name || "Cliente",
            imageUrl: d.imageUrl || "",
            buyers: d.buyers && Array.isArray(d.buyers) && d.buyers.length > 0
              ? d.buyers
              : [{ name: d.buyer || "Proprietário", phone: d.phone || "" }],
            buyer: d.buyer || "",
            conferenceInfo: d.conferenceInfo || "Prazo 30 dias",
            acceptsPA: d.acceptsPA !== undefined ? d.acceptsPA : (d.conferenceInfo?.toLowerCase().includes("prazo") ?? true),
            status: d.status || "ACTIVE",
            phone: d.phone || "",
            document: d.document || "",
            cep: d.cep || "30140-000",
            street: d.street || "Rua Comercial",
            number: d.number || "100",
            complement: d.complement || "",
            neighborhood: d.neighborhood || "Centro",
            city: d.city || "Belo Horizonte",
            state: d.state || "MG",
            reference: d.reference || "",
            address: d.address || `${d.street || "Rua Comercial"}, ${d.number || "100"} - ${d.neighborhood || "Centro"}`,
            creditLimit: Number(d.creditLimit || 2000),
            businessType: d.businessType || "Comércio / Distribuição",
            notes: d.notes || "",
            updatedAt: d.updatedAt,
            deleted: Boolean(d.deleted),
          });
        });
      }
      const merged = mergeClientsWithCatalog(loaded);
      setClients(merged);
    } catch (err: any) {
      console.warn("Firestore fetch offline/fallback:", err?.message);
    } finally {
      setLoadingFirestore(false);
    }
  };

  useEffect(() => {
    fetchClientsFromFirestore();
  }, []);

  // Sincronização em Massa de todos os 561 clientes para o Firestore
  const handleSyncAllClientsToCloud = async () => {
    if (isSyncingAll) return;
    setIsSyncingAll(true);
    setSyncProgress(0);

    try {
      await seedAllDefaultClients(tenantId, db, (processed, total) => {
        const pct = Math.round((processed / total) * 100);
        setSyncProgress(pct);
      });

      await fetchClientsFromFirestore();

      setToast({
        type: "cloud_success",
        title: "Catálogo Completo Sincronizado!",
        message: "Todos os 561 clientes foram gravados e validados no banco de dados Firestore da nuvem.",
        isCloud: true,
      });
    } catch (err: any) {
      console.error("Erro na sincronização de clientes:", err);
      setToast({
        type: "cloud_error",
        title: "Falha na Sincronização em Massa",
        message: err?.message || "Não foi possível sincronizar todos os clientes na nuvem.",
        isCloud: true,
      });
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Filtragem
  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const buyerNames = (c.buyers || []).map((b) => b.name).join(" ");
      const buyerPhones = (c.buyers || []).map((b) => b.phone).join(" ");

      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyerNames.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buyerPhones.includes(searchTerm) ||
        (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.neighborhood && c.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRoute =
        selectedRoute === "Todas" || c.routeId === selectedRoute;

      const matchesCondition =
        selectedCondition === "Todas" ||
        c.conferenceInfo.toLowerCase().includes(selectedCondition.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && c.status === "ACTIVE") ||
        (statusFilter === "INACTIVE" && c.status === "INACTIVE");

      return matchesSearch && matchesRoute && matchesCondition && matchesStatus;
    });
  }, [clients, searchTerm, selectedRoute, selectedCondition, statusFilter]);

  // Modal Open Handlers
  const handleOpenModal = (cli?: ClientItem) => {
    if (cli) {
      setEditingClient(cli);
      const limitVal = Number(cli.creditLimit || 2000);
      setCreditLimitDisplay(formatCurrency(limitVal));
      setFormData({
        ...cli,
        code: cli.code || generateClientCode(cli.routeId || "R1", cli.order || 1),
        buyers: cli.buyers && cli.buyers.length > 0 ? cli.buyers : [{ name: cli.buyer || "", phone: cli.phone || "", role: "Proprietário" }],
      });
    } else {
      setEditingClient(null);
      const targetRoute = selectedRoute !== "Todas" ? selectedRoute : "R1";
      // Calcula a próxima ordem na rota selecionada (Requisito 7)
      const existingOrders = clients
        .filter((c) => c.routeId === targetRoute)
        .map((c) => Number(c.order || 0));
      const nextOrder = existingOrders.length > 0 ? Math.max(...existingOrders) + 1 : 1;
      const initialCode = generateClientCode(targetRoute, nextOrder);

      setCreditLimitDisplay("R$ 2.000,00");
      setFormData({
        id: `CLI-${targetRoute}-${String(nextOrder).padStart(3, "0")}`,
        routeId: targetRoute,
        order: nextOrder,
        code: initialCode,
        name: "",
        imageUrl: "",
        buyers: [{ name: "", phone: "", role: "Proprietário" }],
        conferenceInfo: "prazo 30 dias",
        acceptsPA: true,
        status: "ACTIVE",
        phone: "",
        document: "",
        cep: "30140-000",
        street: "Rua Principal",
        number: "100",
        complement: "",
        neighborhood: "Centro",
        city: "Belo Horizonte",
        state: "MG",
        reference: "",
        creditLimit: 2000,
        businessType: "Comércio / Distribuição",
        notes: "",
      });
    }
    setIsModalOpen(true);
  };

  // Alteração de Rota com Recálculo de Código (Requisito 7)
  const handleRouteChange = (newRoute: string) => {
    const existingOrders = clients
      .filter((c) => c.routeId === newRoute)
      .map((c) => Number(c.order || 0));
    const nextOrder = existingOrders.length > 0 ? Math.max(...existingOrders) + 1 : 1;
    const newCode = generateClientCode(newRoute, nextOrder);
    setFormData((prev) => ({
      ...prev,
      routeId: newRoute,
      order: nextOrder,
      code: newCode,
    }));
  };

  // Alteração de Ordem com Recálculo de Código (Requisito 7)
  const handleOrderChange = (newOrder: number) => {
    const newCode = generateClientCode(formData.routeId || "R1", newOrder);
    setFormData((prev) => ({
      ...prev,
      order: newOrder,
      code: newCode,
    }));
  };

  // Alteração com Máscara de Limite de Compras (Requisito 8)
  const handleCreditLimitChange = (val: string) => {
    const res = formatCurrencyInput(val);
    setCreditLimitDisplay(res.formatted);
    setFormData((prev) => ({ ...prev, creditLimit: res.raw }));
  };

  // Consulta Automática por CEP no ViaCEP (Requisito 9)
  const handleCepChange = async (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 8);
    const masked = clean.length > 5 ? `${clean.slice(0, 5)}-${clean.slice(5)}` : clean;
    setFormData((prev) => ({ ...prev, cep: masked }));

    if (clean.length === 8) {
      setIsSearchingCep(true);
      const addr = await fetchAddressByCep(clean);
      setIsSearchingCep(false);
      if (addr) {
        setFormData((prev) => ({
          ...prev,
          street: addr.street || prev.street,
          neighborhood: addr.neighborhood || prev.neighborhood,
          city: addr.city || prev.city,
          state: addr.state || prev.state,
          complement: addr.complement || prev.complement,
        }));
      }
    }
  };

  // Upload da Foto do Estabelecimento (Requisito 11)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Compradores Dinâmicos (Até 5) com Máscara de Telefone (Requisito 12)
  const handleAddBuyer = () => {
    if ((formData.buyers || []).length < 5) {
      setFormData({
        ...formData,
        buyers: [...(formData.buyers || []), { name: "", phone: "", role: "Comprador" }],
      });
    }
  };

  const handleRemoveBuyer = (index: number) => {
    const updated = (formData.buyers || []).filter((_, i) => i !== index);
    setFormData({ ...formData, buyers: updated });
  };

  const handleBuyerChange = (index: number, field: keyof BuyerContact, value: string) => {
    const updated = [...(formData.buyers || [])];
    const finalVal = field === "phone" ? maskPhone(value) : value;
    updated[index] = { ...updated[index], [field]: finalVal };
    setFormData({ ...formData, buyers: updated });
  };

  // Salvar Cliente com Feedback Visual e Fechamento de Tela (Requisito 13)
  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const validBuyers = (formData.buyers || []).filter((b) => b.name.trim() || b.phone.trim());
    const primaryPhone = validBuyers[0]?.phone || formData.phone || "";
    const primaryBuyer = validBuyers[0]?.name || "Proprietário";

    const structuredAddress = `${formData.street || "Rua"}, ${formData.number || "S/N"}${
      formData.complement ? ` - ${formData.complement}` : ""
    } - ${formData.neighborhood || "Centro"}, ${formData.city || "Belo Horizonte"} - ${formData.state || "MG"}`;

    const clientPayload: ClientItem = {
      id: formData.id || `CLI-${Date.now()}`,
      routeId: formData.routeId || "R1",
      order: Number(formData.order || 1),
      code: formData.code || generateClientCode(formData.routeId || "R1", formData.order || 1),
      name: formData.name.trim(),
      imageUrl: formData.imageUrl || "",
      buyers: validBuyers.length > 0 ? validBuyers : [{ name: primaryBuyer, phone: primaryPhone }],
      buyer: primaryBuyer,
      conferenceInfo: formData.conferenceInfo || "prazo 30 dias",
      acceptsPA: formData.acceptsPA ?? true,
      status: formData.status || "ACTIVE",
      phone: primaryPhone,
      document: formData.document || "",
      cep: formData.cep || "",
      street: formData.street || "",
      number: formData.number || "",
      complement: formData.complement || "",
      neighborhood: formData.neighborhood || "",
      city: formData.city || "",
      state: formData.state || "MG",
      reference: formData.reference || "",
      address: structuredAddress,
      creditLimit: Number(formData.creditLimit || 2000),
      businessType: formData.businessType || "Comércio / Distribuição",
      notes: formData.notes || "",
    };

    setIsSaving(true);
    try {
      await setDoc(doc(db, `tenants/${tenantId}/clients`, clientPayload.id), {
        ...clientPayload,
        updatedAt: new Date().toISOString(),
      });

      // Atualiza estado local garantindo que o cliente permaneça visível com as alterações
      setClients((prev) => {
        const index = prev.findIndex((c) => c.id === clientPayload.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = clientPayload;
          return updated;
        } else {
          return [clientPayload, ...prev];
        }
      });

      await logActivity(tenantId, {
        userName: "Administrador",
        userEmail: "admin@luke.com",
        action: editingClient ? "CLIENTE_EDITADO" : "CLIENTE_CRIADO",
        entity: "CLIENTE",
        entityId: clientPayload.id,
        details: `${editingClient ? "Editou" : "Cadastrou"} cliente "${clientPayload.name}" na Rota ${clientPayload.routeId} (Ordem: ${clientPayload.order}, Código: ${clientPayload.code}).`,
      });

      // Fecha o modal e exibe resposta visual explícita de gravação na nuvem
      setIsModalOpen(false);
      setEditingClient(null);
      setToast({
        type: "cloud_success",
        title: editingClient ? "Cliente Atualizado na Nuvem!" : "Cliente Cadastrado na Nuvem!",
        message: `${clientPayload.name} (${clientPayload.code}) foi gravado e sincronizado no Firestore com sucesso.`,
        isCloud: true,
      });
    } catch (err: any) {
      console.error("Erro ao salvar cliente no Firestore:", err);
      // O formulário PERMANECE ABERTO para que o usuário não perca suas alterações!
      setToast({
        type: "cloud_error",
        title: "Falha ao Salvar na Nuvem",
        message: err?.message || "Não foi possível gravar os dados do cliente no banco de dados. Verifique a conexão.",
        isCloud: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (cli: ClientItem) => {
    const updatedStatus: "ACTIVE" | "INACTIVE" =
      cli.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const updated = { ...cli, status: updatedStatus };

    try {
      await setDoc(
        doc(db, `tenants/${tenantId}/clients`, cli.id),
        { status: updatedStatus, updatedAt: new Date().toISOString() },
        { merge: true }
      );
      setClients((prev) => prev.map((c) => (c.id === cli.id ? updated : c)));

      await logActivity(tenantId, {
        userName: "Administrador",
        userEmail: "admin@luke.com",
        action: "CLIENTE_STATUS",
        entity: "CLIENTE",
        entityId: cli.id,
        details: `Alterou status do cliente ${cli.name} para ${updatedStatus}.`,
      });

      setToast({
        type: "cloud_success",
        title: "Status Atualizado na Nuvem",
        message: `${cli.name} agora está ${updatedStatus === "ACTIVE" ? "Ativo" : "Inativo"} no Firestore.`,
        isCloud: true,
      });
    } catch (err: any) {
      console.error("Erro ao atualizar status do cliente no Firestore:", err);
      setToast({
        type: "cloud_error",
        title: "Erro ao Atualizar Status na Nuvem",
        message: err?.message || "Não foi possível atualizar o status no banco de dados.",
        isCloud: true,
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Deseja realmente remover o cliente "${name}" do cadastro?`)) {
      try {
        await setDoc(
          doc(db, `tenants/${tenantId}/clients`, id),
          { deleted: true, status: "INACTIVE", updatedAt: new Date().toISOString() },
          { merge: true }
        );
        try {
          await deleteDoc(doc(db, `tenants/${tenantId}/clients`, id));
        } catch (e) {}

        setClients((prev) => prev.filter((c) => c.id !== id));

        await logActivity(tenantId, {
          userName: "Administrador",
          userEmail: "admin@luke.com",
          action: "CLIENTE_EXCLUIDO",
          entity: "CLIENTE",
          entityId: id,
          details: `Removeu o cliente "${name}" do cadastro.`,
        });

        setToast({
          type: "cloud_success",
          title: "Cliente Excluído na Nuvem",
          message: `${name} foi removido do banco de dados Firestore.`,
          isCloud: true,
        });
      } catch (err: any) {
        console.error("Erro ao excluir cliente no Firestore:", err);
        setToast({
          type: "cloud_error",
          title: "Erro ao Excluir na Nuvem",
          message: err?.message || "Não foi possível remover o cliente do banco de dados.",
          isCloud: true,
        });
      }
    }
  };

  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      {/* Toast de Feedback Visual (Requisito 13) */}
      <ToastFeedback toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-extrabold text-brand-offwhite">Clientes</h2>
            <span className="bg-brand-gold/20 text-brand-gold text-xs px-2.5 py-1 rounded-full font-bold border border-brand-gold/30">
              {totalClients} cadastrados
            </span>
          </div>
          <p className="text-brand-offwhite/60 text-xs mt-1">
            Gestão completa com código automatizado por rota, foto da fachada, preenchimento por CEP e limites de compras.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Botão Sincronizar Catálogo Completo na Nuvem */}
          <button
            onClick={handleSyncAllClientsToCloud}
            disabled={isSyncingAll}
            className="flex items-center space-x-1.5 bg-brand-blue/30 text-brand-gold border border-brand-gold/30 hover:bg-brand-blue/50 px-3.5 py-2.5 rounded-xl font-bold transition shadow text-xs shrink-0 disabled:opacity-50"
            title="Garantir que todos os 561 clientes estejam gravados na nuvem Firestore"
          >
            <CloudUpload size={16} className={isSyncingAll ? "animate-bounce" : ""} />
            <span>{isSyncingAll ? `Sincronizando (${syncProgress}%)...` : "Sincronizar Catálogo na Nuvem"}</span>
          </button>

          {/* Toggle Modo Privacidade */}
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
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-1.5 bg-brand-gold text-brand-black px-4 py-2.5 rounded-xl font-extrabold hover:bg-yellow-500 transition shadow-lg text-xs shrink-0"
          >
            <Plus size={16} />
            <span>Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Organizador de Colunas (Requisito 15) */}
      <div className="bg-brand-graphite p-4 rounded-xl border border-brand-blue/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-brand-offwhite/40" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, código, celular, bairro ou cidade..."
            className="w-full pl-9 pr-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite focus:outline-none focus:border-brand-gold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro Rota */}
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="bg-brand-black border border-brand-blue/40 text-brand-offwhite text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-brand-gold"
          >
            {availableRoutes.map((r) => (
              <option key={r} value={r}>
                {r === "Todas" ? "Todas as Rotas" : `Rota ${r}`}
              </option>
            ))}
          </select>

          {/* Filtro Condição */}
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="bg-brand-black border border-brand-blue/40 text-brand-offwhite text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-brand-gold"
          >
            {availableConditions.map((c) => (
              <option key={c} value={c}>
                {c === "Todas" ? "Todas as Condições" : c}
              </option>
            ))}
          </select>

          {/* Filtro Status */}
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="bg-brand-black border border-brand-blue/40 text-brand-offwhite text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-brand-gold"
          >
            <option value="ALL">Todos os Status</option>
            <option value="ACTIVE">Apenas Ativos</option>
            <option value="INACTIVE">Apenas Inativos</option>
          </select>

          {/* Organizador de Colunas (Requisito 15) */}
          <ColumnOrganizer
            storageKey="kliro_cols_clientes"
            columns={CLIENT_COLUMNS}
            visibleColumns={visibleColumns}
            onChange={setVisibleColumns}
          />
        </div>
      </div>

      {/* Listagem de Clientes */}
      <div className="bg-brand-graphite rounded-xl border border-brand-blue/30 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-brand-blue/20 border-b border-brand-blue/30 text-brand-offwhite/70 uppercase tracking-wider font-bold">
                {visibleColumns.includes("client") && <th className="p-3.5">Cliente / Fachada</th>}
                {visibleColumns.includes("buyers") && <th className="p-3.5">Compradores & WhatsApp (Até 5)</th>}
                {visibleColumns.includes("route") && <th className="p-3.5">Rota & Ordem</th>}
                {visibleColumns.includes("address") && <th className="p-3.5">Endereço & Cidade</th>}
                {visibleColumns.includes("condition") && <th className="p-3.5">Condição Comercial & P.A.</th>}
                {visibleColumns.includes("limit") && <th className="p-3.5">Limite Mensal</th>}
                {visibleColumns.includes("status") && <th className="p-3.5">Status</th>}
                {visibleColumns.includes("actions") && <th className="p-3.5 text-right">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-blue/10">
              {filtered.slice(0, 50).map((client) => (
                <tr key={client.id} className="hover:bg-brand-blue/5 transition group">
                  {/* Cliente / Fachada (Requisitos 11 e 14 - Sem prefixo de iniciais) */}
                  {visibleColumns.includes("client") && (
                    <td className="p-3.5 font-bold text-brand-offwhite">
                      <div className="flex items-center space-x-3">
                        <div className="w-11 h-11 rounded-xl bg-brand-blue/30 border border-brand-gold/30 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                          {client.imageUrl ? (
                            <img
                              src={client.imageUrl}
                              alt={client.name}
                              className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            />
                          ) : (
                            <Store size={20} className="text-brand-gold/80" />
                          )}
                        </div>
                        <div>
                          <p className="text-brand-offwhite font-extrabold text-sm">{client.name}</p>
                          <p className="text-[11px] text-brand-gold font-mono font-bold">{client.code}</p>
                        </div>
                      </div>
                    </td>
                  )}

                  {/* Compradores com WhatsApp */}
                  {visibleColumns.includes("buyers") && (
                    <td className="p-3.5">
                      <div className="space-y-1">
                        {(client.buyers || [{ name: client.buyer || "Proprietário", phone: client.phone }]).map((b, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <span className="text-[11px] font-semibold text-brand-offwhite/90">
                              {b.name || "Comprador"}:
                            </span>
                            {b.phone ? (
                              <a
                                href={getWhatsAppLink(b.phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 px-2 py-0.5 bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 rounded-md text-[10px] text-green-400 font-mono font-bold transition"
                                title={`Chamar ${b.name || "Comprador"} no WhatsApp`}
                              >
                                <MessageCircle size={10} className="text-green-400" />
                                <span>{formatPhoneBR(b.phone)}</span>
                              </a>
                            ) : (
                              <span className="text-[10px] text-brand-offwhite/40 italic">Sem WhatsApp</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                  )}

                  {/* Rota & Ordem (Requisito 7) */}
                  {visibleColumns.includes("route") && (
                    <td className="p-3.5">
                      <div className="flex flex-col space-y-1">
                        <span className="px-2.5 py-0.5 bg-brand-gold/15 text-brand-gold font-bold text-xs rounded-md border border-brand-gold/30 text-center font-mono">
                          {client.routeId}
                        </span>
                        <span className="text-[10px] text-brand-offwhite/60 font-mono text-center">
                          Visita #{client.order || 1}
                        </span>
                      </div>
                    </td>
                  )}

                  {/* Endereço Estruturado */}
                  {visibleColumns.includes("address") && (
                    <td className="p-3.5 text-xs text-brand-offwhite/70 max-w-xs">
                      <p className="font-bold text-brand-offwhite/90">
                        {client.neighborhood ? `${client.neighborhood}, ${client.city || "BH"}` : client.address}
                      </p>
                      <p className="text-[10px] text-brand-offwhite/50 truncate">
                        {client.street ? `${client.street}, ${client.number}` : client.address}
                      </p>
                    </td>
                  )}

                  {/* Condição Comercial & P.A. */}
                  {visibleColumns.includes("condition") && (
                    <td className="p-3.5 space-y-1">
                      <span className="block text-xs px-2 py-0.5 bg-brand-black/60 text-brand-offwhite/90 rounded-md border border-brand-blue/20">
                        {client.conferenceInfo}
                      </span>
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                          client.acceptsPA
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                        }`}
                      >
                        {client.acceptsPA ? "✓ Aceita P.A." : "✕ Sem P.A."}
                      </span>
                    </td>
                  )}

                  {/* Limite de Compras */}
                  {visibleColumns.includes("limit") && (
                    <td className="p-3.5 font-bold text-brand-gold font-mono text-xs">
                      {formatValue(client.creditLimit || 0, "currency")}
                    </td>
                  )}

                  {/* Status */}
                  {visibleColumns.includes("status") && (
                    <td className="p-3.5">
                      <button
                        onClick={() => handleToggleStatus(client)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${
                          client.status === "ACTIVE"
                            ? "bg-green-500/15 text-green-400 border-green-500/30 hover:bg-green-500/25"
                            : "bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25"
                        }`}
                      >
                        {client.status === "ACTIVE" ? "Ativo" : "Inativo"}
                      </button>
                    </td>
                  )}

                  {/* Ações */}
                  {visibleColumns.includes("actions") && (
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenModal(client)}
                          className="p-1.5 text-brand-offwhite/70 hover:text-brand-gold hover:bg-brand-blue/20 rounded-lg transition"
                          title="Editar Cliente"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id, client.name)}
                          className="p-1.5 text-brand-offwhite/50 hover:text-red-400 hover:bg-brand-blue/20 rounded-lg transition"
                          title="Excluir Cliente"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CADASTRO / EDIÇÃO DE CLIENTE                                       */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-brand-graphite border border-brand-blue/50 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-brand-blue/30 flex justify-between items-center bg-brand-black/40">
              <div className="flex items-center space-x-2">
                <Store className="text-brand-gold" size={20} />
                <h3 className="text-lg font-black text-brand-offwhite">
                  {editingClient ? `Editar Cliente: ${editingClient.name}` : "Novo Cliente"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-brand-offwhite/50 hover:text-brand-offwhite"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
              {/* Foto do Estabelecimento e Dados Principais (Requisito 11 e 14) */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-brand-black/40 rounded-xl border border-brand-blue/30">
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 rounded-xl bg-brand-blue/30 border-2 border-brand-gold/50 flex items-center justify-center overflow-hidden shadow-md">
                    {formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        alt="Fachada"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Store size={32} className="text-brand-gold/60" />
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-1.5 bg-brand-gold text-brand-black rounded-lg shadow hover:bg-yellow-500 transition"
                    title="Carregar Foto da Fachada"
                  >
                    <Camera size={14} />
                  </button>
                </div>

                <div className="flex-1 w-full space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-brand-offwhite mb-1">
                      Foto da Fachada / Estabelecimento (Reconhecimento Visual em Campo)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={formData.imageUrl || ""}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="Cole a URL da imagem ou clique no ícone da câmera para enviar arquivo..."
                        className="flex-1 px-3 py-1.5 bg-brand-black border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite focus:outline-none focus:border-brand-gold"
                      />
                      {formData.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: "" })}
                          className="px-2 py-1.5 bg-brand-graphite border border-brand-blue/40 text-brand-offwhite/60 hover:text-red-400 rounded-lg text-xs"
                        >
                          Limpar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Nome e Documento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-offwhite mb-1">
                    Nome do Cliente / Razão Social *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Barbearia Dom Lucas Barber Club"
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-offwhite mb-1">
                    CNPJ ou CPF
                  </label>
                  <input
                    type="text"
                    value={formData.document || ""}
                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                    placeholder="00.000.000/0001-00"
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite font-mono focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              {/* BLOCO: ROTA, ORDEM DE VISITA E CÓDIGO AUTOMÁTICO (REQUISITO 7) */}
              <div className="p-4 bg-brand-black/50 rounded-xl border border-brand-blue/30 space-y-3">
                <label className="text-xs font-bold text-brand-gold uppercase tracking-wider flex items-center space-x-1.5">
                  <MapPin size={15} />
                  <span>Logística da Rota & Código Automatizado (Requisito 7)</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-brand-offwhite/70 mb-1">
                      Rota Atribuída
                    </label>
                    <select
                      value={formData.routeId || "R1"}
                      onChange={(e) => handleRouteChange(e.target.value)}
                      className="w-full px-3 py-2 bg-brand-graphite border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite font-bold focus:outline-none focus:border-brand-gold"
                    >
                      {availableRoutes.filter((r) => r !== "Todas").map((r) => (
                        <option key={r} value={r}>
                          Rota {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-brand-offwhite/70 mb-1">
                      Ordem de Atendimento / Visita
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.order || 1}
                      onChange={(e) => handleOrderChange(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-brand-graphite border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite font-mono font-bold focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-brand-offwhite/70 mb-1">
                      Código Automatizado do Cliente
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formData.code || ""}
                      className="w-full px-3 py-2 bg-brand-blue/20 border border-brand-gold/40 rounded-lg text-xs text-brand-gold font-mono font-black focus:outline-none cursor-not-allowed"
                      title="Código gerado automaticamente com base na rota e ordem de atendimento"
                    />
                  </div>
                </div>
              </div>

              {/* BLOCO: COMPRADORES (ATÉ 5) COM MÁSCARA (REQUISITO 12) */}
              <div className="p-4 bg-brand-black/50 rounded-xl border border-brand-blue/30 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-brand-gold uppercase tracking-wider flex items-center space-x-1.5">
                    <MessageCircle size={15} />
                    <span>Compradores & WhatsApp (Até 5 com Máscara Automática)</span>
                  </label>
                  {(formData.buyers || []).length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddBuyer}
                      className="flex items-center space-x-1 px-2.5 py-1 bg-brand-blue/30 text-brand-gold hover:bg-brand-blue/50 rounded-lg text-xs font-bold transition border border-brand-gold/30"
                    >
                      <UserPlus size={13} />
                      <span>+ Adicionar Comprador</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {(formData.buyers || []).map((b, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-7 gap-2 items-center">
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          required
                          value={b.name}
                          onChange={(e) => handleBuyerChange(idx, "name", e.target.value)}
                          placeholder={`Nome Comprador ${idx + 1}`}
                          className="w-full px-3 py-1.5 bg-brand-graphite border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite focus:outline-none focus:border-brand-gold"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          required
                          value={b.phone}
                          onChange={(e) => handleBuyerChange(idx, "phone", e.target.value)}
                          placeholder="(31) 98888-0000"
                          className="w-full px-3 py-1.5 bg-brand-graphite border border-brand-blue/40 rounded-lg text-xs text-green-400 font-mono font-bold focus:outline-none focus:border-brand-gold"
                        />
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        {(formData.buyers || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveBuyer(idx)}
                            className="p-1.5 text-brand-offwhite/40 hover:text-red-400 transition"
                            title="Remover Comprador"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Condição Comercial, Aceita P.A. e Limite com Máscara Financeira (Requisito 8) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brand-offwhite mb-1">
                    Condição Comercial
                  </label>
                  <select
                    value={formData.conferenceInfo || "prazo 30 dias"}
                    onChange={(e) => setFormData({ ...formData, conferenceInfo: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  >
                    {availableConditions.filter((c) => c !== "Todas").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-offwhite mb-1">
                    Aceita P.A. (Prazo Aberto)?
                  </label>
                  <select
                    value={formData.acceptsPA ? "SIM" : "NAO"}
                    onChange={(e) => setFormData({ ...formData, acceptsPA: e.target.value === "SIM" })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite font-bold focus:outline-none focus:border-brand-gold"
                  >
                    <option value="SIM">Sim (Aceita P.A.)</option>
                    <option value="NAO">Não (Apenas À Vista / Cartão)</option>
                  </select>
                </div>

                {/* Limite de Compra com Máscara Financeira em Tempo Real (Requisito 8) */}
                <div>
                  <label className="block text-xs font-bold text-brand-offwhite mb-1">
                    Limite de Compras Mensal (R$) *
                  </label>
                  <input
                    type="text"
                    value={creditLimitDisplay}
                    onChange={(e) => handleCreditLimitChange(e.target.value)}
                    placeholder="R$ 2.000,00"
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-gold font-mono font-bold focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              {/* BLOCO: ENDEREÇO COM BUSCA POR CEP (REQUISITO 9) */}
              <div className="p-4 bg-brand-black/50 rounded-xl border border-brand-blue/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-brand-gold uppercase tracking-wider flex items-center space-x-1.5">
                    <MapPin size={15} />
                    <span>Endereço Completo & Preenchimento Automático por CEP (ViaCEP)</span>
                  </label>
                  {isSearchingCep && (
                    <span className="text-[11px] text-brand-gold flex items-center space-x-1 font-bold">
                      <RefreshCw size={11} className="animate-spin" />
                      <span>Consultando ViaCEP...</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-brand-offwhite/60 mb-1">CEP (8 dígitos)</label>
                    <input
                      type="text"
                      value={formData.cep || ""}
                      onChange={(e) => handleCepChange(e.target.value)}
                      placeholder="00000-000"
                      className="w-full px-3 py-1.5 bg-brand-graphite border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite focus:outline-none focus:border-brand-gold font-mono font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-brand-offwhite/60 mb-1">Logradouro (Rua / Av)</label>
                    <input
                      type="text"
                      value={formData.street || ""}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      placeholder="Rua das Palmeiras"
                      className="w-full px-3 py-1.5 bg-brand-graphite border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-brand-offwhite/60 mb-1">Número</label>
                    <input
                      type="text"
                      value={formData.number || ""}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      placeholder="120"
                      className="w-full px-3 py-1.5 bg-brand-graphite border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-brand-offwhite/60 mb-1">Complemento</label>
                    <input
                      type="text"
                      value={formData.complement || ""}
                      onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                      placeholder="Sala 02, Loja B..."
                      className="w-full px-3 py-1.5 bg-brand-graphite border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-brand-offwhite/60 mb-1">Bairro</label>
                    <input
                      type="text"
                      value={formData.neighborhood || ""}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      placeholder="Centro"
                      className="w-full px-3 py-1.5 bg-brand-graphite border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-brand-offwhite/60 mb-1">Cidade</label>
                    <input
                      type="text"
                      value={formData.city || ""}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Belo Horizonte"
                      className="w-full px-3 py-1.5 bg-brand-graphite border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite focus:outline-none focus:border-brand-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-brand-offwhite/60 mb-1">UF</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={formData.state || "MG"}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-1.5 bg-brand-graphite border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite font-mono uppercase focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-brand-offwhite/60 mb-1">Ponto de Referência</label>
                  <input
                    type="text"
                    value={formData.reference || ""}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="Próximo à praça central, em frente ao posto..."
                    className="w-full px-3 py-1.5 bg-brand-graphite border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              {/* OBSERVAÇÃO DO CLIENTE (REQUISITO 10 - Renomeado de 'Observação da Rota') */}
              <div>
                <label className="block text-xs font-bold text-brand-offwhite mb-1">
                  Observação do Cliente
                </label>
                <textarea
                  rows={2}
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  placeholder="Instruções de entrega, preferências do comprador, dias de melhor atendimento..."
                />
              </div>

              {/* Botões do Modal */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-brand-blue/30">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-brand-offwhite/70 hover:text-brand-offwhite transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-brand-gold text-brand-black rounded-xl font-extrabold hover:bg-yellow-500 transition shadow-lg text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw size={14} className="animate-spin text-brand-black" />
                      <span>Gravando na nuvem...</span>
                    </>
                  ) : (
                    <>
                      <Cloud size={14} className="text-brand-black" />
                      <span>Salvar Cliente</span>
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
