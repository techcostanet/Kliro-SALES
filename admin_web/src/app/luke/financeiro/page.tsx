"use client";

import { useState, useEffect, useMemo } from "react";
import {
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Filter,
  CreditCard,
  Building2,
  Store,
  RefreshCw,
  X,
  Wallet,
  Check,
  Tag,
  Users,
  Eye,
  EyeOff,
  RotateCcw,
  ShieldAlert,
  SlidersHorizontal,
  ChevronDown,
  Cloud,
  Edit2,
  Trash2,
} from "lucide-react";
import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import initialCategories from "@/lib/financial_categories.json";
import { usePrivacy } from "@/lib/privacyContext";
import {
  formatCurrency,
  formatDateBR,
  formatDateTimeBR,
  formatNumberBR,
} from "@/lib/formatters";
import CurrencyInput from "@/components/CurrencyInput";
import ToastFeedback, { ToastMessage } from "@/components/ToastFeedback";

// Helper recursivo para garantir que nenhum campo 'undefined' seja enviado ao Firestore
function cleanFirestoreData(data: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      continue;
    }
    if (value !== null && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      result[key] = cleanFirestoreData(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export interface PayableItem {
  id: string;
  description: string;
  categoryId: string;
  categoryName: string;
  supplier: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  paymentMethod?: string;
  competence: string;
  status: "PENDING" | "PAID" | "OVERDUE";
  recurrence?: boolean;
  recurrenceMonths?: number;
  notes?: string;
  auditTrail?: string[];
}

export interface ReceivableItem {
  id: string;
  clientName: string;
  buyerName: string;
  routeId: string;
  vendorName: string;
  amount: number;
  saleDate: string;
  scheduledDate: string;
  receivedDate?: string;
  paymentMethod?: "PIX" | "CASH" | "CARD" | "BOLETO" | "PA";
  status: "PENDING" | "RECEIVED" | "NEXT_MONTH" | "OVERDUE";
  notes?: string;
  auditTrail?: string[];
}

export interface FinancialCategory {
  id: string;
  name: string;
  type: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

const INITIAL_PAYABLES: PayableItem[] = [
  {
    id: "pay-test-001",
    description: "Comissão Comercial Venda R1 - Barbearia Dom Lucas (TESTE VIP)",
    categoryId: "CAT-005",
    categoryName: "Salário & Comissões de Vendedores",
    supplier: "Alisson (Vendedor)",
    amount: 196.0,
    dueDate: "2026-08-30",
    paymentDate: "2026-08-27",
    paymentMethod: "PIX",
    competence: "08/2026",
    status: "PAID",
    notes: "Comissão 8% sobre venda de pomadas e sprays na Barbearia Dom Lucas",
  },
  {
    id: "pay-test-002",
    description: "Frete & Logística Expressa Rota F2 - Studio Beleza Real (TESTE SHOWROOM)",
    categoryId: "CAT-009",
    categoryName: "Combustível & Abastecimento",
    supplier: "Transportadora BH Express",
    amount: 85.0,
    dueDate: "2026-08-29",
    competence: "08/2026",
    status: "PENDING",
    notes: "Entrega suplementar de 2 galões de Shampoo Lavatório 5L",
  },
  {
    id: "pay-001",
    description: "Compra Matéria-Prima / Pomadas Fábrica",
    categoryId: "CAT-008",
    categoryName: "Fornecedores & Fábrica (Cosméticos)",
    supplier: "Laboratório Hair Tech Indústria",
    amount: 14850.0,
    dueDate: "2026-08-28",
    competence: "08/2026",
    status: "PENDING",
    recurrence: false,
    notes: "Lote 200un Pomada Efeito Teia + 100un Óleo Argan",
  },
  {
    id: "pay-002",
    description: "Abastecimento Frotas Montana (Alisson)",
    categoryId: "CAT-009",
    categoryName: "Combustível & Abastecimento",
    supplier: "Posto Ipiranga Rota Centro",
    amount: 480.0,
    dueDate: "2026-08-25",
    paymentDate: "2026-08-25",
    paymentMethod: "DEBITO",
    competence: "08/2026",
    status: "PAID",
  },
  {
    id: "pay-003",
    description: "Alimentação Rota R4 (Alisson)",
    categoryId: "CAT-001",
    categoryName: "Alimentação Rota",
    supplier: "Restaurante Rota Sul",
    amount: 65.0,
    dueDate: "2026-08-26",
    paymentDate: "2026-08-26",
    paymentMethod: "PIX",
    competence: "08/2026",
    status: "PAID",
  },
  {
    id: "pay-004",
    description: "Adiantamento Salário Alexandre (Vendedor)",
    categoryId: "CAT-005",
    categoryName: "Salário Alexandre (Vendedor)",
    supplier: "Alexandre",
    amount: 1200.0,
    dueDate: "2026-08-30",
    competence: "08/2026",
    status: "PENDING",
  },
  {
    id: "pay-005",
    description: "Aluguel Galpão / Estoque Central",
    categoryId: "CAT-011",
    categoryName: "Aluguel & Galpão",
    supplier: "Imobiliária Central",
    amount: 3200.0,
    dueDate: "2026-08-20",
    paymentDate: "2026-08-20",
    paymentMethod: "BOLETO",
    competence: "08/2026",
    status: "PAID",
    recurrence: true,
    recurrenceMonths: 12,
  },
  {
    id: "pay-006",
    description: "Seguro Frota Veículos - Parcela 08/12",
    categoryId: "CAT-016",
    categoryName: "Seguro de Veículos (Frota)",
    supplier: "Porto Seguro Cia",
    amount: 890.0,
    dueDate: "2026-08-15",
    competence: "08/2026",
    status: "OVERDUE",
    notes: "Conta vencida - aguardando autorização de pagamento",
  },
];

const INITIAL_RECEIVABLES: ReceivableItem[] = [
  {
    id: "pa-test-001",
    clientName: "Barbearia Dom Lucas Barber Club & Spa (TESTE VIP)",
    buyerName: "Lucas Silveira",
    routeId: "R1",
    vendorName: "Alisson",
    amount: 1850.0,
    saleDate: "2026-08-15",
    scheduledDate: "2026-08-26",
    receivedDate: "2026-08-26",
    paymentMethod: "PIX",
    status: "RECEIVED",
    notes: "Recebido via Pix - 30un Pomada Teia + 20un Óleo Barba",
    auditTrail: ["26/08/2026 14:30 - Baixa confirmada via PIX pelo Vendedor Alisson"],
  },
  {
    id: "pa-test-002",
    clientName: "Barbearia Dom Lucas Barber Club & Spa (TESTE VIP)",
    buyerName: "Lucas Silveira",
    routeId: "R1",
    vendorName: "Alisson",
    amount: 2450.0,
    saleDate: "2026-08-20",
    scheduledDate: "2026-08-28",
    paymentMethod: "PA",
    status: "PENDING",
    notes: "P.A. 30 dias - Lote Promocional Cosméticos LUKE",
  },
  {
    id: "pa-test-003",
    clientName: "Barbearia Dom Lucas Barber Club & Spa (TESTE VIP)",
    buyerName: "Renata Meireles",
    routeId: "R1",
    vendorName: "Alisson",
    amount: 980.0,
    saleDate: "2026-08-25",
    scheduledDate: "2026-09-15",
    paymentMethod: "PA",
    status: "NEXT_MONTH",
    notes: "P.A. faturado com vencimento para Setembro/2026",
  },
  {
    id: "pa-test-004",
    clientName: "Barbearia Dom Lucas Barber Club & Spa (TESTE VIP)",
    buyerName: "Lucas Silveira",
    routeId: "R1",
    vendorName: "Alisson",
    amount: 720.0,
    saleDate: "2026-07-18",
    scheduledDate: "2026-08-18",
    paymentMethod: "PA",
    status: "OVERDUE",
    notes: "P.A. Vencido em 18/08/2026 - Em cobrança amigável pela rota R1",
  },
  {
    id: "pa-test-005",
    clientName: "Studio Beleza Real & Barbearia Vip (TESTE SHOWROOM)",
    buyerName: "Juliana Matos",
    routeId: "F2",
    vendorName: "Alexandre",
    amount: 1200.0,
    saleDate: "2026-08-10",
    scheduledDate: "2026-08-24",
    receivedDate: "2026-08-24",
    paymentMethod: "CASH",
    status: "RECEIVED",
    notes: "Recebido em Dinheiro pelo vendedor Alexandre na rota F2",
    auditTrail: ["24/08/2026 16:15 - Recebimento em espécie conferido"],
  },
  {
    id: "pa-test-006",
    clientName: "Studio Beleza Real & Barbearia Vip (TESTE SHOWROOM)",
    buyerName: "Juliana Matos",
    routeId: "F2",
    vendorName: "Alexandre",
    amount: 1680.0,
    saleDate: "2026-08-14",
    scheduledDate: "2026-08-29",
    paymentMethod: "BOLETO",
    status: "PENDING",
    notes: "Boleto bancário 15 dias - Linha Lavatório + Finalizadores",
  },
  {
    id: "pa-test-007",
    clientName: "Studio Beleza Real & Barbearia Vip (TESTE SHOWROOM)",
    buyerName: "Diego Fernandes",
    routeId: "F2",
    vendorName: "Alexandre",
    amount: 850.0,
    saleDate: "2026-08-22",
    scheduledDate: "2026-09-20",
    paymentMethod: "PA",
    status: "NEXT_MONTH",
    notes: "Programado para o próximo ciclo de visitas (Setembro)",
  },
  {
    id: "pa-test-008",
    clientName: "Studio Beleza Real & Barbearia Vip (TESTE SHOWROOM)",
    buyerName: "Juliana Matos",
    routeId: "F2",
    vendorName: "Alexandre",
    amount: 540.0,
    saleDate: "2026-07-20",
    scheduledDate: "2026-08-12",
    paymentMethod: "PA",
    status: "OVERDUE",
    notes: "P.A. Vencido em 12/08/2026 - Cobrança na próxima visita Rota F2",
  },
  {
    id: "pa-001",
    clientName: "Barbearia Vip Curvelo",
    buyerName: "Geraldo",
    routeId: "R1",
    vendorName: "Alisson",
    amount: 650.0,
    saleDate: "2026-07-28",
    scheduledDate: "2026-08-28",
    paymentMethod: "PA",
    status: "PENDING",
    notes: "P.A. 30 dias - 6un Pomada Matte + 4un Óleo Barba",
  },
  {
    id: "pa-002",
    clientName: "Cliente Master Studio",
    buyerName: "Claudio",
    routeId: "R1",
    vendorName: "Alisson",
    amount: 1120.0,
    saleDate: "2026-07-25",
    scheduledDate: "2026-08-25",
    receivedDate: "2026-08-26",
    paymentMethod: "PIX",
    status: "RECEIVED",
    notes: "Recebido via Pix na visita de rota",
  },
  {
    id: "pa-003",
    clientName: "Studio Marcos Rocha",
    buyerName: "Marcos",
    routeId: "R1",
    vendorName: "Alisson",
    amount: 480.0,
    saleDate: "2026-08-10",
    scheduledDate: "2026-09-10",
    paymentMethod: "PA",
    status: "NEXT_MONTH",
    notes: "P.A. programado para próximo mês",
  },
  {
    id: "pa-004",
    clientName: "Barbearia Navalha de Ouro",
    buyerName: "Rodrigo",
    routeId: "F2",
    vendorName: "Alexandre",
    amount: 390.0,
    saleDate: "2026-08-05",
    scheduledDate: "2026-08-20",
    paymentMethod: "PA",
    status: "OVERDUE",
    notes: "Atrasado - Cobrar na próxima rota F2",
  },
  {
    id: "pa-005",
    clientName: "Barber Club Centro",
    buyerName: "Felipe",
    routeId: "R2",
    vendorName: "Lucas",
    amount: 820.0,
    saleDate: "2026-08-12",
    scheduledDate: "2026-08-27",
    paymentMethod: "BOLETO",
    status: "PENDING",
    notes: "Boleto bancário 15 dias",
  },
  {
    id: "pa-006",
    clientName: "Barbearia Dom Pedro",
    buyerName: "Pedro Henrique",
    routeId: "R3",
    vendorName: "Alisson",
    amount: 940.0,
    saleDate: "2026-08-18",
    scheduledDate: "2026-08-28",
    paymentMethod: "CARD",
    status: "PENDING",
    notes: "Venda no Cartão Crédito 1x",
  },
  {
    id: "pa-007",
    clientName: "Espaço Homem Moderno",
    buyerName: "Guilherme",
    routeId: "F1",
    vendorName: "Alexandre",
    amount: 550.0,
    saleDate: "2026-08-20",
    scheduledDate: "2026-08-26",
    receivedDate: "2026-08-26",
    paymentMethod: "CASH",
    status: "RECEIVED",
    notes: "Recebido em Dinheiro pelo vendedor Alexandre",
  },
];

const MONTHS_LIST = [
  { value: "ALL", label: "Todos os Meses" },
  { value: "01", label: "Janeiro (01)" },
  { value: "02", label: "Fevereiro (02)" },
  { value: "03", label: "Março (03)" },
  { value: "04", label: "Abril (04)" },
  { value: "05", label: "Maio (05)" },
  { value: "06", label: "Junho (06)" },
  { value: "07", label: "Julho (07)" },
  { value: "08", label: "Agosto (08)" },
  { value: "09", label: "Setembro (09)" },
  { value: "10", label: "Outubro (10)" },
  { value: "11", label: "Novembro (11)" },
  { value: "12", label: "Dezembro (12)" },
];

const YEARS_LIST = ["2024", "2025", "2026", "2027", "2028"];

export default function LukeFinanceiroPage() {
  const { hideValues, togglePrivacy, formatValue } = usePrivacy();
  const [activeTab, setActiveTab] = useState<"PAGAR" | "RECEBER" | "CAIXA" | "CATEGORIAS">("PAGAR");
  const [payables, setPayables] = useState<PayableItem[]>([]);
  const [receivables, setReceivables] = useState<ReceivableItem[]>([]);
  const [categories, setCategories] = useState<FinancialCategory[]>(initialCategories as FinancialCategory[]);
  const [loadingFirestore, setLoadingFirestore] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const tenantId = "tenant_luke_001";
  const now = new Date();
  const curMonthStr = String(now.getMonth() + 1).padStart(2, "0");
  const curYearStr = String(now.getFullYear());
  const todayStr = now.toISOString().split("T")[0];

  // Filtros Globais / Por Aba (Iniciam no mês corrente real)
  const [selectedMonth, setSelectedMonth] = useState(curMonthStr);
  const [selectedYear, setSelectedYear] = useState(curYearStr);
  const [periodPreset, setPeriodPreset] = useState<"CURRENT" | "PREVIOUS" | "NEXT" | "YEAR" | "ALL">("CURRENT");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modais de Contas a Pagar
  const [isPayableModalOpen, setIsPayableModalOpen] = useState(false);
  const [editingPayable, setEditingPayable] = useState<PayableItem | null>(null);
  const [isSavingPayable, setIsSavingPayable] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // Modais de Contas a Receber
  const [isReceivableModalOpen, setIsReceivableModalOpen] = useState(false);
  const [editingReceivable, setEditingReceivable] = useState<ReceivableItem | null>(null);
  const [isSavingReceivable, setIsSavingReceivable] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState<ReceivableItem | null>(null);
  const [receivePaymentMethod, setReceivePaymentMethod] = useState<"PIX" | "CASH" | "CARD" | "BOLETO">("PIX");
  const [receiveDate, setReceiveDate] = useState(todayStr);

  // Modal de Categorias
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FinancialCategory | null>(null);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [categoryForm, setCategoryForm] = useState<{ name: string; type: "EXPENSE" | "INCOME" }>({
    name: "",
    type: "EXPENSE",
  });

  // Modal de Estorno de Segurança (Restrito a admin@luke.com)
  const [isReversalModalOpen, setIsReversalModalOpen] = useState(false);
  const [reversalTarget, setReversalTarget] = useState<{ type: "PAYABLE" | "RECEIVABLE"; item: any } | null>(null);
  const [reversalAdminEmail, setReversalAdminEmail] = useState("admin@luke.com");
  const [reversalReason, setReversalReason] = useState("");
  const [reversalError, setReversalError] = useState<string | null>(null);

  // Form Conta a Pagar
  const [payableForm, setPayableForm] = useState<{
    description: string;
    categoryId: string;
    supplier: string;
    amount: number;
    dueDate: string;
    competence: string;
    notes: string;
    isAlreadyPaid: boolean;
    paymentDate: string;
    paymentMethod: string;
    recurrence: boolean;
    recurrenceMonths: number;
  }>({
    description: "",
    categoryId: "CAT-001",
    supplier: "",
    amount: 100,
    dueDate: todayStr,
    competence: `${curMonthStr}/${curYearStr}`,
    notes: "",
    isAlreadyPaid: false,
    paymentDate: todayStr,
    paymentMethod: "PIX",
    recurrence: false,
    recurrenceMonths: 12,
  });

  // Form Conta a Receber
  const [receivableForm, setReceivableForm] = useState<{
    clientName: string;
    buyerName: string;
    routeId: string;
    vendorName: string;
    amount: number;
    saleDate: string;
    scheduledDate: string;
    paymentMethod: "PIX" | "CASH" | "CARD" | "BOLETO" | "PA";
    status: "PENDING" | "RECEIVED" | "NEXT_MONTH" | "OVERDUE";
    notes: string;
  }>({
    clientName: "",
    buyerName: "",
    routeId: "R1",
    vendorName: "LUKE Distribuidora",
    amount: 0,
    saleDate: todayStr,
    scheduledDate: todayStr,
    paymentMethod: "PA",
    status: "PENDING",
    notes: "",
  });

  // Pesquisa Digital de Categorias
  const [categorySearch, setCategorySearch] = useState("");

  // Helper para verificar se conta está vencida
  const isItemOverdue = (item: { status: string; dueDate?: string; scheduledDate?: string }) => {
    const targetDate = item.dueDate || item.scheduledDate;
    if (!targetDate) return false;
    return item.status === "PENDING" && targetDate < todayStr;
  };

  // Carregar do Firestore
  useEffect(() => {
    const loadFinData = async () => {
      try {
        setLoadingFirestore(true);
        const [paySnap, recSnap, catSnap] = await Promise.all([
          getDocs(collection(db, `tenants/${tenantId}/payables`)),
          getDocs(collection(db, `tenants/${tenantId}/receivables`)),
          getDocs(collection(db, `tenants/${tenantId}/categories`)),
        ]);

        const pList: PayableItem[] = [];
        if (!paySnap.empty) {
          paySnap.forEach((d) => pList.push({ id: d.id, ...d.data() } as PayableItem));
        }
        setPayables(pList);

        const rList: ReceivableItem[] = [];
        if (!recSnap.empty) {
          recSnap.forEach((d) => rList.push({ id: d.id, ...d.data() } as ReceivableItem));
        }
        setReceivables(rList);

        if (!catSnap.empty) {
          const cList: any[] = [];
          catSnap.forEach((d) => cList.push({ id: d.id, ...d.data() }));
          cList.sort((a, b) => a.name.localeCompare(b.name));
          setCategories(cList);
        } else {
          // Salva categorias padrão se Firestore estiver vazio
          try {
            const batch = writeBatch(db);
            for (const c of initialCategories) {
              batch.set(doc(db, `tenants/${tenantId}/categories`, c.id), c);
            }
            await batch.commit();
          } catch (seedCatErr) {
            console.warn("Silent initial categories seed:", seedCatErr);
          }
        }
      } catch (err: any) {
        console.warn("Firestore finance fallback to initial:", err.message);
      } finally {
        setLoadingFirestore(false);
      }
    };
    loadFinData();
  }, []);

  // Handler de Presets de Período
  const handlePeriodPresetChange = (preset: "CURRENT" | "PREVIOUS" | "NEXT" | "YEAR" | "ALL") => {
    setPeriodPreset(preset);
    const now = new Date();
    const curYear = String(now.getFullYear());
    const curMonth = String(now.getMonth() + 1).padStart(2, "0");

    if (preset === "CURRENT") {
      setSelectedMonth(curMonth);
      setSelectedYear(curYear);
    } else if (preset === "PREVIOUS") {
      let prevM = now.getMonth(); // 0-based is previous month
      let prevY = now.getFullYear();
      if (prevM === 0) {
        prevM = 12;
        prevY -= 1;
      }
      setSelectedMonth(String(prevM).padStart(2, "0"));
      setSelectedYear(String(prevY));
    } else if (preset === "NEXT") {
      let nextM = now.getMonth() + 2;
      let nextY = now.getFullYear();
      if (nextM > 12) {
        nextM = 1;
        nextY += 1;
      }
      setSelectedMonth(String(nextM).padStart(2, "0"));
      setSelectedYear(String(nextY));
    } else if (preset === "YEAR") {
      setSelectedMonth("ALL");
      setSelectedYear(curYear);
    } else if (preset === "ALL") {
      setSelectedMonth("ALL");
      setSelectedYear("ALL");
    }
  };

  // Categorias Filtradas na Busca Digital
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    return categories.filter((c) =>
      c.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  // Abertura do Modal de Despesas (Criar ou Editar)
  const handleOpenPayableModal = (item?: PayableItem) => {
    if (item) {
      setEditingPayable(item);
      setPayableForm({
        description: item.description || "",
        categoryId: item.categoryId || "CAT-001",
        supplier: item.supplier || "",
        amount: item.amount || 0,
        dueDate: item.dueDate || todayStr,
        competence: item.competence || `${curMonthStr}/${curYearStr}`,
        notes: item.notes || "",
        isAlreadyPaid: item.status === "PAID",
        paymentDate: item.paymentDate || todayStr,
        paymentMethod: item.paymentMethod || "PIX",
        recurrence: Boolean(item.recurrence),
        recurrenceMonths: item.recurrenceMonths || 12,
      });
    } else {
      setEditingPayable(null);
      setPayableForm({
        description: "",
        categoryId: "CAT-001",
        supplier: "",
        amount: 100,
        dueDate: todayStr,
        competence: `${curMonthStr}/${curYearStr}`,
        notes: "",
        isAlreadyPaid: false,
        paymentDate: todayStr,
        paymentMethod: "PIX",
        recurrence: false,
        recurrenceMonths: 12,
      });
    }
    setIsCategoryDropdownOpen(false);
    setIsPayableModalOpen(true);
  };

  // Excluir Conta a Pagar
  const handleDeletePayable = async (item: PayableItem) => {
    if (!confirm(`Deseja realmente excluir a despesa "${item.description}" (${formatCurrency(item.amount)})?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, `tenants/${tenantId}/payables`, item.id));
      setPayables((prev) => prev.filter((p) => p.id !== item.id));
      setToast({
        type: "cloud_success",
        title: "Despesa Removida da Nuvem!",
        message: `Lançamento "${item.description}" excluído com sucesso do Firestore.`,
        isCloud: true,
      });
    } catch (err: any) {
      console.error("Erro ao excluir despesa:", err);
      setToast({
        type: "cloud_error",
        title: "Erro ao Excluir da Nuvem",
        message: err?.message || "Não foi possível remover a despesa.",
        isCloud: true,
      });
    }
  };

  // Salvar Conta a Pagar (Criação ou Edição)
  const handleSavePayable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payableForm.description?.trim()) return;

    const catObj = categories.find((c) => c.id === payableForm.categoryId);
    const baseDueDate = payableForm.dueDate || todayStr;
    const isPaid = Boolean(payableForm.isAlreadyPaid);

    if (editingPayable) {
      setIsSavingPayable(true);
      try {
        const updatedItem: PayableItem = {
          ...editingPayable,
          description: payableForm.description.trim(),
          categoryId: payableForm.categoryId || "CAT-001",
          categoryName: catObj?.name || editingPayable.categoryName || "Despesa Operacional",
          supplier: payableForm.supplier?.trim() || "Diversos",
          amount: Number(payableForm.amount || 0),
          dueDate: baseDueDate,
          competence: payableForm.competence?.trim() || editingPayable.competence || `${curMonthStr}/${curYearStr}`,
          notes: payableForm.notes?.trim() || "",
          status: isPaid ? "PAID" : baseDueDate < todayStr ? "OVERDUE" : "PENDING",
        };

        if (isPaid) {
          updatedItem.paymentDate = payableForm.paymentDate?.trim() || todayStr;
          updatedItem.paymentMethod = payableForm.paymentMethod || "PIX";
        } else {
          delete updatedItem.paymentDate;
          delete updatedItem.paymentMethod;
        }

        const firestoreData = cleanFirestoreData({
          ...updatedItem,
          updatedAt: new Date().toISOString(),
        });

        await setDoc(doc(db, `tenants/${tenantId}/payables`, editingPayable.id), firestoreData, { merge: true });

        setPayables((prev) => prev.map((p) => (p.id === editingPayable.id ? updatedItem : p)));
        setToast({
          type: "cloud_success",
          title: "Despesa Atualizada na Nuvem!",
          message: `Despesa "${updatedItem.description}" sincronizada no Firestore.`,
          isCloud: true,
        });

        setIsPayableModalOpen(false);
        setEditingPayable(null);
      } catch (err: any) {
        console.error("Erro ao atualizar despesa:", err);
        setToast({
          type: "cloud_error",
          title: "Erro ao Atualizar na Nuvem",
          message: err?.message || "Não foi possível sincronizar com o Firestore.",
          isCloud: true,
        });
      } finally {
        setIsSavingPayable(false);
      }
      return;
    }

    const itemsToCreate: PayableItem[] = [];

    if (payableForm.recurrence && payableForm.recurrenceMonths > 1) {
      // Cria as parcelas recorrentes para TODOS os meses selecionados (ex: 2, 3, 6, 12, 24, 36)
      const totalMonths = Math.min(Math.max(payableForm.recurrenceMonths, 2), 36);
      const [initY, initM, initD] = baseDueDate.split("-").map(Number);

      for (let i = 0; i < totalMonths; i++) {
        // Cálculo aritmético preciso de mês e ano para evitar overflow de dia em meses curtos
        const totalZeroBasedMonths = (initM - 1) + i;
        const targetYear = initY + Math.floor(totalZeroBasedMonths / 12);
        const targetMonth = (totalZeroBasedMonths % 12) + 1; // 1 a 12
        const daysInTargetMonth = new Date(targetYear, targetMonth, 0).getDate();
        const targetDay = Math.min(initD || 1, daysInTargetMonth);

        const yStr = String(targetYear);
        const mStr = String(targetMonth).padStart(2, "0");
        const dStr = String(targetDay).padStart(2, "0");
        const compStr = `${mStr}/${yStr}`;
        const itemDue = `${yStr}-${mStr}-${dStr}`;

        const isFirstPaid = i === 0 && isPaid;

        const newItem: PayableItem = {
          id: `pay-${Date.now()}-${i + 1}-${Math.random().toString(36).substring(2, 6)}`,
          description: `${payableForm.description.trim()} (${i + 1}/${totalMonths})`,
          categoryId: payableForm.categoryId || "CAT-001",
          categoryName: catObj?.name || "Despesa Operacional",
          supplier: payableForm.supplier?.trim() || "Diversos",
          amount: Number(payableForm.amount || 0),
          dueDate: itemDue,
          competence: compStr,
          status: isFirstPaid ? "PAID" : itemDue < todayStr ? "OVERDUE" : "PENDING",
          recurrence: true,
          recurrenceMonths: totalMonths,
          notes: payableForm.notes?.trim() || "",
        };

        if (isFirstPaid) {
          newItem.paymentDate = payableForm.paymentDate?.trim() || todayStr;
          newItem.paymentMethod = payableForm.paymentMethod || "PIX";
        }

        itemsToCreate.push(newItem);
      }
    } else {
      // Conta Única
      const newItem: PayableItem = {
        id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        description: payableForm.description.trim(),
        categoryId: payableForm.categoryId || "CAT-001",
        categoryName: catObj?.name || "Despesa Operacional",
        supplier: payableForm.supplier?.trim() || "Diversos",
        amount: Number(payableForm.amount || 0),
        dueDate: baseDueDate,
        competence: payableForm.competence?.trim() || `${curMonthStr}/${curYearStr}`,
        status: isPaid ? "PAID" : baseDueDate < todayStr ? "OVERDUE" : "PENDING",
        recurrence: false,
        notes: payableForm.notes?.trim() || "",
      };

      if (isPaid) {
        newItem.paymentDate = payableForm.paymentDate?.trim() || todayStr;
        newItem.paymentMethod = payableForm.paymentMethod || "PIX";
      }

      itemsToCreate.push(newItem);
    }

    setIsSavingPayable(true);
    try {
      // Gravação atômica em lote com writeBatch para garantir que todas as parcelas sejam salvas
      const batch = writeBatch(db);
      for (const item of itemsToCreate) {
        const docRef = doc(db, `tenants/${tenantId}/payables`, item.id);
        const dataToSave = cleanFirestoreData({
          ...item,
          createdAt: new Date().toISOString(),
        });
        batch.set(docRef, dataToSave);
      }
      await batch.commit();

      setPayables((prev) => [...itemsToCreate, ...prev]);

      // Feedback Visual de Nuvem (Toast)
      if (itemsToCreate.length > 1) {
        setToast({
          type: "cloud_success",
          title: `${itemsToCreate.length} Parcelas Gravadas na Nuvem!`,
          message: `Despesa recorrente criada para todos os ${itemsToCreate.length} meses (de ${itemsToCreate[0].competence} até ${itemsToCreate[itemsToCreate.length - 1].competence}). Alterne os meses no filtro do topo ou selecione "Todos" para visualizar todas as parcelas.`,
          isCloud: true,
        });
      } else {
        setToast({
          type: "cloud_success",
          title: isPaid ? "Despesa Paga Gravada na Nuvem!" : "Despesa Cadastrada na Nuvem!",
          message: `Lançamento "${payableForm.description.trim()}" (${formatValue(payableForm.amount, "currency")}) gravado e sincronizado no Firestore.`,
          isCloud: true,
        });
      }

      // Se a competência criada for de outro mês, ajustar o filtro para exibir de imediato
      const firstComp = itemsToCreate[0].competence;
      const [fMonth, fYear] = firstComp.split("/");
      if (selectedMonth !== "ALL" && selectedMonth !== fMonth) {
        setSelectedMonth(fMonth);
      }
      if (selectedYear !== "ALL" && selectedYear !== fYear) {
        setSelectedYear(fYear);
      }
      if (isPaid && statusFilter === "PENDING") {
        setStatusFilter("ALL");
      }

      setIsPayableModalOpen(false);
      setPayableForm({
        description: "",
        categoryId: "CAT-001",
        supplier: "",
        amount: 100,
        dueDate: todayStr,
        competence: `${curMonthStr}/${curYearStr}`,
        notes: "",
        isAlreadyPaid: false,
        paymentDate: todayStr,
        paymentMethod: "PIX",
        recurrence: false,
        recurrenceMonths: 12,
      });
      setCategorySearch("");
    } catch (err: any) {
      console.error("Erro ao salvar despesas no Firestore:", err);
      setToast({
        type: "cloud_error",
        title: "Falha ao Gravar na Nuvem",
        message: err?.message || "Não foi possível sincronizar o lançamento com o Firestore.",
        isCloud: true,
      });
    } finally {
      setIsSavingPayable(false);
    }
  };

  // Handlers de Contas a Receber (Novo, Editar, Excluir)
  const handleOpenReceivableModal = (item?: ReceivableItem) => {
    if (item) {
      setEditingReceivable(item);
      setReceivableForm({
        clientName: item.clientName || "",
        buyerName: item.buyerName || "",
        routeId: item.routeId || "R1",
        vendorName: item.vendorName || "LUKE Distribuidora",
        amount: item.amount || 0,
        saleDate: item.saleDate || todayStr,
        scheduledDate: item.scheduledDate || todayStr,
        paymentMethod: (item.paymentMethod as any) || "PA",
        status: item.status || "PENDING",
        notes: item.notes || "",
      });
    } else {
      setEditingReceivable(null);
      setReceivableForm({
        clientName: "",
        buyerName: "",
        routeId: "R1",
        vendorName: "LUKE Distribuidora",
        amount: 0,
        saleDate: todayStr,
        scheduledDate: todayStr,
        paymentMethod: "PA",
        status: "PENDING",
        notes: "",
      });
    }
    setIsReceivableModalOpen(true);
  };

  const handleSaveReceivable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivableForm.clientName?.trim()) return;

    setIsSavingReceivable(true);
    try {
      if (editingReceivable) {
        const updatedItem: ReceivableItem = {
          ...editingReceivable,
          clientName: receivableForm.clientName.trim(),
          buyerName: receivableForm.buyerName.trim(),
          routeId: receivableForm.routeId || "R1",
          vendorName: receivableForm.vendorName.trim() || "LUKE Distribuidora",
          amount: Number(receivableForm.amount || 0),
          saleDate: receivableForm.saleDate || todayStr,
          scheduledDate: receivableForm.scheduledDate || todayStr,
          paymentMethod: receivableForm.paymentMethod,
          status: receivableForm.status,
          notes: receivableForm.notes || "",
        };

        const firestoreData = cleanFirestoreData({
          ...updatedItem,
          updatedAt: new Date().toISOString(),
        });

        await setDoc(doc(db, `tenants/${tenantId}/receivables`, editingReceivable.id), firestoreData, { merge: true });

        setReceivables((prev) => prev.map((r) => (r.id === editingReceivable.id ? updatedItem : r)));
        setToast({
          type: "cloud_success",
          title: "Título Atualizado na Nuvem!",
          message: `Título de "${updatedItem.clientName}" atualizado com sucesso no Firestore.`,
          isCloud: true,
        });
      } else {
        const newItem: ReceivableItem = {
          id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          clientName: receivableForm.clientName.trim(),
          buyerName: receivableForm.buyerName.trim(),
          routeId: receivableForm.routeId || "R1",
          vendorName: receivableForm.vendorName.trim() || "LUKE Distribuidora",
          amount: Number(receivableForm.amount || 0),
          saleDate: receivableForm.saleDate || todayStr,
          scheduledDate: receivableForm.scheduledDate || todayStr,
          paymentMethod: receivableForm.paymentMethod,
          status: receivableForm.status,
          notes: receivableForm.notes || "",
        };

        const firestoreData = cleanFirestoreData({
          ...newItem,
          createdAt: new Date().toISOString(),
        });

        await setDoc(doc(db, `tenants/${tenantId}/receivables`, newItem.id), firestoreData);

        setReceivables((prev) => [newItem, ...prev]);
        setToast({
          type: "cloud_success",
          title: "Título Lançado na Nuvem!",
          message: `Título a receber de "${newItem.clientName}" (${formatValue(newItem.amount, "currency")}) salvo no Firestore.`,
          isCloud: true,
        });
      }
      setIsReceivableModalOpen(false);
      setEditingReceivable(null);
    } catch (err: any) {
      console.error("Erro ao salvar conta a receber:", err);
      setToast({
        type: "cloud_error",
        title: "Erro ao Salvar Título",
        message: err?.message || "Não foi possível gravar no Firestore.",
        isCloud: true,
      });
    } finally {
      setIsSavingReceivable(false);
    }
  };

  const handleDeleteReceivable = async (item: ReceivableItem) => {
    if (!confirm(`Deseja realmente excluir o título a receber de "${item.clientName}" (${formatCurrency(item.amount)})?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, `tenants/${tenantId}/receivables`, item.id));
      setReceivables((prev) => prev.filter((p) => p.id !== item.id));
      setToast({
        type: "cloud_success",
        title: "Título Excluído da Nuvem!",
        message: `Título de "${item.clientName}" removido do Firestore.`,
        isCloud: true,
      });
    } catch (err: any) {
      console.error("Erro ao excluir conta a receber:", err);
      setToast({
        type: "cloud_error",
        title: "Erro ao Excluir Título",
        message: err?.message || "Não foi possível remover o título.",
        isCloud: true,
      });
    }
  };

  // Handlers de Categorias (Novo, Editar, Excluir)
  const handleOpenCategoryModal = (cat?: any) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({ name: cat.name || "", type: cat.type || "EXPENSE" });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "", type: "EXPENSE" });
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name?.trim()) return;

    setIsSavingCategory(true);
    try {
      if (editingCategory) {
        const updatedCat: FinancialCategory = {
          ...editingCategory,
          name: categoryForm.name.trim(),
          type: categoryForm.type,
          updatedAt: new Date().toISOString(),
        };

        const firestoreData = cleanFirestoreData(updatedCat);
        await setDoc(doc(db, `tenants/${tenantId}/categories`, editingCategory.id), firestoreData, { merge: true });
        setCategories((prev) => prev.map((c) => (c.id === editingCategory.id ? updatedCat : c)));
        setToast({
          type: "cloud_success",
          title: "Categoria Atualizada na Nuvem!",
          message: `Categoria "${updatedCat.name}" atualizada com sucesso no Firestore.`,
          isCloud: true,
        });
      } else {
        const nextNum = categories.length + 1;
        const newCatId = `CAT-${String(nextNum).padStart(3, "0")}`;
        const newCat: FinancialCategory = {
          id: newCatId,
          name: categoryForm.name.trim(),
          type: categoryForm.type,
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
        };

        const firestoreData = cleanFirestoreData(newCat);
        await setDoc(doc(db, `tenants/${tenantId}/categories`, newCatId), firestoreData);
        setCategories((prev) => [...prev, newCat]);
        setToast({
          type: "cloud_success",
          title: "Categoria Criada na Nuvem!",
          message: `Categoria "${newCat.name}" (${newCat.type === "INCOME" ? "Receita" : "Despesa"}) gravada no Firestore.`,
          isCloud: true,
        });
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
    } catch (err: any) {
      console.error("Erro ao salvar categoria:", err);
      setToast({
        type: "cloud_error",
        title: "Erro ao Salvar Categoria",
        message: err?.message || "Não foi possível gravar a categoria.",
        isCloud: true,
      });
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (cat: any) => {
    if (!confirm(`Deseja realmente excluir a categoria "${cat.name}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, `tenants/${tenantId}/categories`, cat.id));
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      setToast({
        type: "cloud_success",
        title: "Categoria Removida da Nuvem!",
        message: `Categoria "${cat.name}" excluída com sucesso do Firestore.`,
        isCloud: true,
      });
    } catch (err: any) {
      console.error("Erro ao excluir categoria:", err);
      setToast({
        type: "cloud_error",
        title: "Erro ao Excluir Categoria",
        message: err?.message || "Não foi possível excluir a categoria.",
        isCloud: true,
      });
    }
  };

  // Dar baixa em conta a pagar
  const handlePayPayable = async (item: PayableItem) => {
    const updated: PayableItem = {
      ...item,
      status: "PAID",
      paymentDate: todayStr,
      paymentMethod: "PIX",
    };

    try {
      await setDoc(
        doc(db, `tenants/${tenantId}/payables`, item.id),
        cleanFirestoreData({
          status: "PAID",
          paymentDate: todayStr,
          paymentMethod: "PIX",
          updatedAt: new Date().toISOString(),
        }),
        { merge: true }
      );
      setPayables((prev) => prev.map((p) => (p.id === item.id ? updated : p)));
      setToast({
        type: "cloud_success",
        title: "Pagamento Confirmado na Nuvem!",
        message: `Despesa "${item.description}" (${formatValue(item.amount, "currency")}) baixada no Firestore.`,
        isCloud: true,
      });
    } catch (err: any) {
      console.error("Erro ao dar baixa em despesa no Firestore:", err);
      setToast({
        type: "cloud_error",
        title: "Erro ao Registrar Pagamento",
        message: err?.message || "Não foi possível atualizar o pagamento no Firestore.",
        isCloud: true,
      });
    }
  };

  // Abrir Modal de Baixa de P.A.
  const handleOpenReceiveModal = (rec: ReceivableItem) => {
    setSelectedReceivable(rec);
    setReceiveDate(todayStr);
    setReceivePaymentMethod("PIX");
    setIsReceiveModalOpen(true);
  };

  // Confirmar Baixa de P.A. (Recebimento)
  const handleConfirmReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceivable) return;

    const updated: ReceivableItem = {
      ...selectedReceivable,
      status: "RECEIVED",
      receivedDate: receiveDate,
      paymentMethod: receivePaymentMethod,
    };

    try {
      await setDoc(
        doc(db, `tenants/${tenantId}/receivables`, selectedReceivable.id),
        cleanFirestoreData({
          status: "RECEIVED",
          receivedDate: receiveDate,
          paymentMethod: receivePaymentMethod,
          updatedAt: new Date().toISOString(),
        }),
        { merge: true }
      );

      const txId = `tx-pa-${Date.now()}`;
      await setDoc(doc(db, `tenants/${tenantId}/transactions`, txId), cleanFirestoreData({
        id: txId,
        clientName: selectedReceivable.clientName,
        vendorName: selectedReceivable.vendorName,
        paymentMethod: receivePaymentMethod,
        amount: selectedReceivable.amount,
        date: `Baixa P.A. (${formatDateBR(receiveDate)})`,
        status: "CONCILIADO",
        source: "RECEBIMENTO_PA",
        originReceivableId: selectedReceivable.id,
        createdAt: new Date().toISOString(),
      }));

      setReceivables((prev) =>
        prev.map((r) => (r.id === selectedReceivable.id ? updated : r))
      );
      setToast({
        type: "cloud_success",
        title: "Recebimento Confirmado na Nuvem!",
        message: `Recebimento de ${formatValue(updated.amount, "currency")} registrado e lançado no Caixa!`,
        isCloud: true,
      });
    } catch (err: any) {
      console.error("Erro ao registrar recebimento no Firestore:", err);
      setToast({
        type: "cloud_error",
        title: "Erro ao Registrar Recebimento",
        message: err?.message || "Não foi possível salvar na nuvem.",
        isCloud: true,
      });
    }

    setIsReceiveModalOpen(false);
    setSelectedReceivable(null);
  };

  // Abrir Modal de Estorno de Segurança (Restrito a admin@luke.com)
  const handleOpenReversalModal = (type: "PAYABLE" | "RECEIVABLE", item: any) => {
    setReversalTarget({ type, item });
    setReversalReason("");
    setReversalAdminEmail(auth.currentUser?.email || "");
    setIsReversalModalOpen(true);
  };

  // Executar Estorno no Firestore
  const handleConfirmReversal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reversalTarget || !reversalReason.trim()) return;

    if (reversalAdminEmail.trim().toLowerCase() !== "admin@luke.com") {
      alert("Apenas administradores gerais (admin@luke.com) possuem autorização para estornar baixas.");
      return;
    }

    const auditEntry = `Estorno efetuado por ${reversalAdminEmail.trim()} em ${formatDateTimeBR(new Date())}. Motivo: ${reversalReason.trim()}`;

    try {
      if (reversalTarget.type === "PAYABLE") {
        const p = reversalTarget.item as PayableItem;
        const updated: PayableItem = {
          ...p,
          status: p.dueDate < todayStr ? "OVERDUE" : "PENDING",
          auditTrail: [...(p.auditTrail || []), auditEntry],
        };
        delete updated.paymentDate;
        delete updated.paymentMethod;

        await setDoc(doc(db, `tenants/${tenantId}/payables`, p.id), cleanFirestoreData({
          ...updated,
          updatedAt: new Date().toISOString(),
        }), { merge: true });
        setPayables((prev) => prev.map((item) => (item.id === p.id ? updated : item)));
      } else {
        const r = reversalTarget.item as ReceivableItem;
        const updated: ReceivableItem = {
          ...r,
          status: r.scheduledDate < todayStr ? "OVERDUE" : "PENDING",
          paymentMethod: "PA",
          auditTrail: [...(r.auditTrail || []), auditEntry],
        };
        delete updated.receivedDate;

        await setDoc(doc(db, `tenants/${tenantId}/receivables`, r.id), cleanFirestoreData({
          ...updated,
          updatedAt: new Date().toISOString(),
        }), { merge: true });
        setReceivables((prev) => prev.map((item) => (item.id === r.id ? updated : item)));
      }

      setToast({
        type: "cloud_success",
        title: "Estorno Concluído na Nuvem!",
        message: "Baixa estornada com sucesso e registrada na trilha de auditoria!",
        isCloud: true,
      });
    } catch (err: any) {
      console.error("Erro ao estornar no Firestore:", err);
      setToast({
        type: "cloud_error",
        title: "Erro ao Processar Estorno",
        message: err?.message || "Não foi possível processar o estorno.",
        isCloud: true,
      });
    }

    setIsReversalModalOpen(false);
    setReversalTarget(null);
  };

  // Filtragem de Contas a Pagar com Seletor Temporal
  const filteredPayables = useMemo(() => {
    return payables.filter((p) => {
      // Filtro de Mês/Ano
      if (selectedMonth !== "ALL") {
        const compMonth = p.competence?.split("/")[0] || p.dueDate?.split("-")[1];
        if (compMonth !== selectedMonth) return false;
      }
      if (selectedYear !== "ALL") {
        const compYear = p.competence?.split("/")[1] || p.dueDate?.split("-")[0];
        if (compYear !== selectedYear) return false;
      }

      // Filtro de Busca
      const matchSearch =
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoryName.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de Status
      let matchStatus = true;
      if (statusFilter === "PENDING") {
        matchStatus = p.status === "PENDING" && p.dueDate >= todayStr;
      } else if (statusFilter === "OVERDUE") {
        matchStatus = p.status === "OVERDUE" || (p.status === "PENDING" && p.dueDate < todayStr);
      } else if (statusFilter === "PAID") {
        matchStatus = p.status === "PAID";
      }

      return matchSearch && matchStatus;
    });
  }, [payables, selectedMonth, selectedYear, searchTerm, statusFilter, todayStr]);

  // Filtragem de Contas a Receber com Seletor Temporal
  const filteredReceivables = useMemo(() => {
    return receivables.filter((r) => {
      // Filtro de Mês/Ano (pela data agendada ou recebimento)
      const targetDate = r.status === "RECEIVED" && r.receivedDate ? r.receivedDate : r.scheduledDate;
      if (selectedMonth !== "ALL") {
        const targetMonth = targetDate?.split("-")[1];
        if (targetMonth !== selectedMonth) return false;
      }
      if (selectedYear !== "ALL") {
        const targetYear = targetDate?.split("-")[0];
        if (targetYear !== selectedYear) return false;
      }

      // Busca
      const matchSearch =
        r.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.routeId.toLowerCase().includes(searchTerm.toLowerCase());

      // Status
      let matchStatus = true;
      if (statusFilter === "PENDING") {
        matchStatus = r.status === "PENDING" && r.scheduledDate >= todayStr;
      } else if (statusFilter === "OVERDUE") {
        matchStatus = r.status === "OVERDUE" || (r.status === "PENDING" && r.scheduledDate < todayStr);
      } else if (statusFilter === "RECEIVED") {
        matchStatus = r.status === "RECEIVED";
      } else if (statusFilter === "NEXT_MONTH") {
        matchStatus = r.status === "NEXT_MONTH";
      }

      return matchSearch && matchStatus;
    });
  }, [receivables, selectedMonth, selectedYear, searchTerm, statusFilter, todayStr]);

  // KPIs de Contas a Receber por Forma de Pagamento (Item 15)
  const receivableKPIs = useMemo(() => {
    const subset = filteredReceivables;
    let totalPA = 0;
    let totalCard = 0;
    let totalPixCash = 0;
    let totalPending = 0;
    let totalReceived = 0;
    let totalOverdue = 0;

    subset.forEach((r) => {
      if (r.status === "RECEIVED") {
        totalReceived += r.amount;
      } else {
        totalPending += r.amount;
        if (r.scheduledDate < todayStr || r.status === "OVERDUE") {
          totalOverdue += r.amount;
        }
      }

      const method = (r.paymentMethod || "PA").toUpperCase();
      if (method === "PA" || method.includes("PRAZO") || method.includes("BOLETO")) {
        totalPA += r.amount;
      } else if (method.includes("CARD") || method.includes("CARTAO") || method.includes("CREDITO") || method.includes("DEBITO")) {
        totalCard += r.amount;
      } else if (method.includes("PIX") || method.includes("CASH") || method.includes("DINHEIRO")) {
        totalPixCash += r.amount;
      }
    });

    return { totalPA, totalCard, totalPixCash, totalPending, totalReceived, totalOverdue };
  }, [filteredReceivables, todayStr]);

  // Totais Gerais
  const totalPayablePending = filteredPayables
    .filter((p) => p.status !== "PAID")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPayablePaid = filteredPayables
    .filter((p) => p.status === "PAID")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netOperationalBalance = receivableKPIs.totalReceived - totalPayablePaid;

  return (
    <div className="space-y-8">
      {/* Toast Feedback Notification Flutuante (Nuvem Firestore) */}
      <ToastFeedback toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-extrabold text-brand-offwhite">Financeiro</h2>
            <span className="bg-brand-gold/20 text-brand-gold text-xs px-2.5 py-1 rounded-full font-bold border border-brand-gold/30">
              Controle Total
            </span>
          </div>
          <p className="text-brand-offwhite/60 text-sm mt-1">
            Contas a Pagar, Contas a Receber (P.A. e Cartões), Fluxo de Caixa e Auditoria de Baixas.
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

          {activeTab === "PAGAR" && (
            <button
              onClick={() => handleOpenPayableModal()}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-brand-gold text-brand-black px-4 py-2.5 rounded-xl font-extrabold hover:bg-yellow-500 transition shadow-lg text-xs shrink-0 cursor-pointer"
            >
              <Plus size={16} />
              <span>Nova Despesa</span>
            </button>
          )}

          {activeTab === "RECEBER" && (
            <button
              onClick={() => handleOpenReceivableModal()}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-brand-gold text-brand-black px-4 py-2.5 rounded-xl font-extrabold hover:bg-yellow-500 transition shadow-lg text-xs shrink-0 cursor-pointer"
            >
              <Plus size={16} />
              <span>Novo Título / Receber</span>
            </button>
          )}

          {activeTab === "CATEGORIAS" && (
            <button
              onClick={() => handleOpenCategoryModal()}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-brand-gold text-brand-black px-4 py-2.5 rounded-xl font-extrabold hover:bg-yellow-500 transition shadow-lg text-xs shrink-0 cursor-pointer"
            >
              <Plus size={16} />
              <span>Nova Categoria</span>
            </button>
          )}
        </div>
      </div>

      {/* BARRA DE FILTRO TEMPORAL (MÊS / ANO / PERÍODO) */}
      <div className="bg-brand-graphite p-4 rounded-2xl border border-brand-blue/30 shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal size={16} className="text-brand-gold shrink-0" />
          <span className="text-xs font-bold text-brand-offwhite uppercase tracking-wider">
            Período Financeiro:
          </span>
        </div>

        {/* Presets Rápidos */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
          {[
            { id: "CURRENT", label: "Mês Atual" },
            { id: "PREVIOUS", label: "Mês Anterior" },
            { id: "NEXT", label: "Próximo Mês" },
            { id: "YEAR", label: "Ano Inteiro" },
            { id: "ALL", label: "Todo Histórico" },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePeriodPresetChange(preset.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition border ${
                periodPreset === preset.id
                  ? "bg-brand-gold text-brand-black border-brand-gold shadow"
                  : "bg-brand-black/60 text-brand-offwhite/70 border-brand-blue/30 hover:text-brand-offwhite"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Seletores de Mês e Ano */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setPeriodPreset("CURRENT");
            }}
            className="bg-brand-black border border-brand-blue/50 text-brand-offwhite text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-gold"
          >
            {MONTHS_LIST.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setPeriodPreset("CURRENT");
            }}
            className="bg-brand-black border border-brand-blue/50 text-brand-offwhite text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-gold"
          >
            <option value="ALL">Todos os Anos</option>
            {YEARS_LIST.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resumo Financeiro Geral */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">A Receber Aberto</span>
            <ArrowDownLeft size={18} className="text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-400 mt-2">
            {formatValue(receivableKPIs.totalPending, "currency")}
          </p>
          <span className="text-[11px] text-brand-offwhite/50">Vendas a prazo no período</span>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Pagar Pendente</span>
            <ArrowUpRight size={18} className="text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">
            {formatValue(totalPayablePending, "currency")}
          </p>
          <span className="text-[11px] text-brand-offwhite/50">Fornecedores, salários e fixos</span>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Entradas Liquidadas</span>
            <DollarSign size={18} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">
            {formatValue(receivableKPIs.totalReceived, "currency")}
          </p>
          <span className="text-[11px] text-emerald-400/80 font-medium">Entrado no Caixa no período</span>
        </div>

        <div className="bg-brand-graphite p-5 rounded-2xl border border-brand-blue/30 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-brand-offwhite/60 font-semibold uppercase">Saldo Operacional</span>
            <Wallet size={18} className="text-brand-gold" />
          </div>
          <p className={`text-2xl font-black mt-2 ${netOperationalBalance >= 0 ? "text-brand-gold" : "text-rose-400"}`}>
            {formatValue(netOperationalBalance, "currency")}
          </p>
          <span className="text-[11px] text-brand-offwhite/50">Recebido (-) Despesas Pagas</span>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <div className="flex border-b border-brand-blue/30 space-x-2 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => setActiveTab("PAGAR")}
          className={`pb-3 px-4 font-bold text-sm flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "PAGAR"
              ? "border-brand-gold text-brand-gold"
              : "border-transparent text-brand-offwhite/60 hover:text-brand-offwhite"
          }`}
        >
          <ArrowUpRight size={16} />
          <span>Contas a Pagar ({filteredPayables.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("RECEBER")}
          className={`pb-3 px-4 font-bold text-sm flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "RECEBER"
              ? "border-brand-gold text-brand-gold"
              : "border-transparent text-brand-offwhite/60 hover:text-brand-offwhite"
          }`}
        >
          <ArrowDownLeft size={16} />
          <span>Contas a Receber ({filteredReceivables.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("CAIXA")}
          className={`pb-3 px-4 font-bold text-sm flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "CAIXA"
              ? "border-brand-gold text-brand-gold"
              : "border-transparent text-brand-offwhite/60 hover:text-brand-offwhite"
          }`}
        >
          <Wallet size={16} />
          <span>Fluxo de Caixa</span>
        </button>

        <button
          onClick={() => setActiveTab("CATEGORIAS")}
          className={`pb-3 px-4 font-bold text-sm flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
            activeTab === "CATEGORIAS"
              ? "border-brand-gold text-brand-gold"
              : "border-transparent text-brand-offwhite/60 hover:text-brand-offwhite"
          }`}
        >
          <Tag size={16} />
          <span>Categorias ({categories.length})</span>
        </button>
      </div>

      {/* ABA 1: CONTAS A PAGAR */}
      {activeTab === "PAGAR" && (
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
                placeholder="Buscar despesa, fornecedor ou categoria..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-brand-black border border-brand-blue/50 text-brand-offwhite text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-gold"
              >
                <option value="ALL">Todos os Status</option>
                <option value="PENDING">Apenas Pendentes</option>
                <option value="OVERDUE">Apenas Atrasadas / Vencidas</option>
                <option value="PAID">Apenas Pagas</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-blue/10 border-b border-brand-blue/30 text-brand-offwhite/70 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Descrição</th>
                  <th className="p-4 font-medium">Categoria</th>
                  <th className="p-4 font-medium">Fornecedor</th>
                  <th className="p-4 font-medium">Vencimento</th>
                  <th className="p-4 font-medium">Valor</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-blue/10 text-sm">
                {filteredPayables.map((item) => {
                  const overdue = isItemOverdue(item);
                  return (
                    <tr key={item.id} className="hover:bg-brand-blue/5 transition group">
                      <td className="p-4 font-semibold text-brand-offwhite">
                        <p>{item.description}</p>
                        {item.notes && <p className="text-xs text-brand-offwhite/40 mt-0.5">{item.notes}</p>}
                        {item.recurrence && (
                          <span className="inline-block mt-1 text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono border border-blue-500/30">
                            Recorrente ({item.recurrenceMonths || 12} meses)
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="text-xs px-2.5 py-1 bg-brand-black/60 text-brand-offwhite/80 rounded-md border border-brand-blue/20">
                          {item.categoryName}
                        </span>
                      </td>

                      <td className="p-4 text-xs text-brand-offwhite/70">
                        {item.supplier}
                      </td>

                      <td className="p-4 text-xs font-mono text-brand-offwhite/80">
                        <div className="flex items-center space-x-1.5">
                          <Calendar size={13} className={overdue ? "text-rose-400" : "text-brand-gold/70"} />
                          <span className={overdue ? "text-rose-400 font-bold" : ""}>
                            {formatDateBR(item.dueDate)}
                          </span>
                        </div>
                        {item.paymentDate && (
                          <span className="text-[10px] text-green-400 block mt-0.5">
                            Pago em: {formatDateBR(item.paymentDate)} ({item.paymentMethod || "PIX"})
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-mono font-bold text-amber-400">
                        {formatValue(item.amount, "currency")}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            item.status === "PAID"
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : overdue || item.status === "OVERDUE"
                              ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse font-bold"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {item.status === "PAID"
                            ? "Pago"
                            : overdue || item.status === "OVERDUE"
                            ? "Atrasada / Vencida"
                            : "Pendente"}
                        </span>
                      </td>

                      <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                        {item.status !== "PAID" ? (
                          <button
                            onClick={() => handlePayPayable(item)}
                            className="px-2.5 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-bold hover:bg-green-500/30 transition inline-flex items-center space-x-1 cursor-pointer"
                            title="Dar baixa / Liquidar"
                          >
                            <Check size={13} />
                            <span>Baixar</span>
                          </button>
                        ) : (
                          <div className="inline-flex items-center space-x-1">
                            <span className="text-xs text-brand-offwhite/40 inline-flex items-center space-x-1">
                              <CheckCircle2 size={13} className="text-green-400" />
                              <span>Liquidado</span>
                            </span>
                            <button
                              onClick={() => handleOpenReversalModal("PAYABLE", item)}
                              title="Estornar Baixa (admin@luke.com)"
                              className="p-1.5 text-brand-offwhite/40 hover:text-amber-400 rounded transition hover:bg-brand-blue/20 cursor-pointer"
                            >
                              <RotateCcw size={13} />
                            </button>
                          </div>
                        )}

                        <button
                          onClick={() => handleOpenPayableModal(item)}
                          title="Editar Despesa"
                          className="p-1.5 text-brand-offwhite/60 hover:text-brand-gold rounded-lg hover:bg-brand-blue/20 transition cursor-pointer inline-flex items-center"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          onClick={() => handleDeletePayable(item)}
                          title="Excluir Despesa"
                          className="p-1.5 text-brand-offwhite/60 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition cursor-pointer inline-flex items-center"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 2: CONTAS A RECEBER COM CARDS/KPIS DETALHADOS (ITEM 15) */}
      {activeTab === "RECEBER" && (
        <div className="space-y-6">
          {/* CARDS / KPIS DE FORMAS DE PAGAMENTO A RECEBER */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Card P.A. */}
            <div className="bg-brand-graphite p-4 rounded-xl border-2 border-purple-500/40 bg-purple-950/10 shadow-md">
              <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block">
                Total P.A. (Rota)
              </span>
              <p className="text-xl font-black text-purple-300 mt-1 font-mono">
                {formatValue(receivableKPIs.totalPA, "currency")}
              </p>
              <span className="text-[10px] text-purple-400/80">Prazo Aberto / Boletos</span>
            </div>

            {/* Card Cartão */}
            <div className="bg-brand-graphite p-4 rounded-xl border border-brand-blue/30 shadow-md">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
                Total Cartão
              </span>
              <p className="text-xl font-black text-blue-400 mt-1 font-mono">
                {formatValue(receivableKPIs.totalCard, "currency")}
              </p>
              <span className="text-[10px] text-brand-offwhite/50">Crédito & Débito</span>
            </div>

            {/* Card PIX / Dinheiro */}
            <div className="bg-brand-graphite p-4 rounded-xl border border-brand-blue/30 shadow-md">
              <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider block">
                PIX & Dinheiro
              </span>
              <p className="text-xl font-black text-teal-400 mt-1 font-mono">
                {formatValue(receivableKPIs.totalPixCash, "currency")}
              </p>
              <span className="text-[10px] text-brand-offwhite/50">Pronta Liquidação</span>
            </div>

            {/* Card Total Aberto */}
            <div className="bg-brand-graphite p-4 rounded-xl border border-brand-blue/30 shadow-md">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                Total a Receber
              </span>
              <p className="text-xl font-black text-amber-400 mt-1 font-mono">
                {formatValue(receivableKPIs.totalPending, "currency")}
              </p>
              <span className="text-[10px] text-brand-offwhite/50">Pendente no filtro</span>
            </div>

            {/* Card Já Recebido */}
            <div className="bg-brand-graphite p-4 rounded-xl border border-brand-blue/30 shadow-md">
              <span className="text-[11px] font-bold text-green-400 uppercase tracking-wider block">
                Já Recebido
              </span>
              <p className="text-xl font-black text-green-400 mt-1 font-mono">
                {formatValue(receivableKPIs.totalReceived, "currency")}
              </p>
              <span className="text-[10px] text-green-400/80">Liquidado no Caixa</span>
            </div>

            {/* Card Atrasados */}
            <div className="bg-brand-graphite p-4 rounded-xl border border-rose-500/30 bg-rose-950/10 shadow-md">
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
                Atrasados / Vencidos
              </span>
              <p className="text-xl font-black text-rose-400 mt-1 font-mono">
                {formatValue(receivableKPIs.totalOverdue, "currency")}
              </p>
              <span className="text-[10px] text-rose-400/80">Ação de cobrança</span>
            </div>
          </div>

          {/* Tabela de Contas a Receber */}
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
                  placeholder="Buscar cliente, comprador ou vendedor..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-brand-black border border-brand-blue/50 text-brand-offwhite text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                >
                  <option value="ALL">Todos os Recebíveis</option>
                  <option value="PENDING">Pendentes</option>
                  <option value="OVERDUE">Atrasados / Vencidos</option>
                  <option value="RECEIVED">Já Recebidos (Baixados)</option>
                  <option value="NEXT_MONTH">Próximo Mês</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand-blue/10 border-b border-brand-blue/30 text-brand-offwhite/70 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium">Cliente / Comprador</th>
                    <th className="p-4 font-medium">Rota</th>
                    <th className="p-4 font-medium">Vendedor</th>
                    <th className="p-4 font-medium">Forma & Vencimento</th>
                    <th className="p-4 font-medium">Valor</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-blue/10 text-sm">
                  {filteredReceivables.map((item) => {
                    const overdue = isItemOverdue(item);
                    return (
                      <tr key={item.id} className="hover:bg-brand-blue/5 transition group">
                        <td className="p-4 font-semibold text-brand-offwhite">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-lg bg-brand-blue/30 flex items-center justify-center text-brand-gold shrink-0 font-bold text-xs">
                              <Store size={15} />
                            </div>
                            <div>
                              <p>{item.clientName}</p>
                              <p className="text-xs text-brand-offwhite/40">Comprador: {item.buyerName}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-brand-gold/15 text-brand-gold font-bold text-xs rounded border border-brand-gold/30">
                            {item.routeId}
                          </span>
                        </td>

                        <td className="p-4 text-xs text-brand-offwhite/80">
                          {item.vendorName}
                        </td>

                        <td className="p-4 text-xs font-mono text-brand-offwhite/80">
                          <div className="flex items-center space-x-1.5">
                            <Clock size={13} className={overdue ? "text-rose-400" : "text-purple-400"} />
                            <span className={overdue ? "text-rose-400 font-bold" : ""}>
                              {formatDateBR(item.scheduledDate)}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-brand-black/60 rounded text-brand-offwhite/60 border border-brand-blue/20 font-sans">
                              {item.paymentMethod || "P.A."}
                            </span>
                          </div>
                          {item.receivedDate && (
                            <span className="text-[10px] text-green-400 block mt-0.5">
                              Recebido em {formatDateBR(item.receivedDate)} ({item.paymentMethod})
                            </span>
                          )}
                        </td>

                        <td className="p-4 font-mono font-bold text-purple-400">
                          {formatValue(item.amount, "currency")}
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              item.status === "RECEIVED"
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : overdue || item.status === "OVERDUE"
                                ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse font-bold"
                                : item.status === "NEXT_MONTH"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {item.status === "RECEIVED"
                              ? "Recebido"
                              : overdue || item.status === "OVERDUE"
                              ? "Atrasado"
                              : item.status === "NEXT_MONTH"
                              ? "Próximo Mês"
                              : "Pendente"}
                          </span>
                        </td>

                        <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                          {item.status !== "RECEIVED" ? (
                            <button
                              onClick={() => handleOpenReceiveModal(item)}
                              className="px-2.5 py-1.5 bg-brand-gold text-brand-black rounded-lg text-xs font-extrabold hover:bg-yellow-500 transition shadow-md inline-flex items-center space-x-1 cursor-pointer"
                              title="Baixar P.A. no Caixa"
                            >
                              <DollarSign size={13} />
                              <span>Baixar P.A.</span>
                            </button>
                          ) : (
                            <div className="inline-flex items-center space-x-1">
                              <span className="text-xs text-brand-offwhite/40 inline-flex items-center space-x-1">
                                <CheckCircle2 size={13} className="text-green-400" />
                                <span>Caixa</span>
                              </span>
                              <button
                                onClick={() => handleOpenReversalModal("RECEIVABLE", item)}
                                title="Estornar Baixa (admin@luke.com)"
                                className="p-1.5 text-brand-offwhite/40 hover:text-amber-400 rounded transition hover:bg-brand-blue/20 cursor-pointer"
                              >
                                <RotateCcw size={13} />
                              </button>
                            </div>
                          )}

                          <button
                            onClick={() => handleOpenReceivableModal(item)}
                            title="Editar Título"
                            className="p-1.5 text-brand-offwhite/60 hover:text-brand-gold rounded-lg hover:bg-brand-blue/20 transition cursor-pointer inline-flex items-center"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            onClick={() => handleDeleteReceivable(item)}
                            title="Excluir Título"
                            className="p-1.5 text-brand-offwhite/60 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition cursor-pointer inline-flex items-center"
                          >
                            <Trash2 size={14} />
                          </button>
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

      {/* ABA 3: FLUXO DE CAIXA OPERACIONAL */}
      {activeTab === "CAIXA" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-brand-graphite p-6 rounded-2xl border border-brand-blue/30 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-brand-offwhite flex items-center space-x-2">
                <Wallet className="text-brand-gold" size={20} />
                <span>Fluxo de Caixa Operacional ({selectedMonth !== "ALL" ? `${selectedMonth}/${selectedYear}` : selectedYear})</span>
              </h3>
              <span className="text-xs text-brand-offwhite/50 font-mono">Consolidado em Tempo Real</span>
            </div>

            <div className="space-y-3 font-mono text-sm divide-y divide-brand-blue/20">
              <div className="flex justify-between items-center py-2 text-green-400 font-bold">
                <span>(+) Entradas Liquidadas no Período</span>
                <span>{formatValue(receivableKPIs.totalReceived, "currency")}</span>
              </div>

              <div className="flex justify-between items-center py-2 text-brand-offwhite/70 pl-4">
                <span>• Recebimentos de P.A. & Boletos</span>
                <span>{formatValue(receivableKPIs.totalReceived, "currency")}</span>
              </div>

              <div className="flex justify-between items-center py-2 text-amber-400 font-bold">
                <span>(-) Despesas Pagas no Período</span>
                <span>- {formatValue(totalPayablePaid, "currency")}</span>
              </div>

              <div className="flex justify-between items-center py-2 text-brand-offwhite/70 pl-4">
                <span>• Fornecedores, Frotas & Operação</span>
                <span>- {formatValue(totalPayablePaid, "currency")}</span>
              </div>

              <div className="flex justify-between items-center py-3 text-brand-gold font-extrabold text-base bg-brand-black/40 px-3 rounded-lg">
                <span>(=) SALDO LÍQUIDO NO CAIXA</span>
                <span>{formatValue(netOperationalBalance, "currency")}</span>
              </div>
            </div>
          </div>

          <div className="bg-brand-graphite p-6 rounded-2xl border border-brand-blue/30 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-brand-offwhite">Ciclo Operacional</h3>
            <p className="text-xs text-brand-offwhite/60">
              Fechamento comercial da distribuidora no ciclo semanal de:
            </p>
            <div className="p-4 bg-brand-black/60 rounded-xl border border-brand-gold/30">
              <p className="text-xs font-bold text-brand-gold uppercase">Terça-feira ➔ Segunda-feira</p>
              <p className="text-xs text-brand-offwhite/70 mt-1">
                Todas as cargas e P.A.s são liquidados semanalmente na conferência de retorno dos veículos.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs text-brand-offwhite/80">
                <span>Alisson (Vendedor Rota R):</span>
                <span className="font-bold text-brand-gold">{formatValue(14820.0, "currency")}</span>
              </div>
              <div className="flex justify-between text-xs text-brand-offwhite/80">
                <span>Alexandre (Vendedor Rota F):</span>
                <span className="font-bold text-brand-gold">{formatValue(11450.0, "currency")}</span>
              </div>
              <div className="flex justify-between text-xs text-brand-offwhite/80">
                <span>Lucas (Admin / Vendas):</span>
                <span className="font-bold text-brand-gold">{formatValue(8920.0, "currency")}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: CATEGORIAS */}
      {activeTab === "CATEGORIAS" && (
        <div className="bg-brand-graphite rounded-2xl border border-brand-blue/30 shadow-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-lg font-bold text-brand-offwhite">Categorias Financeiras</h3>
              <p className="text-xs text-brand-offwhite/60">
                Plano de contas padronizado para despesas operacionais e receitas da distribuidora.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-brand-gold/20 text-brand-gold text-xs font-bold rounded-lg border border-brand-gold/30">
                {categories.length} categorias
              </span>
              <button
                onClick={() => handleOpenCategoryModal()}
                className="flex items-center space-x-1.5 bg-brand-gold text-brand-black px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-500 transition shadow cursor-pointer"
              >
                <Plus size={14} />
                <span>Nova Categoria</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((c) => (
              <div
                key={c.id}
                className="p-3 bg-brand-black/50 border border-brand-blue/30 hover:border-brand-gold/40 rounded-xl flex items-center justify-between transition group"
              >
                <div className="truncate mr-2">
                  <p className="text-sm font-semibold text-brand-offwhite truncate">{c.name}</p>
                  <span className="text-[10px] text-brand-offwhite/40 font-mono">{c.id}</span>
                </div>
                <div className="flex items-center space-x-1.5 shrink-0">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      c.type === "INCOME"
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {c.type === "INCOME" ? "Receita" : "Despesa"}
                  </span>
                  <button
                    onClick={() => handleOpenCategoryModal(c)}
                    title="Editar Categoria"
                    className="p-1 text-brand-offwhite/40 hover:text-brand-gold rounded transition hover:bg-brand-blue/20 cursor-pointer"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(c)}
                    title="Excluir Categoria"
                    className="p-1 text-brand-offwhite/40 hover:text-red-400 rounded transition hover:bg-red-500/10 cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Nova Despesa (Com Busca Digital, Recorrência e Opção Já Paga) */}
      {isPayableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-sm">
          <div className="bg-brand-graphite w-full max-w-lg rounded-2xl border border-brand-blue/40 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsPayableModalOpen(false)}
              className="absolute top-4 right-4 text-brand-offwhite/50 hover:text-brand-offwhite p-1 rounded-lg hover:bg-brand-blue/20 transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <ArrowUpRight size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-offwhite">
                  {editingPayable ? "Editar Despesa" : "Lançar Despesa"}
                </h3>
                <p className="text-xs text-brand-offwhite/60">
                  {editingPayable
                    ? "Altere os dados da despesa, vencimento, fornecedor ou categoria."
                    : "Cadastre contas a pagar com lista rápida de categoria, recorrência e opção de baixa imediata."}
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePayable} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                  Descrição da Despesa
                </label>
                <input
                  type="text"
                  required
                  value={payableForm.description}
                  onChange={(e) => setPayableForm({ ...payableForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  placeholder="Ex: Compra 200un Pomada Efeito Teia ou Abastecimento"
                />
              </div>

              {/* SELETOR DE CATEGORIA CLICÁVEL COM LISTA (SAFARI & CHROME FRIENDLY) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-brand-offwhite/70 flex items-center space-x-1.5">
                  <Tag size={13} className="text-brand-gold" />
                  <span>Categoria da Despesa</span>
                </label>

                <div className="relative">
                  {/* Botão de Clique para Abrir Lista */}
                  <button
                    type="button"
                    onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
                    className="w-full px-3 py-2.5 bg-brand-black border border-brand-blue/40 hover:border-brand-gold rounded-xl text-left flex items-center justify-between transition group cursor-pointer focus:outline-none focus:border-brand-gold"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="text-sm text-brand-offwhite font-medium truncate">
                        {categories.find((c) => c.id === payableForm.categoryId)?.name || "Selecione uma Categoria..."}
                      </span>
                      {categories.find((c) => c.id === payableForm.categoryId) && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 ${
                            categories.find((c) => c.id === payableForm.categoryId)?.type === "INCOME"
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {categories.find((c) => c.id === payableForm.categoryId)?.type === "INCOME" ? "Receita" : "Despesa"}
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-brand-offwhite/50 group-hover:text-brand-gold transition-transform duration-200 shrink-0 ${
                        isCategoryDropdownOpen ? "rotate-180 text-brand-gold" : ""
                      }`}
                    />
                  </button>

                  {/* Backdrop invisível para fechar ao clicar fora */}
                  {isCategoryDropdownOpen && (
                    <div
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setIsCategoryDropdownOpen(false)}
                    />
                  )}

                  {/* Menu Dropdown de Opções */}
                  {isCategoryDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-brand-graphite border border-brand-gold/40 rounded-xl shadow-2xl p-2.5 space-y-2">
                      <div className="relative">
                        <Search size={13} className="absolute left-2.5 top-2.5 text-brand-offwhite/40" />
                        <input
                          type="text"
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          placeholder="Buscar categoria..."
                          className="w-full pl-8 pr-3 py-1.5 bg-brand-black/90 border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite focus:outline-none focus:border-brand-gold"
                          autoFocus
                        />
                      </div>

                      <div className="max-h-52 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        {filteredCategories.length === 0 ? (
                          <div className="p-3 text-center text-xs text-brand-offwhite/50">
                            Nenhuma categoria encontrada
                          </div>
                        ) : (
                          filteredCategories.map((c) => {
                            const isSelected = c.id === payableForm.categoryId;
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  setPayableForm({ ...payableForm, categoryId: c.id });
                                  setIsCategoryDropdownOpen(false);
                                  setCategorySearch("");
                                }}
                                className={`w-full px-3 py-2 rounded-lg text-left flex items-center justify-between transition cursor-pointer text-xs ${
                                  isSelected
                                    ? "bg-brand-gold text-brand-black font-bold"
                                    : "text-brand-offwhite hover:bg-brand-black hover:text-brand-gold"
                                }`}
                              >
                                <span className="truncate">{c.name}</span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ml-2 ${
                                    isSelected
                                      ? "bg-brand-black/20 text-brand-black"
                                      : c.type === "INCOME"
                                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  }`}
                                >
                                  {c.type === "INCOME" ? "Receita" : "Despesa"}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                  Fornecedor / Favorecido
                </label>
                <input
                  type="text"
                  value={payableForm.supplier}
                  onChange={(e) => setPayableForm({ ...payableForm, supplier: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  placeholder="Ex: Laboratório Hair Tech ou Posto Ipiranga"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Valor (R$)
                  </label>
                  <CurrencyInput
                    required
                    value={payableForm.amount ?? ""}
                    onChange={(val) => setPayableForm({ ...payableForm, amount: val })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-amber-400 font-bold focus:outline-none focus:border-brand-gold"
                    placeholder="R$ 0,00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Vencimento
                  </label>
                  <input
                    type="date"
                    required
                    value={payableForm.dueDate}
                    onChange={(e) => {
                      const newDue = e.target.value;
                      const parts = newDue ? newDue.split("-") : [];
                      const autoComp = parts.length === 3 ? `${parts[1]}/${parts[0]}` : payableForm.competence;
                      setPayableForm({
                        ...payableForm,
                        dueDate: newDue,
                        competence: autoComp,
                      });
                    }}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Competência
                  </label>
                  <input
                    type="text"
                    value={payableForm.competence}
                    onChange={(e) => setPayableForm({ ...payableForm, competence: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold font-mono"
                    placeholder="MM/AAAA"
                  />
                </div>
              </div>

              {/* OPÇÃO DE CONTA JÁ PAGA / BAIXADA NO ATO (ITEM 9) */}
              <div className="p-3 bg-brand-black/50 rounded-xl border border-brand-blue/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-green-400 flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={payableForm.isAlreadyPaid}
                      onChange={(e) => setPayableForm({ ...payableForm, isAlreadyPaid: e.target.checked })}
                      className="rounded bg-brand-black border-green-500/50 text-green-500 focus:ring-green-400"
                    />
                    <span>Esta despesa já foi paga / quitada no ato?</span>
                  </label>
                </div>

                {payableForm.isAlreadyPaid && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-brand-blue/20">
                    <div>
                      <label className="block text-[11px] text-brand-offwhite/60 mb-1">Data do Pagamento</label>
                      <input
                        type="date"
                        value={payableForm.paymentDate}
                        onChange={(e) => setPayableForm({ ...payableForm, paymentDate: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-brand-graphite border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite focus:outline-none focus:border-brand-gold font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-brand-offwhite/60 mb-1">Forma de Pagamento</label>
                      <select
                        value={payableForm.paymentMethod}
                        onChange={(e) => setPayableForm({ ...payableForm, paymentMethod: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-brand-graphite border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite focus:outline-none focus:border-brand-gold font-bold"
                      >
                        <option value="PIX">Pix Instantâneo</option>
                        <option value="DEBITO">Cartão de Débito</option>
                        <option value="CREDITO">Cartão de Crédito</option>
                        <option value="DINHEIRO">Dinheiro em Espécie</option>
                        <option value="BOLETO">Boleto Pago</option>
                        <option value="TRANSFERENCIA">Transferência / TED</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* RECORRÊNCIA COM SELETOR DE MESES (ITEM 7) */}
              <div className="p-3 bg-brand-black/50 rounded-xl border border-brand-blue/30 space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="recurrence-box"
                    checked={payableForm.recurrence}
                    onChange={(e) => setPayableForm({ ...payableForm, recurrence: e.target.checked })}
                    className="rounded bg-brand-black border-brand-blue/50 text-brand-gold focus:ring-brand-gold"
                  />
                  <label htmlFor="recurrence-box" className="text-xs text-brand-offwhite/80 cursor-pointer font-bold">
                    Conta fixa / recorrente mensal
                  </label>
                </div>

                {payableForm.recurrence && (
                  <div className="pt-2 border-t border-brand-blue/20 flex items-center justify-between gap-3">
                    <span className="text-xs text-brand-offwhite/70">
                      Por quantos meses deseja programar esta despesa?
                    </span>
                    <select
                      value={payableForm.recurrenceMonths}
                      onChange={(e) => setPayableForm({ ...payableForm, recurrenceMonths: Number(e.target.value) })}
                      className="bg-brand-graphite border border-brand-blue/40 text-brand-gold text-xs rounded-lg px-3 py-1.5 font-bold focus:outline-none focus:border-brand-gold"
                    >
                      <option value={2}>2 meses</option>
                      <option value={3}>3 meses (Trimestral)</option>
                      <option value={6}>6 meses (Semestral)</option>
                      <option value={12}>12 meses (1 Ano)</option>
                      <option value={24}>24 meses (2 Anos)</option>
                      <option value={36}>36 meses (3 Anos)</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                  Observações / Detalhes
                </label>
                <textarea
                  rows={2}
                  value={payableForm.notes}
                  onChange={(e) => setPayableForm({ ...payableForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  placeholder="Número de NF, dados bancários, instruções..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-brand-blue/30">
                <button
                  type="button"
                  onClick={() => setIsPayableModalOpen(false)}
                  className="px-4 py-2 text-sm text-brand-offwhite/70 hover:text-brand-offwhite transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingPayable}
                  className="px-6 py-2 bg-brand-gold text-brand-black rounded-lg font-bold hover:bg-yellow-500 transition shadow-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSavingPayable ? (
                    <>
                      <RefreshCw size={15} className="animate-spin text-brand-black" />
                      <span>Gravando na nuvem...</span>
                    </>
                  ) : (
                    <>
                      <Cloud size={15} className="text-brand-black" />
                      <span>{editingPayable ? "Salvar Alterações" : "Salvar Despesa"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Baixa de P.A. (Contas a Receber) */}
      {isReceiveModalOpen && selectedReceivable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-sm">
          <div className="bg-brand-graphite w-full max-w-md rounded-2xl border border-brand-gold/40 shadow-2xl p-6 relative">
            <button
              onClick={() => setIsReceiveModalOpen(false)}
              className="absolute top-4 right-4 text-brand-offwhite/50 hover:text-brand-offwhite p-1 rounded-lg hover:bg-brand-blue/20 transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center border border-green-500/30">
                <DollarSign size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-offwhite">Dar Baixa no P.A.</h3>
                <p className="text-xs text-brand-offwhite/60">
                  Registrar recebimento de venda a prazo e alimentar o Caixa do dia.
                </p>
              </div>
            </div>

            <div className="p-4 bg-brand-black/60 rounded-xl border border-brand-blue/30 mb-4 space-y-1">
              <p className="text-xs text-brand-offwhite/60">Cliente / Barbearia:</p>
              <p className="text-base font-bold text-brand-offwhite">{selectedReceivable.clientName}</p>
              <p className="text-xs text-brand-offwhite/50">
                Vendedor: {selectedReceivable.vendorName} • Rota: {selectedReceivable.routeId}
              </p>
              <p className="text-lg font-mono font-black text-green-400 pt-1">
                {formatValue(selectedReceivable.amount, "currency")}
              </p>
            </div>

            <form onSubmit={handleConfirmReceive} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                  Data do Recebimento
                </label>
                <input
                  type="date"
                  required
                  value={receiveDate}
                  onChange={(e) => setReceiveDate(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite font-mono focus:outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setReceivePaymentMethod("PIX")}
                    className={`py-2 px-2 rounded-lg text-xs font-bold border transition text-center ${
                      receivePaymentMethod === "PIX"
                        ? "bg-teal-500/20 text-teal-300 border-teal-400"
                        : "bg-brand-black text-brand-offwhite/60 border-brand-blue/30"
                    }`}
                  >
                    Pix
                  </button>

                  <button
                    type="button"
                    onClick={() => setReceivePaymentMethod("CASH")}
                    className={`py-2 px-2 rounded-lg text-xs font-bold border transition text-center ${
                      receivePaymentMethod === "CASH"
                        ? "bg-brand-gold/20 text-brand-gold border-brand-gold"
                        : "bg-brand-black text-brand-offwhite/60 border-brand-blue/30"
                    }`}
                  >
                    Dinheiro
                  </button>

                  <button
                    type="button"
                    onClick={() => setReceivePaymentMethod("CARD")}
                    className={`py-2 px-2 rounded-lg text-xs font-bold border transition text-center ${
                      receivePaymentMethod === "CARD"
                        ? "bg-blue-500/20 text-blue-300 border-blue-400"
                        : "bg-brand-black text-brand-offwhite/60 border-brand-blue/30"
                    }`}
                  >
                    Cartão
                  </button>

                  <button
                    type="button"
                    onClick={() => setReceivePaymentMethod("BOLETO")}
                    className={`py-2 px-2 rounded-lg text-xs font-bold border transition text-center ${
                      receivePaymentMethod === "BOLETO"
                        ? "bg-purple-500/20 text-purple-300 border-purple-400"
                        : "bg-brand-black text-brand-offwhite/60 border-brand-blue/30"
                    }`}
                  >
                    Boleto
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-brand-blue/30">
                <button
                  type="button"
                  onClick={() => setIsReceiveModalOpen(false)}
                  className="px-4 py-2 text-sm text-brand-offwhite/70 hover:text-brand-offwhite transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-500 text-black font-extrabold rounded-lg hover:bg-green-400 transition shadow-lg text-sm"
                >
                  Confirmar Baixa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE ESTORNO DE SEGURANÇA (RESTRITO A admin@luke.com) - ITEM 10 */}
      {isReversalModalOpen && reversalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-sm">
          <div className="bg-brand-graphite w-full max-w-md rounded-2xl border border-rose-500/40 shadow-2xl p-6 relative">
            <button
              onClick={() => setIsReversalModalOpen(false)}
              className="absolute top-4 right-4 text-brand-offwhite/50 hover:text-brand-offwhite p-1 rounded-lg hover:bg-brand-blue/20 transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-brand-offwhite">Estorno de Baixa</h3>
                <p className="text-xs text-rose-400 font-semibold">
                  Ação Restrita & Auditada (admin@luke.com)
                </p>
              </div>
            </div>

            <div className="p-3 bg-brand-black/60 rounded-xl border border-brand-blue/30 mb-4 space-y-1 text-xs">
              <p className="text-brand-offwhite/60">Item selecionado para estorno:</p>
              <p className="font-bold text-brand-offwhite">
                {reversalTarget.type === "PAYABLE"
                  ? reversalTarget.item.description
                  : `${reversalTarget.item.clientName} (Vendedor: ${reversalTarget.item.vendorName})`}
              </p>
              <p className="font-mono text-amber-400 font-bold">
                Valor: {formatValue(reversalTarget.item.amount, "currency")}
              </p>
            </div>

            {reversalError && (
              <div className="p-3 mb-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300 flex items-center space-x-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{reversalError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmReversal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                  E-mail do Administrador Autorizado
                </label>
                <input
                  type="email"
                  required
                  value={reversalAdminEmail}
                  onChange={(e) => setReversalAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite font-mono focus:outline-none focus:border-rose-500"
                  placeholder="admin@luke.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                  Motivo / Observação Obrigatória do Estorno
                </label>
                <textarea
                  rows={3}
                  required
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite focus:outline-none focus:border-rose-500"
                  placeholder="Ex: Baixa realizada indevidamente no cliente errado por engano..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-brand-blue/30">
                <button
                  type="button"
                  onClick={() => setIsReversalModalOpen(false)}
                  className="px-4 py-2 text-xs text-brand-offwhite/70 hover:text-brand-offwhite transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-500 text-white font-bold rounded-lg hover:bg-rose-600 transition shadow-lg text-xs flex items-center space-x-1.5"
                >
                  <RotateCcw size={14} />
                  <span>Confirmar Estorno</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lançar / Editar Título a Receber */}
      {isReceivableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-sm">
          <div className="bg-brand-graphite w-full max-w-lg rounded-2xl border border-brand-blue/40 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsReceivableModalOpen(false)}
              className="absolute top-4 right-4 text-brand-offwhite/50 hover:text-brand-offwhite p-1 rounded-lg hover:bg-brand-blue/20 transition cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                <DollarSign size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-offwhite">
                  {editingReceivable ? "Editar Título a Receber" : "Lançar Título a Receber"}
                </h3>
                <p className="text-xs text-brand-offwhite/60">
                  {editingReceivable
                    ? "Altere os dados do título, cliente, vencimento ou valor a receber."
                    : "Cadastre contas e duplicatas a receber geradas por vendas a prazo ou P.A."}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveReceivable} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                  Cliente / Razão Social *
                </label>
                <input
                  type="text"
                  required
                  value={receivableForm.clientName}
                  onChange={(e) => setReceivableForm({ ...receivableForm, clientName: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  placeholder="Ex: Barbearia Dom Lucas"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Comprador / Contato
                  </label>
                  <input
                    type="text"
                    value={receivableForm.buyerName}
                    onChange={(e) => setReceivableForm({ ...receivableForm, buyerName: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                    placeholder="Ex: Carlos (Proprietário)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Rota
                  </label>
                  <input
                    type="text"
                    value={receivableForm.routeId}
                    onChange={(e) => setReceivableForm({ ...receivableForm, routeId: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-gold font-bold focus:outline-none focus:border-brand-gold"
                    placeholder="Ex: R1, R2, F1..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Vendedor Responsável
                  </label>
                  <input
                    type="text"
                    value={receivableForm.vendorName}
                    onChange={(e) => setReceivableForm({ ...receivableForm, vendorName: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                    placeholder="Ex: Alisson (Vendedor)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Valor a Receber (R$) *
                  </label>
                  <CurrencyInput
                    required
                    value={receivableForm.amount ?? ""}
                    onChange={(val) => setReceivableForm({ ...receivableForm, amount: val })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-purple-400 font-bold focus:outline-none focus:border-brand-gold"
                    placeholder="R$ 0,00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Data da Venda
                  </label>
                  <input
                    type="date"
                    required
                    value={receivableForm.saleDate}
                    onChange={(e) => setReceivableForm({ ...receivableForm, saleDate: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Data Prevista / Vencimento
                  </label>
                  <input
                    type="date"
                    required
                    value={receivableForm.scheduledDate}
                    onChange={(e) => setReceivableForm({ ...receivableForm, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    value={receivableForm.paymentMethod}
                    onChange={(e) => setReceivableForm({ ...receivableForm, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  >
                    <option value="PA">P.A. (Prazo)</option>
                    <option value="PIX">PIX</option>
                    <option value="BOLETO">Boleto Bancário</option>
                    <option value="CARD">Cartão</option>
                    <option value="CASH">Dinheiro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Status do Título
                  </label>
                  <select
                    value={receivableForm.status}
                    onChange={(e) => setReceivableForm({ ...receivableForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  >
                    <option value="PENDING">Pendente</option>
                    <option value="RECEIVED">Recebido / Liquidado</option>
                    <option value="NEXT_MONTH">Próximo Mês</option>
                    <option value="OVERDUE">Atrasado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                  Observações / Detalhes
                </label>
                <textarea
                  rows={2}
                  value={receivableForm.notes}
                  onChange={(e) => setReceivableForm({ ...receivableForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  placeholder="Número de pedido, detalhes de entrega, etc..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-brand-blue/30">
                <button
                  type="button"
                  onClick={() => setIsReceivableModalOpen(false)}
                  className="px-4 py-2 text-sm text-brand-offwhite/70 hover:text-brand-offwhite transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingReceivable}
                  className="px-6 py-2 bg-brand-gold text-brand-black rounded-lg font-bold hover:bg-yellow-500 transition shadow-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 cursor-pointer"
                >
                  {isSavingReceivable ? (
                    <>
                      <RefreshCw size={15} className="animate-spin text-brand-black" />
                      <span>Gravando...</span>
                    </>
                  ) : (
                    <>
                      <Cloud size={15} className="text-brand-black" />
                      <span>{editingReceivable ? "Salvar Alterações" : "Salvar Título"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Criar / Editar Categoria Financeira */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-sm">
          <div className="bg-brand-graphite w-full max-w-md rounded-2xl border border-brand-gold/40 shadow-2xl p-6 relative">
            <button
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute top-4 right-4 text-brand-offwhite/50 hover:text-brand-offwhite p-1 rounded-lg hover:bg-brand-blue/20 transition cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center space-x-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-brand-gold/20 text-brand-gold flex items-center justify-center border border-brand-gold/30">
                <Tag size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-offwhite">
                  {editingCategory ? "Editar Categoria" : "Nova Categoria"}
                </h3>
                <p className="text-xs text-brand-offwhite/60">
                  {editingCategory ? "Altere o nome ou tipo da categoria." : "Cadastre uma nova categoria para o plano de contas."}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  placeholder="Ex: Combustível & Frotas"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                  Tipo da Categoria
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCategoryForm({ ...categoryForm, type: "EXPENSE" })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition text-center cursor-pointer ${
                      categoryForm.type === "EXPENSE"
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                        : "bg-brand-black text-brand-offwhite/60 border-brand-blue/30"
                    }`}
                  >
                    Despesa (Saída)
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategoryForm({ ...categoryForm, type: "INCOME" })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition text-center cursor-pointer ${
                      categoryForm.type === "INCOME"
                        ? "bg-green-500/20 text-green-400 border-green-500/40"
                        : "bg-brand-black text-brand-offwhite/60 border-brand-blue/30"
                    }`}
                  >
                    Receita (Entrada)
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-brand-blue/30">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 text-sm text-brand-offwhite/70 hover:text-brand-offwhite transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingCategory}
                  className="px-5 py-2 bg-brand-gold text-brand-black font-bold rounded-lg hover:bg-yellow-500 transition shadow-lg text-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSavingCategory ? (
                    <>
                      <RefreshCw size={14} className="animate-spin text-brand-black" />
                      <span>Gravando...</span>
                    </>
                  ) : (
                    <>
                      <Cloud size={14} className="text-brand-black" />
                      <span>{editingCategory ? "Salvar Alterações" : "Salvar Categoria"}</span>
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
