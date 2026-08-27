"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Layers,
  DollarSign,
  Tag,
  Barcode,
  Lock,
  Unlock,
  Image as ImageIcon,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import initialProducts from "@/lib/products_catalog.json";
import { usePrivacy } from "@/lib/privacyContext";

export interface ProductItem {
  id: string;
  code: string;
  name: string;
  brand: string;
  imageUrl?: string;
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

const BRANDS = [
  "Todas as Marcas",
  "LUKE Brasil",
  "Alfa Look's",
  "FOX For Men",
  "QOD Barber Shop",
  "Prohall Professional",
  "Wilkinson / Derby",
  "Outra Marca",
];

export default function LukeProdutosPage() {
  const { hideValues, togglePrivacy, formatValue } = usePrivacy();
  const [products, setProducts] = useState<ProductItem[]>(initialProducts as ProductItem[]);
  const [loadingFirestore, setLoadingFirestore] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedBrand, setSelectedBrand] = useState("Todas as Marcas");
  const [filterBlocked, setFilterBlocked] = useState<"ALL" | "ACTIVE" | "BLOCKED">("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [formData, setFormData] = useState<Partial<ProductItem>>({
    code: "",
    name: "",
    brand: "LUKE Brasil",
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80",
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

  // Carregar produtos do Firestore
  const fetchProductsFromFirestore = async () => {
    try {
      setLoadingFirestore(true);
      const snapshot = await getDocs(collection(db, `tenants/${tenantId}/products`));
      if (!snapshot.empty) {
        const loaded: ProductItem[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          loaded.push({
            id: docSnap.id,
            code: d.code || "",
            name: d.name || "Produto",
            brand: d.brand || "LUKE Brasil",
            imageUrl: d.imageUrl || "",
            category: d.category || "Geral",
            unit: d.unit || "un",
            price: Number(d.price || 0),
            costPrice: Number(d.costPrice || 0),
            barcode: d.barcode || "",
            minStock: Number(d.minStock || 20),
            physicalStock: Number(d.physicalStock || 0),
            reservedStock: Number(d.reservedStock || 0),
            availableStock: Number(d.availableStock || 0),
            blockedForLoading: Boolean(d.blockedForLoading),
            blockingReason: d.blockingReason || "",
            order: Number(d.order || 0),
            active: d.active !== false,
          });
        });
        loaded.sort((a, b) => (a.order || 0) - (b.order || 0));
        setProducts(loaded);
      }
    } catch (err: any) {
      console.warn("Firestore fetch offline/fallback:", err?.message);
    } finally {
      setLoadingFirestore(false);
    }
  };

  useEffect(() => {
    fetchProductsFromFirestore();
  }, []);

