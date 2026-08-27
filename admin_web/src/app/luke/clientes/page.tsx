"use client";

import { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import initialClients from "@/lib/clients_catalog.json";
import { usePrivacy } from "@/lib/privacyContext";
import { formatCurrency, formatPhoneBR, getWhatsAppLink } from "@/lib/formatters";

export interface BuyerContact {
  name: string;
  phone: string;
  role?: string;
}

export interface ClientItem {
  id: string;
  routeId: string;
  order: number;
  code: string;
  name: string;
  imageUrl?: string;
  // Até 5 Compradores com WhatsApp
  buyers: BuyerContact[];
  buyer?: string; // Legado / Principal
  conferenceInfo: string;
  acceptsPA: boolean; // Aceita Prazo Aberto (P.A.)
  status: "ACTIVE" | "INACTIVE";
  phone: string;
  document: string;
  // Endereço Completo Estruturado
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  reference?: string;
  address: string; // Formatado para exibição rápida
  creditLimit: number; // Limite de Compras Mensal (R$)
  businessType: string;
  notes?: string;
}

const ROUTES = [
  "Todas",
  "R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8", "R9", "R10", "R11", "R12",
  "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12",
  "RESERVA 1", "RESERVA 2", "RESERVA 3", "Representante"
];

const COMMERCIAL_CONDITIONS = [
  "Todas",
  "prazo + consignado",
  "consignado + a vista",
  "prazo 30 dias",
  "Compra Lamina",
  "Intermitente",
  "Prazo",
  "Consignado",
  "A Vista"
];

export default function LukeClientesPage() {
  const { hideValues, togglePrivacy, formatValue } = usePrivacy();

  const [clients, setClients] = useState<ClientItem[]>(() => {
    return (initialClients as any[]).map((c) => ({
      ...c,
      acceptsPA: c.acceptsPA !== undefined ? c.acceptsPA : (c.conferenceInfo?.toLowerCase().includes("prazo") ?? true),
      buyers: c.buyers && c.buyers.length > 0 ? c.buyers : [{ name: c.buyer || "Proprietário", phone: c.phone || "" }],
      cep: c.cep || "30140-000",
      street: c.street || "Rua Comercial",
      number: c.number || "100",
      complement: c.complement || "",
      neighborhood: c.neighborhood || "Centro",
      city: c.city || "Belo Horizonte",
      state: c.state || "MG",
      reference: c.reference || "",
    }));
  });

  const [loadingFirestore, setLoadingFirestore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("Todas");
  const [selectedCondition, setSelectedCondition] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);

  const [formData, setFormData] = useState<Partial<ClientItem>>({
    routeId: "R1",
    code: "",
    name: "",
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
    address: "",
    creditLimit: 2000,
    businessType: "Comércio / Distribuição",
    notes: "",
  });

  const tenantId = "tenant_luke_001";

  // Carrega do Firestore
  const fetchClientsFromFirestore = async () => {
    try {
      setLoadingFirestore(true);
      const snapshot = await getDocs(collection(db, `tenants/${tenantId}/clients`));
      if (!snapshot.empty) {
        const loaded: ClientItem[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          loaded.push({
            id: docSnap.id,
            routeId: d.routeId || "R1",
            order: Number(d.order || 0),
            code: d.code || "",
            name: d.name || "Cliente",
            buyers: d.buyers && Array.isArray(d.buyers) && d.buyers.length > 0
              ? d.buyers
              : [{ name: d.buyer || "Proprietário", phone: d.phone || "" }],
            buyer: d.buyer || "",
            conferenceInfo: d.conferenceInfo || "Prazo",
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
          });
        });
        setClients(loaded);
      }
    } catch (err: any) {
      console.warn("Firestore fetch offline/fallback:", err?.message);
    } finally {
      setLoadingFirestore(false);
    }
  };

  useEffect(() => {
    fetchClientsFromFirestore();
  }, []);

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

  // Modal Handlers
  const handleOpenModal = (cli?: ClientItem) => {
    if (cli) {
      setEditingClient(cli);
      setFormData({
        ...cli,
        buyers: cli.buyers && cli.buyers.length > 0 ? cli.buyers : [{ name: cli.buyer || "", phone: cli.phone || "", role: "Proprietário" }],
      });
    } else {
      setEditingClient(null);
      const nextOrder = clients.length + 1;
      const nextId = `CLI-R1-${String(nextOrder).padStart(3, "0")}`;
      setFormData({
        id: nextId,
        routeId: selectedRoute !== "Todas" ? selectedRoute : "R1",
        code: `R1C${nextOrder}`,
        name: "",
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

  // Compradores Dinâmicos (Até 5) - Sem prefixos fixos
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
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, buyers: updated });
  };

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
      order: editingClient?.order || clients.length + 1,
      code: formData.code || `C${clients.length + 1}`,
      name: formData.name.trim(),
      buyers: validBuyers.length > 0 ? validBuyers : [{ name: primaryBuyer, phone: primaryPhone }],
      buyer: primaryBuyer,
      conferenceInfo: formData.conferenceInfo || "Prazo",
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

    if (editingClient) {
      setClients((prev) =>
        prev.map((c) => (c.id === editingClient.id ? clientPayload : c))
      );
    } else {
      setClients((prev) => [clientPayload, ...prev]);
    }

    try {
      await setDoc(doc(db, `tenants/${tenantId}/clients`, clientPayload.id), {
        ...clientPayload,
        updatedAt: new Date(),
      });
    } catch (err) {
      console.warn("Gravado localmente:", err);
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = async (cli: ClientItem) => {
    const updatedStatus: "ACTIVE" | "INACTIVE" =
      cli.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const updated = { ...cli, status: updatedStatus };
    setClients((prev) => prev.map((c) => (c.id === cli.id ? updated : c)));

    try {
      await setDoc(
        doc(db, `tenants/${tenantId}/clients`, cli.id),
        { status: updatedStatus, updatedAt: new Date() },
        { merge: true }
      );
    } catch (e) {}
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente remover este cliente do cadastro?")) {
      setClients((prev) => prev.filter((c) => c.id !== id));
      try {
        await deleteDoc(doc(db, `tenants/${tenantId}/clients`, id));
      } catch (e) {}
    }
  };

  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === "ACTIVE").length;
  const clientsWithPA = clients.filter((c) => c.acceptsPA).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-extrabold text-brand-offwhite">Clientes</h2>
            <span className="bg-brand-gold/20 text-brand-gold text-xs px-2.5 py-1 rounded-full font-bold border border-brand-gold/30">
              {totalClients} cadastrados
            </span>
          </div>
          <p className="text-brand-offwhite/60 text-sm mt-1">
            Gestão completa de clientes, compradores com WhatsApp, condições comerciais e limites de compras mensais.
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
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

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Total Clientes</span>
            <Store size={18} className="text-brand-gold" />
          </div>
          <p className="text-2xl font-black text-brand-offwhite mt-2">{totalClients}</p>
          <span className="text-[11px] text-green-400 font-medium">Base ativa</span>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Ativos</span>
            <UserCheck size={18} className="text-green-400" />
          </div>
          <p className="text-2xl font-black text-green-400 mt-2">{activeClients}</p>
          <span className="text-[11px] text-brand-offwhite/50">Em rota de visita</span>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Aceitam P.A.</span>
            <CreditCard size={18} className="text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-400 mt-2">
            {clientsWithPA}
          </p>
          <span className="text-[11px] text-brand-offwhite/50">Elegíveis a Prazo Aberto</span>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Rotas Ativas</span>
            <MapPin size={18} className="text-brand-gold" />
          </div>
          <p className="text-2xl font-black text-brand-gold mt-2">24 Rotas</p>
          <span className="text-[11px] text-brand-offwhite/50">R1-R12 e F1-F12</span>
        </div>
      </div>

      {/* Seletor de Rotas */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-brand-offwhite/70 uppercase tracking-wider">
          Filtrar por Rota:
        </span>
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
          {ROUTES.slice(0, 15).map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRoute(r)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition border ${
                selectedRoute === r
                  ? "bg-brand-gold text-brand-black border-brand-gold shadow-md"
                  : "bg-brand-graphite text-brand-offwhite/70 border-brand-blue/30 hover:text-brand-offwhite hover:border-brand-gold/40"
              }`}
            >
              {r === "Todas" ? "Todas as Rotas" : `Rota ${r}`}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Clientes */}
      <div className="bg-brand-graphite rounded-2xl border border-brand-blue/30 shadow-xl overflow-hidden">
        {/* Barra de Busca e Filtros */}
        <div className="p-4 border-b border-brand-blue/30 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-brand-black/50">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-brand-offwhite/40" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 bg-brand-black border border-brand-blue/50 rounded-lg text-sm text-brand-offwhite placeholder-brand-offwhite/30 focus:outline-none focus:ring-1 focus:ring-brand-gold"
              placeholder="Buscar cliente, comprador, celular, bairro ou cidade..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="bg-brand-black border border-brand-blue/50 text-brand-offwhite text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-gold"
            >
              <option value="Todas">Todas as Condições</option>
              <option value="prazo">Prazo 30 Dias</option>
              <option value="consignado">Consignado</option>
              <option value="Lamina">Compra Lâmina</option>
              <option value="Intermitente">Intermitente</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="bg-brand-black border border-brand-blue/50 text-brand-offwhite text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-gold"
            >
              <option value="ALL">Todos os Status</option>
              <option value="ACTIVE">Apenas Ativos</option>
              <option value="INACTIVE">Apenas Inativos</option>
            </select>
          </div>
        </div>

        {/* Listagem */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-blue/10 border-b border-brand-blue/30 text-brand-offwhite/70 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Cliente / Razão Social</th>
                <th className="p-4 font-medium">Compradores & WhatsApp (Até 5)</th>
                <th className="p-4 font-medium">Rota</th>
                <th className="p-4 font-medium">Endereço & Cidade</th>
                <th className="p-4 font-medium">Condição & P.A.</th>
                <th className="p-4 font-medium">Limite Mensal</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-blue/10 text-sm">
              {filtered.slice(0, 50).map((client) => (
                <tr key={client.id} className="hover:bg-brand-blue/5 transition group">
                  <td className="p-4 font-semibold text-brand-offwhite">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-blue/30 border border-brand-gold/30 flex items-center justify-center text-brand-gold shrink-0 font-extrabold text-xs shadow-xs">
                        {client.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-brand-offwhite font-bold">{client.name}</p>
                        <p className="text-xs text-brand-offwhite/40 font-mono">{client.code || client.id}</p>
                      </div>
                    </div>
                  </td>

                  {/* Compradores com WhatsApp */}
                  <td className="p-4">
                    <div className="space-y-1.5">
                      {(client.buyers || [{ name: client.buyer || "Proprietário", phone: client.phone }]).map((b, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-brand-offwhite/90">
                            {b.name || "Comprador"}:
                          </span>
                          {b.phone ? (
                            <a
                              href={getWhatsAppLink(b.phone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 px-2 py-0.5 bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 rounded-md text-[11px] text-green-400 font-mono font-bold transition group-hover:border-green-400"
                              title={`Chamar ${b.name || "Comprador"} no WhatsApp`}
                            >
                              <MessageCircle size={11} className="text-green-400" />
                              <span>{formatPhoneBR(b.phone)}</span>
                            </a>
                          ) : (
                            <span className="text-[11px] text-brand-offwhite/40 italic">Sem WhatsApp</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-brand-gold/15 text-brand-gold font-bold text-xs rounded-md border border-brand-gold/30">
                      {client.routeId}
                    </span>
                  </td>

                  {/* Endereço Estruturado */}
                  <td className="p-4 text-xs text-brand-offwhite/70 max-w-xs">
                    <p className="font-medium text-brand-offwhite/90">
                      {client.neighborhood ? `${client.neighborhood}, ${client.city || "BH"}` : client.address}
                    </p>
                    <p className="text-[11px] text-brand-offwhite/40 truncate">
                      {client.street ? `${client.street}, ${client.number}` : client.address}
                    </p>
                  </td>

                  <td className="p-4 space-y-1">
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

                  <td className="p-4 text-xs font-bold text-brand-gold font-mono">
                    {formatValue(client.creditLimit || 0, "currency")}
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => handleToggleStatus(client)}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition ${
                        client.status === "ACTIVE"
                          ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                      }`}
                    >
                      {client.status === "ACTIVE" ? "Ativo" : "Inativo"}
                    </button>
                  </td>

                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenModal(client)}
                      title="Editar Cliente"
                      className="text-brand-offwhite/50 hover:text-brand-gold p-1.5 rounded-lg hover:bg-brand-blue/10 transition"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
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

        {filtered.length > 50 && (
          <div className="p-3 bg-brand-black/40 text-center text-xs text-brand-offwhite/50 border-t border-brand-blue/20">
            Exibindo 50 de {filtered.length} clientes filtrados. Use a busca para filtrar por bairro, cidade ou nome.
          </div>
        )}
      </div>

      {/* Modal de Cadastro / Edição Completa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-sm">
          <div className="bg-brand-graphite w-full max-w-2xl rounded-2xl border border-brand-blue/40 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-brand-offwhite/50 hover:text-brand-offwhite p-1 rounded-lg hover:bg-brand-blue/20 transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-gold/20 text-brand-gold flex items-center justify-center border border-brand-gold/30">
                <Store size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-offwhite">
                  {editingClient ? "Editar Cliente" : "Novo Cliente"}
                </h3>
                <p className="text-xs text-brand-offwhite/60">
                  Cadastre compradores com WhatsApp, condição comercial, limite de compras mensal e endereço estruturado.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-5">
              {/* Nome e CNPJ/CPF */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Nome do Cliente / Razão Social
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                    placeholder="Ex: Barbearia Vip Style ou Salão Realce"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    CNPJ ou CPF
                  </label>
                  <input
                    type="text"
                    value={formData.document || ""}
                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite font-mono focus:outline-none focus:border-brand-gold"
                    placeholder="00.000.000/0001-00"
                  />
                </div>
              </div>

              {/* BLOCO: COMPRADORES (ATÉ 5) */}
              <div className="p-4 bg-brand-black/50 rounded-xl border border-brand-blue/30 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-brand-gold uppercase tracking-wider flex items-center space-x-1.5">
                    <MessageCircle size={15} />
                    <span>Compradores & WhatsApp (Até 5)</span>
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
                          placeholder="Celular / WhatsApp (DDD + Número)"
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

              {/* Rota e Código */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Rota Atribuída
                  </label>
                  <select
                    value={formData.routeId || "R1"}
                    onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  >
                    {ROUTES.filter((r) => r !== "Todas").map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Código do Cliente (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.code || ""}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite font-mono focus:outline-none focus:border-brand-gold"
                    placeholder="Ex: R1C10 ou CLI-10"
                  />
                </div>
              </div>

              {/* Condição Comercial, Aceita P.A. e Limite de Compras Mensal */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Condição Comercial
                  </label>
                  <select
                    value={formData.conferenceInfo || "prazo 30 dias"}
                    onChange={(e) => setFormData({ ...formData, conferenceInfo: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  >
                    <option value="prazo 30 dias">Prazo 30 Dias</option>
                    <option value="prazo + consignado">Prazo + Consignado</option>
                    <option value="consignado + a vista">Consignado + À Vista</option>
                    <option value="Compra Lamina">Compra Lâmina</option>
                    <option value="Intermitente">Intermitente</option>
                    <option value="A Vista">À Vista</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
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

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Limite de Compras Mensal (R$)
                  </label>
                  <input
                    type="number"
                    value={formData.creditLimit || 2000}
                    onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-gold font-bold focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              {/* BLOCO: ENDEREÇO ESTRUTURADO */}
              <div className="p-4 bg-brand-black/50 rounded-xl border border-brand-blue/30 space-y-3">
                <label className="text-xs font-bold text-brand-offwhite uppercase tracking-wider flex items-center space-x-1.5">
                  <MapPin size={15} className="text-brand-gold" />
                  <span>Endereço Detalhado para Logística e Relatórios</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-brand-offwhite/60 mb-1">CEP</label>
                    <input
                      type="text"
                      value={formData.cep || ""}
                      onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                      placeholder="00000-000"
                      className="w-full px-3 py-1.5 bg-brand-graphite border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite focus:outline-none focus:border-brand-gold font-mono"
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
                      placeholder="Sala 2, Loja A"
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

              <div>
                <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                  Observações da Rota
                </label>
                <textarea
                  rows={2}
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  placeholder="Instruções de entrega, preferências do comprador..."
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
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
