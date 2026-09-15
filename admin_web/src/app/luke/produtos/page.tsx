"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  Cloud,
  Upload,
} from "lucide-react";
import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import initialProducts from "@/lib/products_catalog.json";
import { usePrivacy } from "@/lib/privacyContext";
import ToastFeedback, { ToastMessage } from "@/components/ToastFeedback";
import CurrencyInput from "@/components/CurrencyInput";
import NumberInput from "@/components/NumberInput";
import { logActivity } from "@/lib/activityLogger";

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

// Helper para comprimir e converter imagem local para Base64 leve (<50KB)
const compressImageFile = (file: File, maxWidth = 600, maxHeight = 600, quality = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const dataUrl = canvas.toDataURL("image/webp", quality);
          resolve(dataUrl);
        } catch {
          resolve(canvas.toDataURL("image/jpeg", quality));
        }
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function LukeProdutosPage() {
  const { hideValues, togglePrivacy, formatValue } = usePrivacy();
  const [products, setProducts] = useState<ProductItem[]>(initialProducts as ProductItem[]);
  const [loadingFirestore, setLoadingFirestore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedBrand, setSelectedBrand] = useState("Todas as Marcas");
  const [filterBlocked, setFilterBlocked] = useState<"ALL" | "ACTIVE" | "BLOCKED">("ALL");
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToast({
        id: Date.now().toString(),
        type: "error",
        title: "Arquivo Inválido",
        message: "Selecione um arquivo de imagem válido (PNG, JPG, WebP).",
      });
      return;
    }

    try {
      setUploadingImage(true);
      const optimizedBase64 = await compressImageFile(file);
      setFormData((prev) => ({ ...prev, imageUrl: optimizedBase64 }));
      setToast({
        id: Date.now().toString(),
        type: "success",
        title: "Imagem Carregada",
        message: "Foto do produto selecionada do computador com sucesso!",
      });
    } catch (err: any) {
      console.error("Erro ao processar imagem:", err);
      setToast({
        id: Date.now().toString(),
        type: "error",
        title: "Falha na Imagem",
        message: "Não foi possível processar o arquivo selecionado.",
      });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
      } else {
        // Carga inicial em segundo plano se o banco estiver vazio
        try {
          const batch = writeBatch(db);
          for (const prod of (initialProducts as ProductItem[])) {
            const prodRef = doc(db, `tenants/${tenantId}/products`, prod.id);
            batch.set(prodRef, { ...prod, updatedAt: new Date() }, { merge: true });
          }
          await batch.commit();
        } catch (seedErr) {
          console.warn("Silent initial seed products:", seedErr);
        }
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

    setIsSaving(true);
    try {
      await setDoc(doc(db, `tenants/${tenantId}/products`, payload.id), {
        ...payload,
        updatedAt: new Date().toISOString(),
      });

      if (editingProduct) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? payload : p))
        );
      } else {
        setProducts((prev) => [payload, ...prev]);
      }

      await logActivity(tenantId, {
        userName: "Administrador",
        userEmail: "admin@luke.com",
        action: editingProduct ? "PRODUTO_EDITADO" : "PRODUTO_CRIADO",
        entity: "PRODUTO",
        entityId: payload.id,
        details: `${editingProduct ? "Editou" : "Cadastrou"} produto "${payload.name}" (${payload.code}).`,
      });

      setIsModalOpen(false);
      setToast({
        type: "cloud_success",
        title: editingProduct ? "Produto Atualizado na Nuvem!" : "Produto Cadastrado na Nuvem!",
        message: `${payload.name} (${payload.code}) gravado e sincronizado no Firestore.`,
        isCloud: true,
      });
    } catch (err: any) {
      console.error("Erro ao salvar produto no Firestore:", err);
      setToast({
        type: "cloud_error",
        title: "Falha ao Salvar na Nuvem",
        message: err?.message || "Não foi possível gravar o produto no banco de dados.",
        isCloud: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleBlock = async (prod: ProductItem) => {
    const updated = {
      ...prod,
      blockedForLoading: !prod.blockedForLoading,
      blockingReason: !prod.blockedForLoading ? "Bloqueado pelo Gestor" : "",
    };

    try {
      await setDoc(
        doc(db, `tenants/${tenantId}/products`, prod.id),
        {
          blockedForLoading: updated.blockedForLoading,
          blockingReason: updated.blockingReason,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setProducts((prev) => prev.map((p) => (p.id === prod.id ? updated : p)));
      setToast({
        type: "cloud_success",
        title: updated.blockedForLoading ? "Produto Bloqueado na Nuvem" : "Produto Liberado na Nuvem",
        message: `${prod.name} ${updated.blockedForLoading ? "bloqueado para carregamento" : "liberado para carregamento"} no Firestore.`,
        isCloud: true,
      });
    } catch (err: any) {
      console.error("Erro ao alterar bloqueio de carregamento no Firestore:", err);
      setToast({
        type: "cloud_error",
        title: "Erro ao Atualizar na Nuvem",
        message: err?.message || "Não foi possível alterar o status de bloqueio no banco de dados.",
        isCloud: true,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente remover este produto do catálogo?")) {
      try {
        await deleteDoc(doc(db, `tenants/${tenantId}/products`, id));
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setToast({
          type: "cloud_success",
          title: "Produto Removido da Nuvem",
          message: "Produto excluído do banco de dados Firestore com sucesso.",
          isCloud: true,
        });
      } catch (err: any) {
        console.error("Erro ao excluir produto no Firestore:", err);
        setToast({
          type: "cloud_error",
          title: "Erro ao Excluir na Nuvem",
          message: err?.message || "Não foi possível remover o produto do banco de dados.",
          isCloud: true,
        });
      }
    }
  };

  // Métricas
  const totalCount = products.length;
  const blockedCount = products.filter((p) => p.blockedForLoading).length;
  const activeCount = products.filter((p) => !p.blockedForLoading).length;
  const totalStockValue = products.reduce((acc, curr) => acc + curr.price * (curr.availableStock || 0), 0);

  return (
    <div className="space-y-8">
      {/* Toast Feedback Notification */}
      <ToastFeedback toast={toast} onClose={() => setToast(null)} />

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
            onClick={() => handleOpenModal()}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-brand-gold text-brand-black px-4 py-2.5 rounded-xl font-extrabold hover:bg-yellow-500 transition shadow-lg text-xs shrink-0"
          >
            <Plus size={16} />
            <span>Novo Produto</span>
          </button>
        </div>
      </div>

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

              {/* Foto do Produto - Seleção de Arquivo do Computador */}
              <div>
                <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1.5">
                  Foto do Produto
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 bg-brand-black/60 border border-brand-blue/40 rounded-xl">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-20 h-20 rounded-xl bg-brand-black border-2 border-dashed border-brand-blue/50 hover:border-brand-gold overflow-hidden shrink-0 flex items-center justify-center cursor-pointer group transition shadow-inner"
                    title="Clique para escolher foto do seu computador"
                  >
                    {formData.imageUrl ? (
                      <>
                        <img
                          src={formData.imageUrl}
                          alt="Foto do Produto"
                          className="w-full h-full object-cover group-hover:opacity-80 transition"
                          onError={(e: any) => {
                            e.target.src = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80";
                          }}
                        />
                        <div className="absolute inset-0 bg-brand-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <Upload size={20} className="text-brand-gold" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-brand-offwhite/40 group-hover:text-brand-gold transition">
                        <ImageIcon size={24} />
                        <span className="text-[9px] mt-1 font-semibold">Foto</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <div>
                      <p className="text-xs font-semibold text-brand-offwhite">
                        {formData.imageUrl ? "Foto do produto pronta" : "Nenhuma foto selecionada"}
                      </p>
                      <p className="text-[11px] text-brand-offwhite/50">
                        Clique abaixo para escolher um arquivo de imagem do seu computador (JPG, PNG ou WebP).
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="px-3 py-1.5 bg-brand-gold text-brand-black rounded-lg text-xs font-bold hover:bg-yellow-500 transition shadow flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Upload size={13} />
                        <span>{uploadingImage ? "Otimizando..." : formData.imageUrl ? "Trocar Foto do PC" : "Escolher Foto do Computador"}</span>
                      </button>

                      {formData.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, imageUrl: "" }))}
                          className="px-2.5 py-1.5 bg-brand-graphite border border-brand-blue/40 text-brand-offwhite/60 hover:text-red-400 rounded-lg text-xs transition hover:bg-red-500/10 cursor-pointer"
                        >
                          Remover Foto
                        </button>
                      )}
                    </div>
                  </div>
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
                  <CurrencyInput
                    required
                    value={formData.price ?? ""}
                    onChange={(val) => setFormData({ ...formData, price: val })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-gold font-bold focus:outline-none focus:border-brand-gold"
                    placeholder="R$ 0,00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Custo (R$)
                  </label>
                  <CurrencyInput
                    value={formData.costPrice ?? ""}
                    onChange={(val) => setFormData({ ...formData, costPrice: val })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                    placeholder="R$ 0,00"
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
                  <NumberInput
                    value={formData.physicalStock ?? 0}
                    onChange={(val) => setFormData({ ...formData, physicalStock: val })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Estoque Mínimo
                  </label>
                  <NumberInput
                    value={formData.minStock ?? 20}
                    onChange={(val) => setFormData({ ...formData, minStock: val })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                    placeholder="20"
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
                  disabled={isSaving}
                  className="px-6 py-2 bg-brand-gold text-brand-black rounded-lg font-bold hover:bg-yellow-500 transition shadow-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw size={15} className="animate-spin text-brand-black" />
                      <span>Gravando na nuvem...</span>
                    </>
                  ) : (
                    <>
                      <Cloud size={15} className="text-brand-black" />
                      <span>Salvar Produto</span>
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