  // Sincronizar catálogo inicial completo para Firestore
  const handleSyncFirestore = async () => {
    setLoadingFirestore(true);
    setSyncMessage(null);
    try {
      const batch = writeBatch(db);
      for (const prod of products) {
        const prodRef = doc(db, `tenants/${tenantId}/products`, prod.id);
        batch.set(prodRef, { ...prod, updatedAt: new Date() }, { merge: true });
      }
      await batch.commit();
      setSyncMessage("✅ Catálogo multi-marcas sincronizado com o Firestore com sucesso!");
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (err: any) {
      setSyncMessage(`❌ Erro ao sincronizar: ${err?.message}`);
    } finally {
      setLoadingFirestore(false);
    }
  };

  // Filtragem
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode.includes(searchTerm);

      const matchesCategory =
        selectedCategory === "Todas" || p.category === selectedCategory;

      const matchesBrand =
        selectedBrand === "Todas as Marcas" || p.brand === selectedBrand;

      const matchesBlocked =
        filterBlocked === "ALL" ||
        (filterBlocked === "BLOCKED" && p.blockedForLoading) ||
        (filterBlocked === "ACTIVE" && !p.blockedForLoading);

      return matchesSearch && matchesCategory && matchesBrand && matchesBlocked;
    });
  }, [products, searchTerm, selectedCategory, selectedBrand, filterBlocked]);

  // Modal Handlers
  const handleOpenModal = (prod?: ProductItem) => {
    if (prod) {
      setEditingProduct(prod);
      setFormData({
        ...prod,
        brand: prod.brand || "LUKE Brasil",
        imageUrl: prod.imageUrl || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80",
      });
    } else {
      setEditingProduct(null);
      const nextOrder = products.length + 1;
      const nextId = `PROD-${String(nextOrder).padStart(3, "0")}`;
      setFormData({
        id: nextId,
        code: `LK${nextOrder}`,
        name: "",
        brand: selectedBrand !== "Todas as Marcas" ? selectedBrand : "LUKE Brasil",
        imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80",
        category: selectedCategory !== "Todas" ? selectedCategory : "Pomadas & Ceras",
        unit: "un",
        price: 30,
        costPrice: 10,
        barcode: "",
        minStock: 20,
        physicalStock: 50,
        reservedStock: 0,
        availableStock: 50,
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

    const payload: ProductItem = {
      id: formData.id || `PROD-${Date.now()}`,
      code: formData.code?.trim() || `LK${products.length + 1}`,
      name: formData.name.trim(),
      brand: formData.brand || "LUKE Brasil",
      imageUrl: formData.imageUrl || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80",
      category: formData.category || "Geral",
      unit: formData.unit || "un",
      price: Number(formData.price || 0),
      costPrice: Number(formData.costPrice || 0),
      barcode: formData.barcode?.trim() || "",
      minStock: Number(formData.minStock || 20),
      physicalStock: Number(formData.physicalStock || 0),
      reservedStock: Number(formData.reservedStock || 0),
      availableStock: Number(formData.physicalStock || 0) - Number(formData.reservedStock || 0),
      blockedForLoading: Boolean(formData.blockedForLoading),
      blockingReason: formData.blockingReason || "",
      order: Number(formData.order || products.length + 1),
      active: formData.active !== false,
    };

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? payload : p))
      );
    } else {
      setProducts((prev) => [payload, ...prev]);
    }

    try {
      await setDoc(doc(db, `tenants/${tenantId}/products`, payload.id), {
        ...payload,
        updatedAt: new Date(),
      });
    } catch (err) {
      console.warn("Gravado localmente:", err);
    }

    setIsModalOpen(false);
  };

  const handleToggleBlock = async (prod: ProductItem) => {
    const updated = {
      ...prod,
      blockedForLoading: !prod.blockedForLoading,
      blockingReason: !prod.blockedForLoading ? "Bloqueado pelo Gestor" : "",
    };
    setProducts((prev) => prev.map((p) => (p.id === prod.id ? updated : p)));

    try {
      await setDoc(
        doc(db, `tenants/${tenantId}/products`, prod.id),
        {
          blockedForLoading: updated.blockedForLoading,
          blockingReason: updated.blockingReason,
          updatedAt: new Date(),
        },
        { merge: true }
      );
    } catch (e) {}
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente remover este produto do catálogo?")) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      try {
        await deleteDoc(doc(db, `tenants/${tenantId}/products`, id));
      } catch (e) {}
    }
  };

  // Métricas
  const totalCount = products.length;
  const blockedCount = products.filter((p) => p.blockedForLoading).length;
  const activeCount = products.filter((p) => !p.blockedForLoading).length;
  const totalStockValue = products.reduce((acc, curr) => acc + curr.price * (curr.availableStock || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header com Nomes de 1 Palavra */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-extrabold text-brand-offwhite">Produtos</h2>
            <span className="bg-brand-gold/20 text-brand-gold text-xs px-2.5 py-1 rounded-full font-bold border border-brand-gold/30">
              {totalCount} itens
            </span>
          </div>
          <p className="text-brand-offwhite/60 text-sm mt-1">
            Gestão multi-marcas, fotos dos produtos, preços, código de barras e travas de carregamento.
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
            onClick={handleSyncFirestore}
            disabled={loadingFirestore}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-brand-blue/40 border border-brand-gold/40 text-brand-offwhite hover:bg-brand-blue/60 px-3.5 py-2.5 rounded-xl font-semibold transition text-xs shadow-md"
            title="Sincronizar produtos com Firestore"
          >
            <RefreshCw size={14} className={loadingFirestore ? "animate-spin text-brand-gold" : "text-brand-gold"} />
            <span>Sincronizar</span>
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-brand-gold text-brand-black px-4 py-2.5 rounded-xl font-extrabold hover:bg-yellow-500 transition shadow-lg text-xs shrink-0"
          >
            <Plus size={16} />
            <span>Novo Produto</span>
          </button>
        </div>
      </div>

      {/* Sync Alert */}
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
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Catálogo</span>
            <Package size={18} className="text-brand-gold" />
          </div>
          <p className="text-2xl font-black text-brand-offwhite mt-2">{totalCount}</p>
          <span className="text-[11px] text-green-400 font-medium">Itens cadastrados</span>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Liberados</span>
            <Layers size={18} className="text-green-400" />
          </div>
          <p className="text-2xl font-black text-green-400 mt-2">{activeCount}</p>
          <span className="text-[11px] text-brand-offwhite/50">Disponíveis nos veículos</span>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Bloqueados</span>
            <Lock size={18} className="text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">{blockedCount}</p>
          <span className="text-[11px] text-brand-offwhite/50">Bloqueio temporário</span>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Estoque</span>
            <DollarSign size={18} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">
            {formatValue(totalStockValue)}
          </p>
          <span className="text-[11px] text-brand-offwhite/50">Preço de tabela disponível</span>
        </div>
      </div>

      {/* Categorias Pills */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-brand-offwhite/70 uppercase tracking-wider">
          Categorias de Cosméticos:
        </span>
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
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-brand-graphite rounded-2xl border border-brand-blue/30 shadow-xl overflow-hidden">
        {/* Barra de Busca e Filtro de Marca */}
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
              placeholder="Buscar por nome, marca, código ou código de barras..."
            />
          </div>

          <div className="flex items-center space-x-2">
            {/* Seletor de Marcas */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-brand-black border border-brand-blue/50 text-brand-gold font-bold text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-gold"
            >
              {BRANDS.map((b) => (
                <option key={b} value={b}>
                  🏷️ {b}
                </option>
              ))}
            </select>

            <select
              value={filterBlocked}
              onChange={(e: any) => setFilterBlocked(e.target.value)}
              className="bg-brand-black border border-brand-blue/50 text-brand-offwhite text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-gold"
            >
              <option value="ALL">Todos os Carregamentos</option>
              <option value="ACTIVE">Liberados para Rota</option>
              <option value="BLOCKED">Apenas Bloqueados</option>
            </select>
          </div>
        </div>

        {/* Listagem */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-blue/10 border-b border-brand-blue/30 text-brand-offwhite/70 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium w-16">Foto</th>
                <th className="p-4 font-medium">Produto</th>
                <th className="p-4 font-medium">Categoria</th>
                <th className="p-4 font-medium">Preço</th>
                <th className="p-4 font-medium">Custo</th>
                <th className="p-4 font-medium">Estoque</th>
                <th className="p-4 font-medium">Cargas</th>
                <th className="p-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-blue/10 text-sm">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-brand-blue/5 transition group">
                  {/* Foto Thumbnail */}
                  <td className="p-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-black border border-brand-blue/30 overflow-hidden flex items-center justify-center shrink-0">
                      {prod.imageUrl ? (
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                          onError={(e: any) => {
                            e.target.src = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80";
                          }}
                        />
                      ) : (
                        <ImageIcon size={20} className="text-brand-offwhite/30" />
                      )}
                    </div>
                  </td>

                  {/* Nome e Marca */}
                  <td className="p-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-brand-gold/15 text-brand-gold font-bold text-[10px] rounded border border-brand-gold/30 uppercase">
                          {prod.brand || "LUKE Brasil"}
                        </span>
                        <span className="text-xs text-brand-offwhite/40 font-mono">
                          {prod.code}
                        </span>
                      </div>
                      <p className="text-brand-offwhite font-bold mt-0.5">{prod.name}</p>
                      <p className="text-[11px] text-brand-offwhite/40 font-mono flex items-center space-x-1">
                        <Barcode size={11} />
                        <span>{prod.barcode || "Sem EAN"}</span>
                      </p>
                    </div>
                  </td>

                  {/* Categoria */}
                  <td className="p-4">
                    <span className="text-xs px-2.5 py-1 bg-brand-black/60 text-brand-offwhite/90 rounded-md border border-brand-blue/20">
                      {prod.category}
                    </span>
                  </td>

                  {/* Preço de Tabela */}
                  <td className="p-4 font-mono font-bold text-brand-gold">
                    {formatValue(prod.price)}
                    <span className="text-[10px] text-brand-offwhite/40 ml-1 font-normal">/{prod.unit}</span>
                  </td>

                  {/* Custo */}
                  <td className="p-4 font-mono text-xs text-brand-offwhite/60">
                    {prod.costPrice ? formatValue(prod.costPrice) : "---"}
                  </td>

                  {/* Estoque */}
                  <td className="p-4">
                    <div className="text-xs font-mono">
                      <span className="font-bold text-emerald-400">{prod.availableStock || prod.physicalStock || 0}</span>
                      <span className="text-brand-offwhite/40"> disp.</span>
                    </div>
                    <span className="text-[10px] text-brand-offwhite/40">Mín: {prod.minStock || 20}un</span>
                  </td>

                  {/* Trava Rota */}
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleBlock(prod)}
                      className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
                        prod.blockedForLoading
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30"
                          : "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                      }`}
                    >
                      {prod.blockedForLoading ? (
                        <>
                          <Lock size={12} />
                          <span>Bloqueado</span>
                        </>
                      ) : (
                        <>
                          <Unlock size={12} />
                          <span>Liberado</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Ações */}
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenModal(prod)}
                      title="Editar Produto"
                      className="text-brand-offwhite/50 hover:text-brand-gold p-1.5 rounded-lg hover:bg-brand-blue/10 transition"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(prod.id)}
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
                  {editingProduct ? "Editar Produto" : "Novo Produto"}
                </h3>
                <p className="text-xs text-brand-offwhite/60">
                  Defina a marca, foto ilustrativa, categoria e regras de estoque.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* Marca & Nome */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Marca
                  </label>
                  <select
                    value={formData.brand || "LUKE Brasil"}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-gold font-bold focus:outline-none focus:border-brand-gold"
                  >
                    {BRANDS.filter((b) => b !== "Todas as Marcas").map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Nome do Produto
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                    placeholder="Ex: Pomada Efeito Teia 150g"
                  />
                </div>
              </div>

              {/* URL da Imagem com Preview */}
              <div>
                <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                  Foto do Produto (URL)
                </label>
                <div className="flex space-x-3 items-center">
                  <div className="w-12 h-12 rounded-xl bg-brand-black border border-brand-blue/40 overflow-hidden shrink-0 flex items-center justify-center">
                    {formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e: any) => {
                          e.target.src = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80";
                        }}
                      />
                    ) : (
                      <ImageIcon size={20} className="text-brand-offwhite/30" />
                    )}
                  </div>
                  <input
                    type="url"
                    value={formData.imageUrl || ""}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="flex-1 px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite focus:outline-none focus:border-brand-gold font-mono"
                    placeholder="https://exemplo.com/foto-produto.jpg"
                  />
                </div>
              </div>

              {/* Categoria, Unidade e Código */}
              <div className="grid grid-cols-3 gap-4">
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
                    Unidade
                  </label>
                  <input
                    type="text"
                    value={formData.unit || "un"}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                    placeholder="un, Kit, Galão 5L..."
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
                    placeholder="PROD-001"
                  />
                </div>
              </div>

              {/* Preços e Código de Barras */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price || ""}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-gold font-bold focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Custo (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice || ""}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Código de Barras (EAN)
                  </label>
                  <input
                    type="text"
                    value={formData.barcode || ""}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite font-mono focus:outline-none focus:border-brand-gold"
                    placeholder="789800000001"
                  />
                </div>
              </div>

              {/* Estoques */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Estoque Físico
                  </label>
                  <input
                    type="number"
                    value={formData.physicalStock || 0}
                    onChange={(e) => setFormData({ ...formData, physicalStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Estoque Mínimo
                  </label>
                  <input
                    type="number"
                    value={formData.minStock || 20}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center space-x-2 text-xs text-brand-offwhite cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.blockedForLoading)}
                      onChange={(e) => setFormData({ ...formData, blockedForLoading: e.target.checked })}
                      className="rounded bg-brand-black border-brand-blue/50 text-brand-gold focus:ring-brand-gold"
                    />
                    <span>Bloquear Cargas</span>
                  </label>
                </div>
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
