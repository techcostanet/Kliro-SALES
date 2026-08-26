"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
  X,
  Layers,
  DollarSign,
  Tag,
  Barcode,
  Lock,
  Unlock,
} from "lucide-react";
import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import initialProducts from "@/lib/products_catalog.json";

export interface ProductItem {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  costPrice?: number;
  barcode: string;
  minStock: number;
  physicalStock: number;
  reservedStock: number;
  availableStock: number;
  blockedForLoading: boolean;
  blockingReason?: string;
  order: number;
  active: boolean;
}

const CATEGORIES = [
  "Todas",
  "Pomadas & Ceras",
  "Barba & Barbearia",
  "Géis Fixadores",
  "Finalizadores & Tratamentos",
  "Lavatório & Cuidados",
  "Perfumaria",
  "Alisamentos & Química",
  "Kits de Tratamento",
  "Acessórios & Descartáveis",
];

export default function LukeProdutosPage() {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts as ProductItem[]);
  const [loadingFirestore, setLoadingFirestore] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [filterBlocked, setFilterBlocked] = useState<"ALL" | "ACTIVE" | "BLOCKED">("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [formData, setFormData] = useState<Partial<ProductItem>>({
    code: "",
    name: "",
    category: "Pomadas & Ceras",
    unit: "un",
    price: 30,
    costPrice: 10,
    barcode: "",
    minStock: 20,
    physicalStock: 0,
    reservedStock: 0,
    availableStock: 0,
    blockedForLoading: false,
    blockingReason: "",
    active: true,
  });

  const tenantId = "tenant_luke_001";

  // Carrega produtos do Firestore se existirem
  const fetchProductsFromFirestore = async () => {
    try {
      setLoadingFirestore(true);
      const snapshot = await getDocs(collection(db, `tenants/${tenantId}/products`));
      if (!snapshot.empty) {
        const loaded: ProductItem[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push({ id: docSnap.id, ...docSnap.data() } as ProductItem);
        });
        loaded.sort((a, b) => (a.order || 0) - (b.order || 0));
        setProducts(loaded);
      }
    } catch (err: any) {
      console.warn("Firestore fetch offline/fallback para JSON local:", err.message);
    } finally {
      setLoadingFirestore(false);
    }
  };

  useEffect(() => {
    fetchProductsFromFirestore();
  }, []);

  // Sincroniza em lote todos os 46 produtos no Firestore
  const handleSyncFirestore = async () => {
    setLoadingFirestore(true);
    setSyncMessage(null);
    try {
      const batch = writeBatch(db);
      for (const prod of products) {
        const prodRef = doc(db, `tenants/${tenantId}/products`, prod.id);
        batch.set(
          prodRef,
          {
            ...prod,
            updatedAt: new Date(),
          },
          { merge: true }
        );
      }
      await batch.commit();
      setSyncMessage("✅ Todos os 46 produtos foram gravados/sincronizados com o Firestore com sucesso!");
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (err: any) {
      setSyncMessage(`❌ Erro ao sincronizar: ${err.message}`);
    } finally {
      setLoadingFirestore(false);
    }
  };

  // Filtragem
  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "Todas" || p.category === selectedCategory;

    const matchesBlocked =
      filterBlocked === "ALL" ||
      (filterBlocked === "ACTIVE" && !p.blockedForLoading) ||
      (filterBlocked === "BLOCKED" && p.blockedForLoading);

    return matchesSearch && matchesCategory && matchesBlocked;
  });

  // Abertura do Modal de Novo / Editar
  const handleOpenModal = (prod?: ProductItem) => {
    if (prod) {
      setEditingProduct(prod);
      setFormData(prod);
    } else {
      setEditingProduct(null);
      const nextOrder = products.length + 1;
      const nextId = `PROD-${String(nextOrder).padStart(3, "0")}`;
      setFormData({
        id: nextId,
        code: nextId,
        name: "",
        category: "Pomadas & Ceras",
        unit: "un",
        price: 35,
        costPrice: 12,
        barcode: `789890123${String(nextOrder).padStart(4, "0")}`,
        minStock: 20,
        physicalStock: 0,
        reservedStock: 0,
        availableStock: 0,
        blockedForLoading: false,
        blockingReason: "",
        order: nextOrder,
        active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const physical = Number(formData.physicalStock || 0);
    const reserved = Number(formData.reservedStock || 0);
    const available = physical - reserved;

    const productPayload: ProductItem = {
      id: formData.id || `PROD-${Date.now()}`,
      code: formData.code || formData.id || "PROD-XXX",
      name: formData.name.trim(),
      category: formData.category || "Geral",
      unit: formData.unit || "un",
      price: Number(formData.price || 0),
      costPrice: Number(formData.costPrice || 0),
      barcode: formData.barcode || "",
      minStock: Number(formData.minStock || 0),
      physicalStock: physical,
      reservedStock: reserved,
      availableStock: available,
      blockedForLoading: Boolean(formData.blockedForLoading),
      blockingReason: formData.blockingReason || "",
      order: Number(formData.order || products.length + 1),
      active: formData.active !== false,
    };

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? productPayload : p))
      );
    } else {
      setProducts((prev) => [...prev, productPayload]);
    }

    // Salvar no Firestore
    try {
      await setDoc(doc(db, `tenants/${tenantId}/products`, productPayload.id), {
        ...productPayload,
        updatedAt: new Date(),
      });
    } catch (err) {
      console.warn("Gravado localmente (Firestore offline/erro):", err);
    }

    setIsModalOpen(false);
  };

  const handleToggleBlock = async (prod: ProductItem) => {
    const updated = { ...prod, blockedForLoading: !prod.blockedForLoading };
    setProducts((prev) => prev.map((p) => (p.id === prod.id ? updated : p)));
    try {
      await setDoc(
        doc(db, `tenants/${tenantId}/products`, prod.id),
        { blockedForLoading: updated.blockedForLoading, updatedAt: new Date() },
        { merge: true }
      );
    } catch (e) {}
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este produto do catálogo?")) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      try {
        await deleteDoc(doc(db, `tenants/${tenantId}/products`, id));
      } catch (e) {}
    }
  };

  // Métricas
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.active && !p.blockedForLoading).length;
  const blockedProducts = products.filter((p) => p.blockedForLoading).length;
  const avgPrice = products.length
    ? products.reduce((acc, p) => acc + p.price, 0) / products.length
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-extrabold text-brand-offwhite">
              Catálogo de Produtos
            </h2>
            <span className="bg-brand-gold/20 text-brand-gold text-xs px-2.5 py-1 rounded-full font-bold border border-brand-gold/30">
              {totalProducts} itens
            </span>
          </div>
          <p className="text-brand-offwhite/60 text-sm mt-1">
            Catálogo oficial LUKE Brasil importado do Backup de Carregamentos.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={handleSyncFirestore}
            disabled={loadingFirestore}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-brand-blue/40 border border-brand-gold/40 text-brand-offwhite hover:bg-brand-blue/60 px-4 py-2.5 rounded-xl font-semibold transition text-sm shadow-md"
            title="Grava todos os 46 produtos no Firestore"
          >
            <RefreshCw size={16} className={loadingFirestore ? "animate-spin text-brand-gold" : "text-brand-gold"} />
            <span>Sincronizar Firestore</span>
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-brand-gold text-brand-black px-4 py-2.5 rounded-xl font-extrabold hover:bg-yellow-500 transition shadow-lg text-sm"
          >
            <Plus size={18} />
            <span>Novo Produto</span>
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
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Total no Catálogo</span>
            <Package size={18} className="text-brand-gold" />
          </div>
          <p className="text-2xl font-black text-brand-offwhite mt-2">{totalProducts}</p>
          <span className="text-[11px] text-green-400 font-medium">100% mapeados da planilha</span>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Liberados p/ Carga</span>
            <CheckCircle2 size={18} className="text-green-400" />
          </div>
          <p className="text-2xl font-black text-green-400 mt-2">{activeProducts}</p>
          <span className="text-[11px] text-brand-offwhite/50">Disponíveis aos vendedores</span>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Bloqueados p/ Carga</span>
            <Lock size={18} className="text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">{blockedProducts}</p>
          <span className="text-[11px] text-brand-offwhite/50">Trava operacional de saída</span>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Preço Médio Tabela</span>
            <DollarSign size={18} className="text-brand-gold" />
          </div>
          <p className="text-2xl font-black text-brand-gold mt-2">
            R$ {avgPrice.toFixed(2).replace(".", ",")}
          </p>
          <span className="text-[11px] text-brand-offwhite/50">{CATEGORIES.length - 1} categorias ativas</span>
        </div>
      </div>

      {/* Categorias Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition border ${
              selectedCategory === cat
                ? "bg-brand-gold text-brand-black border-brand-gold shadow-md"
                : "bg-brand-graphite text-brand-offwhite/70 border-brand-blue/30 hover:text-brand-offwhite hover:border-brand-gold/40"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-brand-graphite rounded-2xl border border-brand-blue/30 shadow-xl overflow-hidden">
        {/* Barra de Filtros */}
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
              placeholder="Buscar por nome, código, categoria ou barras..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={filterBlocked}
              onChange={(e: any) => setFilterBlocked(e.target.value)}
              className="bg-brand-black border border-brand-blue/50 text-brand-offwhite text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-gold"
            >
              <option value="ALL">Todos os Status</option>
              <option value="ACTIVE">Apenas Liberados</option>
              <option value="BLOCKED">Apenas Bloqueados</option>
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-blue/10 border-b border-brand-blue/30 text-brand-offwhite/70 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium w-12">#</th>
                <th className="p-4 font-medium">Produto / Apresentação</th>
                <th className="p-4 font-medium">Categoria</th>
                <th className="p-4 font-medium">Cód. Barras</th>
                <th className="p-4 font-medium">Preço Tabela</th>
                <th className="p-4 font-medium">Estoque Mín.</th>
                <th className="p-4 font-medium">Carga Rota</th>
                <th className="p-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-blue/10 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-brand-offwhite/50">
                    Nenhum produto encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-brand-blue/5 transition group"
                  >
                    <td className="p-4 text-brand-offwhite/40 font-mono text-xs">
                      {String(product.order || 0).padStart(2, "0")}
                    </td>

                    <td className="p-4 text-brand-offwhite font-semibold">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-lg bg-brand-blue/30 border border-brand-blue/40 flex items-center justify-center text-brand-gold shrink-0">
                          <Package size={17} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-brand-offwhite">{product.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-blue/20 text-brand-gold font-mono">
                              {product.unit}
                            </span>
                          </div>
                          <span className="text-xs text-brand-offwhite/40 font-mono">
                            {product.code}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="text-xs px-2.5 py-1 bg-brand-black/60 text-brand-offwhite/80 rounded-md border border-brand-blue/20">
                        {product.category}
                      </span>
                    </td>

                    <td className="p-4 text-brand-offwhite/70 font-mono text-xs">
                      {product.barcode}
                    </td>

                    <td className="p-4 font-bold text-brand-gold">
                      R$ {product.price.toFixed(2).replace(".", ",")}
                    </td>

                    <td className="p-4 text-brand-offwhite/70 text-xs">
                      <span className="font-mono">{product.minStock} un</span>
                    </td>

                    <td className="p-4">
                      {product.blockedForLoading ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded border border-amber-500/30">
                          <Lock size={12} />
                          <span>Bloqueado</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-green-500/10 text-green-400 text-xs font-semibold rounded border border-green-500/30">
                          <CheckCircle2 size={12} />
                          <span>Liberado</span>
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleBlock(product)}
                        title={product.blockedForLoading ? "Liberar para carregamento" : "Bloquear carregamento"}
                        className={`p-1.5 rounded-lg transition ${
                          product.blockedForLoading
                            ? "text-amber-400 hover:bg-amber-400/20"
                            : "text-brand-offwhite/40 hover:text-amber-400 hover:bg-brand-blue/10"
                        }`}
                      >
                        {product.blockedForLoading ? <Lock size={16} /> : <Unlock size={16} />}
                      </button>

                      <button
                        onClick={() => handleOpenModal(product)}
                        title="Editar Produto"
                        className="text-brand-offwhite/50 hover:text-brand-gold p-1.5 rounded-lg hover:bg-brand-blue/10 transition"
                      >
                        <Edit2 size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(product.id)}
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
      </div>

      {/* Modal de Criação / Edição de Produto */}
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
                <Package size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-offwhite">
                  {editingProduct ? "Editar Produto" : "Novo Produto no Catálogo"}
                </h3>
                <p className="text-xs text-brand-offwhite/60">
                  Preencha os campos para cadastro e controle de estoque.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Código / SKU
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code || ""}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite font-mono focus:outline-none focus:border-brand-gold"
                    placeholder="PROD-001"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Ordem na Planilha (1-46)
                  </label>
                  <input
                    type="number"
                    value={formData.order || 0}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  placeholder="Ex: Pomada Matte 90gr"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Categoria
                  </label>
                  <select
                    value={formData.category || "Pomadas & Ceras"}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  >
                    {CATEGORIES.filter((c) => c !== "Todas").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Unidade / Apresentação
                  </label>
                  <input
                    type="text"
                    value={formData.unit || "un"}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                    placeholder="Ex: 150g, 500ml, 5L"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Preço Tabela (Venda R$)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.price || 0}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-gold font-bold focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Preço de Custo (R$)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.costPrice || 0}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Código de Barras (EAN-13)
                  </label>
                  <input
                    type="text"
                    value={formData.barcode || ""}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite font-mono focus:outline-none focus:border-brand-gold"
                    placeholder="7898901230001"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Estoque Mínimo (Alerta)
                  </label>
                  <input
                    type="number"
                    value={formData.minStock || 0}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-brand-blue/20">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.blockedForLoading || false}
                    onChange={(e) =>
                      setFormData({ ...formData, blockedForLoading: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-brand-gold focus:ring-brand-gold"
                  />
                  <span className="text-xs text-brand-offwhite font-medium">
                    Bloquear este item para carregamento nas rotas
                  </span>
                </label>
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
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
