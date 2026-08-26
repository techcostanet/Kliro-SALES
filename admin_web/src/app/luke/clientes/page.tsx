"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Store,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  MapPin,
  CheckCircle2,
  RefreshCw,
  X,
  CreditCard,
  Building2,
  UserCheck,
  Tag,
  SlidersHorizontal,
} from "lucide-react";
import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import initialClients from "@/lib/clients_catalog.json";

export interface ClientItem {
  id: string;
  routeId: string;
  order: number;
  code: string;
  name: string;
  buyer: string;
  conferenceInfo: string;
  status: "ACTIVE" | "INACTIVE";
  phone: string;
  document: string;
  address: string;
  creditLimit: number;
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
  const [clients, setClients] = useState<ClientItem[]>(initialClients as ClientItem[]);
  const [loadingFirestore, setLoadingFirestore] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("Todas");
  const [selectedCondition, setSelectedCondition] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);
  const [formData, setFormData] = useState<Partial<ClientItem>>({
    routeId: "R1",
    order: 1,
    code: "",
    name: "",
    buyer: "",
    conferenceInfo: "prazo 30 dias",
    status: "ACTIVE",
    phone: "",
    document: "",
    address: "",
    creditLimit: 2000,
    businessType: "Barbearia / Salão",
    notes: "",
  });

  const tenantId = "tenant_luke_001";

  // Carrega do Firestore se disponível
  const fetchClientsFromFirestore = async () => {
    try {
      setLoadingFirestore(true);
      const snapshot = await getDocs(collection(db, `tenants/${tenantId}/clients`));
      if (!snapshot.empty) {
        const loaded: ClientItem[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push({ id: docSnap.id, ...docSnap.data() } as ClientItem);
        });
        loaded.sort((a, b) => (a.order || 0) - (b.order || 0));
        setClients(loaded);
      }
    } catch (err: any) {
      console.warn("Firestore fetch offline/fallback para JSON local:", err.message);
    } finally {
      setLoadingFirestore(false);
    }
  };

  useEffect(() => {
    fetchClientsFromFirestore();
  }, []);

  // Sincroniza primeiros 100 clientes em lote no Firestore
  const handleSyncFirestore = async () => {
    setLoadingFirestore(true);
    setSyncMessage(null);
    try {
      const batch = writeBatch(db);
      // Salva os primeiros 100 no lote do Firestore
      const toSync = clients.slice(0, 100);
      for (const cli of toSync) {
        const cliRef = doc(db, `tenants/${tenantId}/clients`, cli.id);
        batch.set(cliRef, { ...cli, updatedAt: new Date() }, { merge: true });
      }
      await batch.commit();
      setSyncMessage(`✅ Base de ${toSync.length} salões sincronizada com o Firestore com sucesso!`);
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (err: any) {
      setSyncMessage(`❌ Erro ao sincronizar: ${err.message}`);
    } finally {
      setLoadingFirestore(false);
    }
  };

  // Filtragem
  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.address.toLowerCase().includes(searchTerm.toLowerCase());

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
      setFormData(cli);
    } else {
      setEditingClient(null);
      const nextOrder = clients.length + 1;
      const nextId = `CLI-R1-${String(nextOrder).padStart(3, "0")}`;
      setFormData({
        id: nextId,
        routeId: selectedRoute !== "Todas" ? selectedRoute : "R1",
        order: nextOrder,
        code: `R1C${nextOrder}`,
        name: "",
        buyer: "",
        conferenceInfo: "prazo 30 dias",
        status: "ACTIVE",
        phone: "(31) 98888-0000",
        document: "00.000.000/0001-00",
        address: "Rua Comercial, 100 - Centro",
        creditLimit: 2000,
        businessType: "Barbearia / Salão",
        notes: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const clientPayload: ClientItem = {
      id: formData.id || `CLI-${Date.now()}`,
      routeId: formData.routeId || "R1",
      order: Number(formData.order || clients.length + 1),
      code: formData.code || `C${clients.length + 1}`,
      name: formData.name.trim(),
      buyer: formData.buyer?.trim() || "Proprietário",
      conferenceInfo: formData.conferenceInfo || "Prazo",
      status: formData.status || "ACTIVE",
      phone: formData.phone || "(31) 99999-9999",
      document: formData.document || "",
      address: formData.address || "Endereço Comercial",
      creditLimit: Number(formData.creditLimit || 2000),
      businessType: formData.businessType || "Barbearia / Salão",
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
    if (confirm("Deseja realmente remover este salão do cadastro da rota?")) {
      setClients((prev) => prev.filter((c) => c.id !== id));
      try {
        await deleteDoc(doc(db, `tenants/${tenantId}/clients`, id));
      } catch (e) {}
    }
  };

  // Métricas
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === "ACTIVE").length;
  const prazoClients = clients.filter(
    (c) => c.conferenceInfo.toLowerCase().includes("prazo") || c.conferenceInfo.toLowerCase().includes("consignado")
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-extrabold text-brand-offwhite">
              Cadastro de Salões & Barbearias
            </h2>
            <span className="bg-brand-gold/20 text-brand-gold text-xs px-2.5 py-1 rounded-full font-bold border border-brand-gold/30">
              {totalClients} salões
            </span>
          </div>
          <p className="text-brand-offwhite/60 text-sm mt-1">
            Gestão completa de salões de beleza, barbearias, compradores e ordem nas rotas da LUKE Brasil.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={handleSyncFirestore}
            disabled={loadingFirestore}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-brand-blue/40 border border-brand-gold/40 text-brand-offwhite hover:bg-brand-blue/60 px-4 py-2.5 rounded-xl font-semibold transition text-sm shadow-md"
            title="Sincronizar base de clientes com o Firestore"
          >
            <RefreshCw size={16} className={loadingFirestore ? "animate-spin text-brand-gold" : "text-brand-gold"} />
            <span>Sincronizar Firestore</span>
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-brand-gold text-brand-black px-4 py-2.5 rounded-xl font-extrabold hover:bg-yellow-500 transition shadow-lg text-sm"
          >
            <Plus size={18} />
            <span>Novo Salão / Barbearia</span>
          </button>
        </div>
      </div>

      {/* Sync Message Alert */}
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
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Total Cadastrado</span>
            <Store size={18} className="text-brand-gold" />
          </div>
          <p className="text-2xl font-black text-brand-offwhite mt-2">{totalClients}</p>
          <span className="text-[11px] text-green-400 font-medium">100% mapeados da base</span>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Salões Ativos</span>
            <UserCheck size={18} className="text-green-400" />
          </div>
          <p className="text-2xl font-black text-green-400 mt-2">{activeClients}</p>
          <span className="text-[11px] text-brand-offwhite/50">Recebendo visitas na rota</span>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Condição Prazo / P.A.</span>
            <CreditCard size={18} className="text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-400 mt-2">{prazoClients}</p>
          <span className="text-[11px] text-brand-offwhite/50">Prazo 30 dias / Consignado</span>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Rotas Cobertas</span>
            <MapPin size={18} className="text-brand-gold" />
          </div>
          <p className="text-2xl font-black text-brand-gold mt-2">24 Rotas</p>
          <span className="text-[11px] text-brand-offwhite/50">R1-R12 e F1-F12</span>
        </div>
      </div>

      {/* Seletor de Rotas Pills */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-brand-offwhite/70 uppercase tracking-wider">
          Filtrar por Rota de Visitação:
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
              placeholder="Buscar salão, comprador, telefone ou código..."
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
                <th className="p-4 font-medium w-16">Ordem</th>
                <th className="p-4 font-medium">Barbearia / Salão</th>
                <th className="p-4 font-medium">Comprador</th>
                <th className="p-4 font-medium">Rota</th>
                <th className="p-4 font-medium">Contato</th>
                <th className="p-4 font-medium">Condição Comercial</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-blue/10 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-brand-offwhite/50">
                    Nenhum cliente encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 50).map((client) => (
                  <tr key={client.id} className="hover:bg-brand-blue/5 transition group">
                    <td className="p-4 text-brand-offwhite/50 font-mono text-xs">
                      #{client.order}
                    </td>

                    <td className="p-4 font-semibold text-brand-offwhite">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-lg bg-brand-blue/30 border border-brand-blue/40 flex items-center justify-center text-brand-gold shrink-0">
                          <Store size={17} />
                        </div>
                        <div>
                          <p className="text-brand-offwhite font-bold">{client.name}</p>
                          <p className="text-xs text-brand-offwhite/40 font-mono">{client.code || client.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-brand-offwhite/80">
                      <span className="font-medium text-sm">{client.buyer || "Proprietário"}</span>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-brand-gold/15 text-brand-gold font-bold text-xs rounded-md border border-brand-gold/30">
                        {client.routeId}
                      </span>
                    </td>

                    <td className="p-4 text-xs text-brand-offwhite/70">
                      <div className="flex items-center space-x-1.5">
                        <Phone size={13} className="text-brand-gold shrink-0" />
                        <span>{client.phone}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="text-xs px-2.5 py-1 bg-brand-black/60 text-brand-offwhite/90 rounded-md border border-brand-blue/20">
                        {client.conferenceInfo}
                      </span>
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
                        title="Editar Salão"
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 50 && (
          <div className="p-3 bg-brand-black/40 text-center text-xs text-brand-offwhite/50 border-t border-brand-blue/20">
            Exibindo 50 de {filtered.length} salões filtrados. Use a busca para localizar salões específicos.
          </div>
        )}
      </div>

      {/* Modal de Cadastro / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-sm">
          <div className="bg-brand-graphite w-full max-w-xl rounded-2xl border border-brand-blue/40 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
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
                  {editingClient ? "Editar Salão / Barbearia" : "Novo Salão no Roteiro"}
                </h3>
                <p className="text-xs text-brand-offwhite/60">
                  Preencha os dados cadastrais e condições de atendimento na rota.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Nome da Barbearia / Salão
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                    placeholder="Ex: Barbearia Vip Style"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Comprador / Proprietário
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.buyer || ""}
                    onChange={(e) => setFormData({ ...formData, buyer: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                    placeholder="Ex: Carlos Oliveira"
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

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Rota
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
                    Ordem de Visita
                  </label>
                  <input
                    type="number"
                    value={formData.order || 1}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Código
                  </label>
                  <input
                    type="text"
                    value={formData.code || ""}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite font-mono focus:outline-none focus:border-brand-gold"
                    placeholder="R1C10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                    Limite P.A. (R$)
                  </label>
                  <input
                    type="number"
                    value={formData.creditLimit || 2000}
                    onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-gold font-bold focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                  Endereço Completo
                </label>
                <input
                  type="text"
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  placeholder="Rua, Número, Bairro, Cidade"
                />
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
                  Salvar Salão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
