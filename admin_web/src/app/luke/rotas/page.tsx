"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Users,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  DollarSign,
  Edit2,
  Trash2,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  Wand2,
  CalendarDays,
  List,
  Columns,
  Sparkles,
  ArrowRight,
  Info,
  CalendarCheck,
  Check,
} from "lucide-react";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { usePrivacy } from "@/lib/privacyContext";
import { formatCurrency, formatNumberBR } from "@/lib/formatters";
import { VENDOR_COLOR_PALETTE, getVendorColor, getVendorSolidBadgeStyles } from "@/lib/vendorColors";
import { MASTER_ROUTES_CATALOG, RouteMaster, ScheduledRouteEvent } from "@/lib/routesCatalog";
import VendorBadge from "@/components/VendorBadge";
import Link from "next/link";

// Dados iniciais replicando fielmente o calendário real da LUKE (Agosto 2026 / Google Calendar)
const INITIAL_SCHEDULED_EVENTS: ScheduledRouteEvent[] = [
  // Semana 1
  { id: "ev-1", date: "2026-08-04", routeCode: "F2", routeName: "Rota F2 - Pampulha & Norte", vendorName: "Alexandre", vendorColor: "#0ea5e9", status: "COMPLETED", totalClients: 23, completedVisits: 23, totalSales: 4210, notes: "Atendido 100%" },
  { id: "ev-2", date: "2026-08-04", routeCode: "R1", routeName: "Rota R1 - Centro & Região", vendorName: "Alisson", vendorColor: "#10b981", status: "COMPLETED", totalClients: 24, completedVisits: 24, totalSales: 4850 },
  { id: "ev-3", date: "2026-08-04", routeCode: "R3", routeName: "Rota R3 - Barreiro & Contorno", vendorName: "Lucas", vendorColor: "#8b5cf6", status: "COMPLETED", totalClients: 26, completedVisits: 26, totalSales: 6380 },
  { id: "ev-4", date: "2026-08-05", routeCode: "F1", routeName: "Rota F1 - Leste & Savassi", vendorName: "Alexandre", vendorColor: "#0ea5e9", status: "COMPLETED", totalClients: 20, completedVisits: 20, totalSales: 4490 },
  { id: "ev-5", date: "2026-08-05", routeCode: "F12", routeName: "Rota F12 - Vespasiano", vendorName: "Alexandre", vendorColor: "#0ea5e9", status: "COMPLETED", totalClients: 22, completedVisits: 22, totalSales: 4100 },
  { id: "ev-6", date: "2026-08-05", routeCode: "R2", routeName: "Rota R2 - Zona Sul", vendorName: "Alisson", vendorColor: "#10b981", status: "COMPLETED", totalClients: 22, completedVisits: 22, totalSales: 5120 },
  { id: "ev-7", date: "2026-08-06", routeCode: "F4", routeName: "Rota F4 - Alípio de Melo", vendorName: "Alexandre", vendorColor: "#0ea5e9", status: "COMPLETED", totalClients: 22, completedVisits: 22, totalSales: 4300 },
  { id: "ev-8", date: "2026-08-06", routeCode: "R4", routeName: "Rota R4 - Contagem & Eldorado", vendorName: "Alisson", vendorColor: "#10b981", status: "COMPLETED", totalClients: 25, completedVisits: 25, totalSales: 4900 },

  // Semana 2
  { id: "ev-9", date: "2026-08-11", routeCode: "F5", routeName: "Rota F5 - São Gabriel", vendorName: "Alexandre", vendorColor: "#0ea5e9", status: "COMPLETED", totalClients: 21, completedVisits: 21, totalSales: 3900 },
  { id: "ev-10", date: "2026-08-11", routeCode: "R5", routeName: "Rota R5 - Noroeste", vendorName: "Alisson", vendorColor: "#10b981", status: "COMPLETED", totalClients: 23, completedVisits: 23, totalSales: 4600 },
  { id: "ev-11", date: "2026-08-12", routeCode: "F6", routeName: "Rota F6 - Cidade Nova", vendorName: "Alexandre", vendorColor: "#0ea5e9", status: "COMPLETED", totalClients: 24, completedVisits: 24, totalSales: 4600 },
  { id: "ev-12", date: "2026-08-12", routeCode: "R6", routeName: "Rota R6 - Oeste & Buritis", vendorName: "Alisson", vendorColor: "#10b981", status: "COMPLETED", totalClients: 20, completedVisits: 20, totalSales: 5300 },
  { id: "ev-13", date: "2026-08-13", routeCode: "CENTRO", routeName: "Rota Especial Hipercentro", vendorName: "Alisson", vendorColor: "#10b981", status: "COMPLETED", totalClients: 28, completedVisits: 28, totalSales: 6500 },
  { id: "ev-14", date: "2026-08-13", routeCode: "R7", routeName: "Rota R7 - Nova Lima", vendorName: "Alisson", vendorColor: "#10b981", status: "COMPLETED", totalClients: 18, completedVisits: 18, totalSales: 5800 },
  { id: "ev-15", date: "2026-08-14", routeCode: "F7", routeName: "Rota F7 - Pedro II", vendorName: "Alexandre", vendorColor: "#0ea5e9", status: "COMPLETED", totalClients: 20, completedVisits: 20, totalSales: 4100 },
  { id: "ev-16", date: "2026-08-14", routeCode: "R8", routeName: "Rota R8 - Santa Efigênia", vendorName: "Alisson", vendorColor: "#10b981", status: "COMPLETED", totalClients: 24, completedVisits: 24, totalSales: 4700 },
  { id: "ev-17", date: "2026-08-15", routeCode: "F8", routeName: "Rota F8 - Gutierrez", vendorName: "Alexandre", vendorColor: "#0ea5e9", status: "COMPLETED", totalClients: 22, completedVisits: 22, totalSales: 5000 },

  // Semana 3
  { id: "ev-18", date: "2026-08-18", routeCode: "R9", routeName: "Rota R9 - Vale do Jatobá", vendorName: "Alisson", vendorColor: "#10b981", status: "COMPLETED", totalClients: 25, completedVisits: 25, totalSales: 4400 },
  { id: "ev-19", date: "2026-08-19", routeCode: "R10", routeName: "Rota R10 - Neves", vendorName: "Alisson", vendorColor: "#10b981", status: "COMPLETED", totalClients: 22, completedVisits: 22, totalSales: 4100 },
  { id: "ev-20", date: "2026-08-20", routeCode: "R11", routeName: "Rota R11 - Sabará", vendorName: "Alisson", vendorColor: "#10b981", status: "COMPLETED", totalClients: 19, completedVisits: 19, totalSales: 3900 },

  // Semana 4 (Atual)
  { id: "ev-21", date: "2026-08-25", routeCode: "G1", routeName: "Rota G1 - Grande BH Expansão 1", vendorName: "Alexandre", vendorColor: "#0ea5e9", status: "COMPLETED", totalClients: 15, completedVisits: 15, totalSales: 3200 },
  { id: "ev-22", date: "2026-08-25", routeCode: "Y3", routeName: "Rota Y3 - Setor Norte", vendorName: "Alisson", vendorColor: "#10b981", status: "COMPLETED", totalClients: 16, completedVisits: 16, totalSales: 3600 },
  { id: "ev-23", date: "2026-08-26", routeCode: "F3 + G2", routeName: "Rota Combinada F3 + G2", vendorName: "Alexandre", vendorColor: "#0ea5e9", status: "COMPLETED", totalClients: 26, completedVisits: 26, totalSales: 4800 },
  { id: "ev-24", date: "2026-08-26", routeCode: "F9", routeName: "Rota F9 - Justinópolis", vendorName: "Alisson", vendorColor: "#10b981", status: "COMPLETED", totalClients: 24, completedVisits: 24, totalSales: 3800 },
  { id: "ev-25", date: "2026-08-27", routeCode: "F10", routeName: "Rota F10 - Lagoa Santa", vendorName: "Alisson", vendorColor: "#10b981", status: "IN_PROGRESS", totalClients: 17, completedVisits: 11, totalSales: 2950, notes: "Em atendimento no campo" },
  { id: "ev-26", date: "2026-08-27", routeCode: "G3 + G4", routeName: "Rota Combinada G3 + G4", vendorName: "Alexandre", vendorColor: "#0ea5e9", status: "IN_PROGRESS", totalClients: 20, completedVisits: 14, totalSales: 3400 },
  { id: "ev-27", date: "2026-08-28", routeCode: "F11", routeName: "Rota F11 - Pedro Leopoldo", vendorName: "Alisson", vendorColor: "#10b981", status: "SCHEDULED", totalClients: 18, completedVisits: 0, totalSales: 0 },
  { id: "ev-28", date: "2026-08-28", routeCode: "Y4", routeName: "Rota Y4 - Setor Sul", vendorName: "Alexandre", vendorColor: "#0ea5e9", status: "SCHEDULED", totalClients: 15, completedVisits: 0, totalSales: 0 },
  { id: "ev-29", date: "2026-08-29", routeCode: "Repasse", routeName: "Repasse de Cargas e Clientes", vendorName: "Alisson", vendorColor: "#10b981", status: "SCHEDULED", totalClients: 18, completedVisits: 0, totalSales: 0 },
  { id: "ev-30", date: "2026-08-29", routeCode: "Repasses C", routeName: "Repasses e Cobrança Centro", vendorName: "Alexandre", vendorColor: "#0ea5e9", status: "SCHEDULED", totalClients: 19, completedVisits: 0, totalSales: 0 },
];

const SPECIAL_EVENTS: Record<string, { label: string; color: string }> = {
  "2026-08-04": { label: "Aniversário", color: "#f87171" },
  "2026-08-09": { label: "Dia dos Pais", color: "#f87171" },
  "2026-08-31": { label: "Aniversário", color: "#f87171" },
  "2026-09-05": { label: "Aniversário", color: "#f87171" },
};

const VENDORS_LIST = [
  { name: "Alisson", defaultColor: "#10b981" },
  { name: "Alexandre", defaultColor: "#0ea5e9" },
  { name: "Lucas", defaultColor: "#8b5cf6" },
  { name: "Sabrina", defaultColor: "#f59e0b" },
];

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const WEEK_DAYS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

export default function LukeRotasPage() {
  const { hideValues, togglePrivacy, formatValue } = usePrivacy();

  // Estados principais
  const [scheduledEvents, setScheduledEvents] = useState<ScheduledRouteEvent[]>(INITIAL_SCHEDULED_EVENTS);
  const [viewMode, setViewMode] = useState<"MONTH" | "WEEK" | "DAY" | "LIST">("MONTH");
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(7); // 0-indexed (7 = Agosto)
  const [selectedDate, setSelectedDate] = useState<string>("2026-08-27"); // Data foco
  const [loadingFirestore, setLoadingFirestore] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [vendorFilter, setVendorFilter] = useState("ALL");
  const [prefixFilter, setPrefixFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modais
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduledRouteEvent | null>(null);
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);

  // Formulário de Agendamento
  const [formData, setFormData] = useState<Partial<ScheduledRouteEvent>>({
    date: selectedDate,
    routeCode: "R1",
    routeName: "Rota R1 - Centro & Região",
    vendorName: "Alisson",
    vendorColor: "#10b981",
    status: "SCHEDULED",
    totalClients: 24,
    notes: "",
  });

  const tenantId = "tenant_luke_001";

  // Carregar do Firestore
  const fetchSchedules = async () => {
    try {
      setLoadingFirestore(true);
      const snapshot = await getDocs(collection(db, `tenants/${tenantId}/route_schedules`));
      if (!snapshot.empty) {
        const loaded: ScheduledRouteEvent[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          loaded.push({
            id: docSnap.id,
            date: d.date || "2026-08-27",
            routeCode: d.routeCode || "R1",
            routeName: d.routeName || "Rota",
            vendorName: d.vendorName || "Alisson",
            vendorColor: d.vendorColor || getVendorColor(d.vendorName),
            status: d.status || "SCHEDULED",
            totalClients: Number(d.totalClients || 20),
            completedVisits: Number(d.completedVisits || 0),
            totalSales: Number(d.totalSales || 0),
            notes: d.notes || "",
          });
        });
        setScheduledEvents(loaded);
      }
    } catch (err: any) {
      console.warn("Firestore fetch offline/fallback:", err?.message);
    } finally {
      setLoadingFirestore(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Sincronizar com o Firestore
  const handleSyncFirestore = async () => {
    setLoadingFirestore(true);
    setSyncMessage(null);
    try {
      for (const ev of scheduledEvents) {
        await setDoc(
          doc(db, `tenants/${tenantId}/route_schedules`, ev.id),
          { ...ev, updatedAt: new Date() },
          { merge: true }
        );
      }
      setSyncMessage("✅ Cronograma de rotas sincronizado com o Firestore!");
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (err: any) {
      setSyncMessage(`❌ Erro ao sincronizar: ${err?.message}`);
    } finally {
      setLoadingFirestore(false);
    }
  };

  // Navegação de Datas
  const handlePrev = () => {
    if (viewMode === "MONTH") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else if (viewMode === "WEEK" || viewMode === "DAY") {
      const d = new Date(`${selectedDate}T12:00:00`);
      d.setDate(d.getDate() - (viewMode === "WEEK" ? 7 : 1));
      const nextStr = d.toISOString().split("T")[0];
      setSelectedDate(nextStr);
      setCurrentMonth(d.getMonth());
      setCurrentYear(d.getFullYear());
    }
  };

  const handleNext = () => {
    if (viewMode === "MONTH") {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else if (viewMode === "WEEK" || viewMode === "DAY") {
      const d = new Date(`${selectedDate}T12:00:00`);
      d.setDate(d.getDate() + (viewMode === "WEEK" ? 7 : 1));
      const nextStr = d.toISOString().split("T")[0];
      setSelectedDate(nextStr);
      setCurrentMonth(d.getMonth());
      setCurrentYear(d.getFullYear());
    }
  };

  const handleToday = () => {
    const today = "2026-08-27"; // Data de referência da sessão
    setSelectedDate(today);
    setCurrentMonth(7);
    setCurrentYear(2026);
  };

  // Gerador de Dias do Calendário Mensal
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Domingo
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // Dias do mês anterior para preencher a primeira semana
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      days.push({
        dateStr,
        dayNum,
        isCurrentMonth: false,
      });
    }

    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: true,
      });
    }

    // Dias do próximo mês para completar 35 ou 42 células
    const totalCells = days.length <= 35 ? 35 : 42;
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Dias da Semana Selecionada (para View SEMANA)
  const weekDays = useMemo(() => {
    const focusDate = new Date(`${selectedDate}T12:00:00`);
    const dayOfWeek = focusDate.getDay(); // 0=Dom
    const startOfWeek = new Date(focusDate);
    startOfWeek.setDate(focusDate.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      days.push({
        dateStr,
        dayNum: d.getDate(),
        dayName: WEEK_DAYS[i],
        isToday: dateStr === "2026-08-27",
      });
    }
    return days;
  }, [selectedDate]);

  // Mapa de Eventos por Data com Filtros Aplicados
  const eventsByDate = useMemo(() => {
    const map: Record<string, ScheduledRouteEvent[]> = {};
    scheduledEvents.forEach((ev) => {
      // Aplicar filtros
      const matchSearch =
        ev.routeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.vendorName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchVendor = vendorFilter === "ALL" || ev.vendorName === vendorFilter;
      const matchPrefix =
        prefixFilter === "ALL" ||
        ev.routeCode.toUpperCase().startsWith(prefixFilter.toUpperCase()) ||
        (prefixFilter === "OUTROS" && !["R", "F", "G", "Y"].includes(ev.routeCode.charAt(0).toUpperCase()));

      const matchStatus = statusFilter === "ALL" || ev.status === statusFilter;

      if (matchSearch && matchVendor && matchPrefix && matchStatus) {
        if (!map[ev.date]) map[ev.date] = [];
        map[ev.date].push(ev);
      }
    });
    return map;
  }, [scheduledEvents, searchTerm, vendorFilter, prefixFilter, statusFilter]);

  // Estatísticas Globais do Mês Ativo
  const monthStats = useMemo(() => {
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
    const currentMonthEvents = scheduledEvents.filter((e) => e.date.startsWith(monthPrefix));

    const totalRoutes = currentMonthEvents.length;
    const completedRoutes = currentMonthEvents.filter((e) => e.status === "COMPLETED").length;
    const inProgressRoutes = currentMonthEvents.filter((e) => e.status === "IN_PROGRESS").length;
    const totalSales = currentMonthEvents.reduce((acc, curr) => acc + (curr.totalSales || 0), 0);
    const totalClients = currentMonthEvents.reduce((acc, curr) => acc + (curr.totalClients || 0), 0);

    return {
      totalRoutes,
      completedRoutes,
      inProgressRoutes,
      totalSales,
      totalClients,
    };
  }, [scheduledEvents, currentYear, currentMonth]);

  // Handlers de Abertura de Modal
  const handleOpenNewEventModal = (prefilledDate?: string) => {
    setEditingEvent(null);
    const targetDate = prefilledDate || selectedDate;
    setFormData({
      id: `ev-${Date.now()}`,
      date: targetDate,
      routeCode: "R1",
      routeName: "Rota R1 - Centro & Região",
      vendorName: "Alisson",
      vendorColor: getVendorColor("Alisson"),
      status: "SCHEDULED",
      totalClients: 24,
      completedVisits: 0,
      totalSales: 0,
      notes: "",
    });
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (ev: ScheduledRouteEvent) => {
    setEditingEvent(ev);
    setFormData(ev);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.routeCode || !formData.vendorName) return;

    const payload: ScheduledRouteEvent = {
      id: formData.id || `ev-${Date.now()}`,
      date: formData.date,
      routeCode: formData.routeCode.toUpperCase(),
      routeName: formData.routeName || `Rota ${formData.routeCode}`,
      vendorName: formData.vendorName,
      vendorColor: formData.vendorColor || getVendorColor(formData.vendorName),
      status: formData.status || "SCHEDULED",
      totalClients: Number(formData.totalClients || 20),
      completedVisits: Number(formData.completedVisits || 0),
      totalSales: Number(formData.totalSales || 0),
      notes: formData.notes || "",
    };

    if (editingEvent) {
      setScheduledEvents((prev) =>
        prev.map((item) => (item.id === editingEvent.id ? payload : item))
      );
    } else {
      setScheduledEvents((prev) => [...prev, payload]);
    }

    try {
      await setDoc(doc(db, `tenants/${tenantId}/route_schedules`, payload.id), {
        ...payload,
        updatedAt: new Date(),
      });
    } catch (err) {
      console.warn("Gravado localmente:", err);
    }

    setIsEventModalOpen(false);
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm("Remover este agendamento de rota?")) {
      setScheduledEvents((prev) => prev.filter((item) => item.id !== id));
      try {
        await deleteDoc(doc(db, `tenants/${tenantId}/route_schedules`, id));
      } catch (e) {}
      setIsEventModalOpen(false);
    }
  };

  // Preencher Rota Mestra ao Selecionar no Modal
  const handleSelectMasterRoute = (code: string) => {
    const found = MASTER_ROUTES_CATALOG.find((r) => r.code === code);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        routeCode: found.code,
        routeName: found.name,
        totalClients: found.targetClientsCount,
        vendorName: found.defaultVendorName || prev.vendorName,
        vendorColor: getVendorColor(found.defaultVendorName || prev.vendorName),
      }));
    } else {
      setFormData((prev) => ({ ...prev, routeCode: code }));
    }
  };

  // Gerador Automático de Cronograma Mensal
  const handleGenerateMonthSchedule = () => {
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const generated: ScheduledRouteEvent[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(currentYear, currentMonth, day);
      const dayOfWeek = dateObj.getDay(); // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
      const dateStr = `${monthPrefix}-${String(day).padStart(2, "0")}`;

      // Padrão semanal da LUKE:
      if (dayOfWeek === 1) {
        // Segunda-feira: Representação Especial / Aberturas
        generated.push({
          id: `gen-${dateStr}-rep`,
          date: dateStr,
          routeCode: "REP",
          routeName: "Rota Representação Especial",
          vendorName: "Lucas",
          vendorColor: getVendorColor("Lucas"),
          status: "SCHEDULED",
          totalClients: 15,
        });
      } else if (dayOfWeek === 2) {
        // Terça-feira: R1 (Alisson) + F1 (Alexandre)
        generated.push({
          id: `gen-${dateStr}-r1`,
          date: dateStr,
          routeCode: "R1",
          routeName: "Rota R1 - Centro & Região",
          vendorName: "Alisson",
          vendorColor: getVendorColor("Alisson"),
          status: "SCHEDULED",
          totalClients: 24,
        });
        generated.push({
          id: `gen-${dateStr}-f1`,
          date: dateStr,
          routeCode: "F1",
          routeName: "Rota F1 - Leste & Savassi",
          vendorName: "Alexandre",
          vendorColor: getVendorColor("Alexandre"),
          status: "SCHEDULED",
          totalClients: 20,
        });
      } else if (dayOfWeek === 3) {
        // Quarta-feira: R2 (Alisson) + F2 (Alexandre)
        generated.push({
          id: `gen-${dateStr}-r2`,
          date: dateStr,
          routeCode: "R2",
          routeName: "Rota R2 - Zona Sul",
          vendorName: "Alisson",
          vendorColor: getVendorColor("Alisson"),
          status: "SCHEDULED",
          totalClients: 22,
        });
        generated.push({
          id: `gen-${dateStr}-f2`,
          date: dateStr,
          routeCode: "F2",
          routeName: "Rota F2 - Pampulha & Norte",
          vendorName: "Alexandre",
          vendorColor: getVendorColor("Alexandre"),
          status: "SCHEDULED",
          totalClients: 23,
        });
      } else if (dayOfWeek === 4) {
        // Quinta-feira: R3 (Alisson) + F3 (Alexandre)
        generated.push({
          id: `gen-${dateStr}-r3`,
          date: dateStr,
          routeCode: "R3",
          routeName: "Rota R3 - Barreiro & Contorno",
          vendorName: "Alisson",
          vendorColor: getVendorColor("Alisson"),
          status: "SCHEDULED",
          totalClients: 26,
        });
        generated.push({
          id: `gen-${dateStr}-f3`,
          date: dateStr,
          routeCode: "F3",
          routeName: "Rota F3 - Venda Nova & Região",
          vendorName: "Alexandre",
          vendorColor: getVendorColor("Alexandre"),
          status: "SCHEDULED",
          totalClients: 25,
        });
      } else if (dayOfWeek === 5) {
        // Sexta-feira: R4 (Alisson) + F4 (Alexandre)
        generated.push({
          id: `gen-${dateStr}-r4`,
          date: dateStr,
          routeCode: "R4",
          routeName: "Rota R4 - Contagem & Eldorado",
          vendorName: "Alisson",
          vendorColor: getVendorColor("Alisson"),
          status: "SCHEDULED",
          totalClients: 25,
        });
        generated.push({
          id: `gen-${dateStr}-f4`,
          date: dateStr,
          routeCode: "F4",
          routeName: "Rota F4 - Alípio de Melo & Castelo",
          vendorName: "Alexandre",
          vendorColor: getVendorColor("Alexandre"),
          status: "SCHEDULED",
          totalClients: 22,
        });
      } else if (dayOfWeek === 6) {
        // Sábado: Repasses e Cobranças
        generated.push({
          id: `gen-${dateStr}-rep-s`,
          date: dateStr,
          routeCode: "Repasse S",
          routeName: "Repasse & Cobrança Setor Sul",
          vendorName: "Alisson",
          vendorColor: getVendorColor("Alisson"),
          status: "SCHEDULED",
          totalClients: 18,
        });
        generated.push({
          id: `gen-${dateStr}-rep-c`,
          date: dateStr,
          routeCode: "Repasse C",
          routeName: "Repasse & Cobrança Setor Centro",
          vendorName: "Alexandre",
          vendorColor: getVendorColor("Alexandre"),
          status: "SCHEDULED",
          totalClients: 19,
        });
      }
    }

    // Mesclar sem duplicar datas existentes
    setScheduledEvents((prev) => {
      const existingDates = new Set(prev.map((e) => e.date));
      const onlyNew = generated.filter((g) => !existingDates.has(g.date));
      return [...prev, ...onlyNew];
    });

    setSyncMessage(`✨ Cronograma gerado com sucesso para ${MONTH_NAMES[currentMonth]} de ${currentYear}!`);
    setTimeout(() => setSyncMessage(null), 5000);
    setIsGeneratorModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho Principal */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-black text-brand-offwhite tracking-tight flex items-center gap-2.5">
              <CalendarIcon className="text-brand-gold" size={28} />
              <span>Agenda & Gestão de Rotas</span>
            </h2>
            <span className="bg-brand-gold/20 text-brand-gold text-xs px-2.5 py-1 rounded-full font-bold border border-brand-gold/30">
              LUKE Brasil
            </span>
          </div>
          <p className="text-brand-offwhite/60 text-sm mt-1">
            Planejamento inteligente estilo Google Calendar: configure rotas por dia, semana ou mês com cores por vendedor.
          </p>
        </div>

        {/* Barra de Ações Rápidas */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Seletor de Modo de Visualização */}
          <div className="bg-brand-graphite p-1 rounded-xl border border-brand-blue/40 flex items-center shadow-md">
            <button
              onClick={() => setViewMode("MONTH")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "MONTH"
                  ? "bg-brand-gold text-brand-black shadow-sm"
                  : "text-brand-offwhite/70 hover:text-brand-offwhite hover:bg-brand-blue/20"
              }`}
            >
              <CalendarDays size={14} />
              <span>Mês</span>
            </button>
            <button
              onClick={() => setViewMode("WEEK")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "WEEK"
                  ? "bg-brand-gold text-brand-black shadow-sm"
                  : "text-brand-offwhite/70 hover:text-brand-offwhite hover:bg-brand-blue/20"
              }`}
            >
              <Columns size={14} />
              <span>Semana</span>
            </button>
            <button
              onClick={() => setViewMode("DAY")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "DAY"
                  ? "bg-brand-gold text-brand-black shadow-sm"
                  : "text-brand-offwhite/70 hover:text-brand-offwhite hover:bg-brand-blue/20"
              }`}
            >
              <CalendarCheck size={14} />
              <span>Dia</span>
            </button>
            <button
              onClick={() => setViewMode("LIST")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "LIST"
                  ? "bg-brand-gold text-brand-black shadow-sm"
                  : "text-brand-offwhite/70 hover:text-brand-offwhite hover:bg-brand-blue/20"
              }`}
            >
              <List size={14} />
              <span>Lista</span>
            </button>
          </div>

          {/* Gerador de Cronograma Recorrente */}
          <button
            onClick={() => setIsGeneratorModalOpen(true)}
            className="flex items-center space-x-1.5 bg-brand-blue/40 border border-brand-gold/40 text-brand-gold hover:bg-brand-blue/60 px-3.5 py-2 rounded-xl font-bold transition text-xs shadow-md"
            title="Montador de Cronograma Automático"
          >
            <Wand2 size={15} />
            <span>Montar Mês</span>
          </button>

          {/* Sincronizar Firestore */}
          <button
            onClick={handleSyncFirestore}
            disabled={loadingFirestore}
            className="flex items-center space-x-1.5 bg-brand-graphite border border-brand-blue/40 text-brand-offwhite hover:bg-brand-blue/30 px-3.5 py-2 rounded-xl font-semibold transition text-xs shadow-md"
            title="Sincronizar com Firestore"
          >
            <RefreshCw size={14} className={loadingFirestore ? "animate-spin text-brand-gold" : "text-brand-gold"} />
            <span className="hidden sm:inline">Sincronizar</span>
          </button>

          {/* Novo Agendamento */}
          <button
            onClick={() => handleOpenNewEventModal()}
            className="flex items-center space-x-1.5 bg-brand-gold text-brand-black px-4 py-2 rounded-xl font-extrabold hover:bg-yellow-500 transition shadow-lg text-xs shrink-0"
          >
            <Plus size={16} />
            <span>Agendar Rota</span>
          </button>
        </div>
      </div>

      {/* Sync Message Alert */}
      {syncMessage && (
        <div className="p-3.5 rounded-xl bg-brand-graphite border border-brand-gold/50 text-xs font-semibold text-brand-offwhite flex items-center space-x-3 shadow-lg animate-fadeIn">
          <CheckCircle2 className="text-brand-gold shrink-0" size={18} />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Navegação de Data & Controles Estilo Google Calendar */}
      <div className="bg-brand-graphite rounded-2xl border border-brand-blue/30 p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Controles de Mês/Ano */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center space-x-1 bg-brand-black/60 rounded-xl p-1 border border-brand-blue/30">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-brand-offwhite/70 hover:text-brand-offwhite hover:bg-brand-blue/20 transition"
              title="Anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 text-xs font-bold text-brand-offwhite hover:text-brand-gold transition"
            >
              Hoje
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg text-brand-offwhite/70 hover:text-brand-offwhite hover:bg-brand-blue/20 transition"
              title="Próximo"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <h3 className="text-xl font-black text-brand-offwhite tracking-tight capitalize">
              {viewMode === "DAY"
                ? `${new Date(`${selectedDate}T12:00:00`).getDate()} de ${MONTH_NAMES[new Date(`${selectedDate}T12:00:00`).getMonth()]} de ${new Date(`${selectedDate}T12:00:00`).getFullYear()}`
                : `${MONTH_NAMES[currentMonth]} ${currentYear}`}
            </h3>
          </div>
        </div>

        {/* Filtros em Linha */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Busca */}
          <div className="relative min-w-[150px] flex-1 sm:flex-none">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-brand-offwhite/40" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar rota/código..."
              className="w-full pl-8 pr-2.5 py-1.5 bg-brand-black border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite placeholder-brand-offwhite/30 focus:outline-none focus:border-brand-gold"
            />
          </div>

          {/* Filtro por Vendedor */}
          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="bg-brand-black border border-brand-blue/40 text-brand-offwhite text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-gold"
          >
            <option value="ALL">Todos os Vendedores</option>
            {VENDORS_LIST.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name}
              </option>
            ))}
          </select>

          {/* Filtro por Prefixo de Rota */}
          <select
            value={prefixFilter}
            onChange={(e) => setPrefixFilter(e.target.value)}
            className="bg-brand-black border border-brand-blue/40 text-brand-offwhite text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-gold font-mono"
          >
            <option value="ALL">Todos os Prefixos</option>
            <option value="R">Rotas R (R1 a R12)</option>
            <option value="F">Rotas F (F1 a F12)</option>
            <option value="G">Rotas G (G1 a G4)</option>
            <option value="Y">Rotas Y (Y3, Y4)</option>
            <option value="OUTROS">Especiais / Repasses</option>
          </select>

          {/* Filtro por Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-brand-black border border-brand-blue/40 text-brand-offwhite text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-gold"
          >
            <option value="ALL">Todos os Status</option>
            <option value="SCHEDULED">Agendada</option>
            <option value="IN_PROGRESS">Em Andamento</option>
            <option value="COMPLETED">Concluída</option>
          </select>
        </div>
      </div>

      {/* KPIs Rápidos do Mês */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-brand-graphite p-3.5 rounded-xl border border-brand-blue/30 shadow-xs">
          <span className="text-[11px] font-semibold text-brand-offwhite/60 uppercase">Rotas no Mês</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-black text-brand-offwhite">{monthStats.totalRoutes} rotas</span>
            <CalendarCheck size={18} className="text-brand-gold" />
          </div>
        </div>

        <div className="bg-brand-graphite p-3.5 rounded-xl border border-brand-blue/30 shadow-xs">
          <span className="text-[11px] font-semibold text-brand-offwhite/60 uppercase">Concluídas</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-black text-emerald-400">
              {monthStats.completedRoutes} / {monthStats.totalRoutes}
            </span>
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
        </div>

        <div className="bg-brand-graphite p-3.5 rounded-xl border border-brand-blue/30 shadow-xs">
          <span className="text-[11px] font-semibold text-brand-offwhite/60 uppercase">Clientes Atendidos</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-black text-blue-400">{monthStats.totalClients} visitas</span>
            <Users size={18} className="text-blue-400" />
          </div>
        </div>

        <div className="bg-brand-graphite p-3.5 rounded-xl border border-brand-blue/30 shadow-xs">
          <span className="text-[11px] font-semibold text-brand-offwhite/60 uppercase">Faturamento Mês</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-black text-brand-gold">
              {formatValue(monthStats.totalSales, "currency")}
            </span>
            <DollarSign size={18} className="text-brand-gold" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. VISÃO MÊS (Google Calendar Grid)                                       */}
      {/* ========================================================================= */}
      {viewMode === "MONTH" && (
        <div className="bg-brand-graphite rounded-2xl border border-brand-blue/30 shadow-2xl overflow-hidden">
          {/* Cabeçalho dos Dias da Semana */}
          <div className="grid grid-cols-7 border-b border-brand-blue/30 bg-brand-black/70 text-center text-xs font-bold text-brand-offwhite/70 py-2.5">
            {WEEK_DAYS.map((day) => (
              <div key={day} className="tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Grid de Dias */}
          <div className="grid grid-cols-7 divide-x divide-y divide-brand-blue/20 bg-brand-black/30">
            {calendarDays.map((dayObj, index) => {
              const dateEvents = eventsByDate[dayObj.dateStr] || [];
              const special = SPECIAL_EVENTS[dayObj.dateStr];
              const isToday = dayObj.dateStr === "2026-08-27";
              const isSelected = dayObj.dateStr === selectedDate;

              return (
                <div
                  key={index}
                  onClick={() => setSelectedDate(dayObj.dateStr)}
                  className={`min-h-[110px] sm:min-h-[130px] p-1.5 flex flex-col justify-between transition group relative ${
                    !dayObj.isCurrentMonth
                      ? "opacity-35 bg-brand-black/20"
                      : isToday
                      ? "bg-brand-blue/10 ring-1 ring-brand-gold/60 inset-0"
                      : "hover:bg-brand-blue/5"
                  }`}
                >
                  {/* Cabeçalho do Dia (Número + Ações) */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? "bg-brand-gold text-brand-black shadow-xs font-black"
                          : isSelected
                          ? "bg-brand-blue/40 text-brand-gold border border-brand-gold/40"
                          : dayObj.isCurrentMonth
                          ? "text-brand-offwhite/90"
                          : "text-brand-offwhite/40"
                      }`}
                    >
                      {dayObj.dayNum}
                    </span>

                    {/* Botão + rápido ao passar o mouse */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenNewEventModal(dayObj.dateStr);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-brand-gold hover:bg-brand-blue/30 rounded transition"
                      title="Agendar Rota neste dia"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Badges de Eventos Especiais (ex: Aniversário / Feriado) */}
                  {special && (
                    <div className="mb-1">
                      <span
                        style={{ backgroundColor: `${special.color}25`, borderColor: special.color, color: special.color }}
                        className="text-[10px] px-1.5 py-0.5 rounded border font-bold block truncate"
                      >
                        🎉 {special.label}
                      </span>
                    </div>
                  )}

                  {/* Pílulas de Rotas Agendadas no Dia (Cores do Vendedor) */}
                  <div className="space-y-1 overflow-y-auto max-h-[85px] pr-0.5 custom-scrollbar">
                    {dateEvents.map((ev) => {
                      const color = ev.vendorColor || getVendorColor(ev.vendorName);
                      return (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEvent(ev);
                          }}
                          style={{
                            backgroundColor: color,
                            color: "#ffffff",
                          }}
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold shadow-xs cursor-pointer hover:brightness-110 transition flex items-center justify-between group/chip"
                          title={`${ev.routeCode} - ${ev.routeName} (${ev.vendorName})`}
                        >
                          <span className="truncate flex items-center gap-1">
                            <span className="font-mono bg-black/20 px-1 rounded text-[9px]">
                              {ev.routeCode}
                            </span>
                            <span className="truncate">{ev.vendorName}</span>
                          </span>
                          {ev.status === "COMPLETED" && (
                            <Check size={10} className="shrink-0 text-white/90" />
                          )}
                          {ev.status === "IN_PROGRESS" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Rodapé do Dia: Se vazio, dica sutil */}
                  {dateEvents.length === 0 && !special && dayObj.isCurrentMonth && (
                    <div className="text-[10px] text-brand-offwhite/20 italic text-center py-1">
                      Livre
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. VISÃO SEMANA (7 Colunas Detalhadas)                                     */}
      {/* ========================================================================= */}
      {viewMode === "WEEK" && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const dateEvents = eventsByDate[day.dateStr] || [];
            const special = SPECIAL_EVENTS[day.dateStr];

            return (
              <div
                key={day.dateStr}
                className={`bg-brand-graphite rounded-2xl border p-3 flex flex-col justify-between shadow-lg transition ${
                  day.isToday
                    ? "border-brand-gold/60 ring-1 ring-brand-gold/40 bg-brand-blue/10"
                    : "border-brand-blue/30"
                }`}
              >
                <div>
                  {/* Cabeçalho do Dia */}
                  <div className="flex items-center justify-between pb-2 border-b border-brand-blue/20 mb-3">
                    <div>
                      <span className="text-[11px] font-bold text-brand-offwhite/60 uppercase">
                        {day.dayName}
                      </span>
                      <p className="text-xl font-black text-brand-offwhite">{day.dayNum}</p>
                    </div>
                    <button
                      onClick={() => handleOpenNewEventModal(day.dateStr)}
                      className="p-1 rounded-lg bg-brand-gold/20 text-brand-gold hover:bg-brand-gold hover:text-brand-black transition"
                      title="Adicionar Rota"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Evento Especial */}
                  {special && (
                    <div
                      style={{ backgroundColor: `${special.color}20`, borderColor: special.color, color: special.color }}
                      className="text-[11px] px-2 py-1 rounded-lg border font-bold mb-2 flex items-center gap-1.5"
                    >
                      <span>🎉</span>
                      <span>{special.label}</span>
                    </div>
                  )}

                  {/* Cards de Rotas da Semana */}
                  <div className="space-y-2">
                    {dateEvents.map((ev) => {
                      const color = ev.vendorColor || getVendorColor(ev.vendorName);
                      return (
                        <div
                          key={ev.id}
                          onClick={() => handleEditEvent(ev)}
                          className="p-2.5 rounded-xl bg-brand-black/70 border border-brand-blue/30 hover:border-brand-gold/60 cursor-pointer transition shadow-sm space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              style={{ backgroundColor: color }}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono font-black text-white"
                            >
                              {ev.routeCode}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                                ev.status === "COMPLETED"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : ev.status === "IN_PROGRESS"
                                  ? "bg-amber-500/20 text-amber-400 animate-pulse"
                                  : "bg-blue-500/20 text-blue-300"
                              }`}
                            >
                              {ev.status === "COMPLETED" ? "Fechada" : ev.status === "IN_PROGRESS" ? "Em Rota" : "Agendada"}
                            </span>
                          </div>

                          <p className="text-xs font-bold text-brand-offwhite leading-tight truncate">
                            {ev.routeName}
                          </p>

                          <div className="flex items-center justify-between pt-1 border-t border-brand-blue/10">
                            <VendorBadge vendorName={ev.vendorName} color={color} size="xs" variant="pill" />
                            <span className="text-[11px] font-bold text-brand-gold font-mono">
                              {ev.totalSales && ev.totalSales > 0 ? formatValue(ev.totalSales, "currency") : `${ev.totalClients} cli`}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {dateEvents.length === 0 && (
                      <div className="text-center py-6 text-brand-offwhite/30 text-xs italic">
                        Sem rotas escaladas
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-brand-blue/20 text-[10px] text-brand-offwhite/50 text-right">
                  {dateEvents.length} rota(s)
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VISÃO DIA (Foco Operacional e Tempo Real)                              */}
      {/* ========================================================================= */}
      {viewMode === "DAY" && (
        <div className="space-y-4">
          {/* Barra de Seleção de Dia */}
          <div className="bg-brand-graphite p-4 rounded-2xl border border-brand-blue/30 shadow-md flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-brand-gold/20 text-brand-gold flex items-center justify-center border border-brand-gold/30 font-black text-xl">
                {new Date(`${selectedDate}T12:00:00`).getDate()}
              </div>
              <div>
                <h4 className="text-lg font-bold text-brand-offwhite">
                  Operação do Dia: {selectedDate.split("-").reverse().join("/")}
                </h4>
                <p className="text-xs text-brand-offwhite/60">
                  Rotas em execução, vendedores escalados e link direto para o fechamento.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-brand-black border border-brand-blue/40 text-brand-offwhite text-xs rounded-xl px-3 py-2 font-mono"
              />
              <button
                onClick={() => handleOpenNewEventModal(selectedDate)}
                className="flex items-center space-x-1.5 bg-brand-gold text-brand-black px-3.5 py-2 rounded-xl font-bold text-xs hover:bg-yellow-500 transition shadow-md"
              >
                <Plus size={15} />
                <span>Adicionar Rota Hoje</span>
              </button>
            </div>
          </div>

          {/* Lista de Rotas do Dia */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(eventsByDate[selectedDate] || []).map((ev) => {
              const color = ev.vendorColor || getVendorColor(ev.vendorName);
              return (
                <div
                  key={ev.id}
                  className="bg-brand-graphite rounded-2xl border border-brand-blue/30 p-5 shadow-xl space-y-4 relative overflow-hidden group hover:border-brand-gold/60 transition"
                >
                  {/* Faixa colorida superior com a cor do vendedor */}
                  <div style={{ backgroundColor: color }} className="absolute top-0 left-0 right-0 h-1.5" />

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          style={{ backgroundColor: color }}
                          className="px-2 py-0.5 rounded-md text-xs font-mono font-black text-white"
                        >
                          {ev.routeCode}
                        </span>
                        <h4 className="text-base font-extrabold text-brand-offwhite truncate max-w-[200px]">
                          {ev.routeName}
                        </h4>
                      </div>
                      <div className="mt-2">
                        <VendorBadge vendorName={ev.vendorName} color={color} size="sm" variant="chip" />
                      </div>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                        ev.status === "COMPLETED"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : ev.status === "IN_PROGRESS"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}
                    >
                      {ev.status === "COMPLETED" ? "Concluída" : ev.status === "IN_PROGRESS" ? "Em Andamento" : "Agendada"}
                    </span>
                  </div>

                  {/* Progresso de Visitas */}
                  <div className="space-y-1.5 bg-brand-black/50 p-3 rounded-xl border border-brand-blue/20">
                    <div className="flex justify-between text-xs font-semibold text-brand-offwhite/80">
                      <span>Progresso de Visitas</span>
                      <span className="font-mono text-brand-gold">
                        {ev.completedVisits || 0} / {ev.totalClients} clientes
                      </span>
                    </div>
                    <div className="w-full h-2 bg-brand-black rounded-full overflow-hidden border border-brand-blue/30">
                      <div
                        style={{
                          width: `${Math.min(100, (((ev.completedVisits || 0) / (ev.totalClients || 1)) * 100))}%`,
                          backgroundColor: color,
                        }}
                        className="h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>

                  {/* Faturamento */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-brand-offwhite/60">Faturamento:</span>
                    <span className="font-mono font-black text-sm text-emerald-400">
                      {formatValue(ev.totalSales || 0, "currency")}
                    </span>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center justify-between pt-3 border-t border-brand-blue/20">
                    <Link
                      href="/luke/rua"
                      className="flex items-center space-x-1.5 text-xs font-bold text-brand-gold hover:underline"
                    >
                      <span>Abrir no Modo Rua</span>
                      <ArrowRight size={13} />
                    </Link>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEditEvent(ev)}
                        className="p-1.5 text-brand-offwhite/60 hover:text-brand-gold rounded-lg hover:bg-brand-blue/20 transition"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="p-1.5 text-brand-offwhite/60 hover:text-rose-400 rounded-lg hover:bg-brand-blue/20 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {(eventsByDate[selectedDate] || []).length === 0 && (
              <div className="col-span-full bg-brand-graphite p-12 rounded-2xl border border-brand-blue/30 text-center space-y-3">
                <Truck size={36} className="mx-auto text-brand-offwhite/30" />
                <h4 className="text-lg font-bold text-brand-offwhite">Nenhuma rota escalada para este dia</h4>
                <p className="text-xs text-brand-offwhite/50 max-w-sm mx-auto">
                  Clique no botão abaixo para atribuir uma rota a um vendedor nesta data.
                </p>
                <button
                  onClick={() => handleOpenNewEventModal(selectedDate)}
                  className="inline-flex items-center space-x-2 bg-brand-gold text-brand-black px-4 py-2 rounded-xl font-bold text-xs hover:bg-yellow-500 transition shadow-md"
                >
                  <Plus size={15} />
                  <span>Escalar Rota para Hoje</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. VISÃO LISTA / TABELA (Edição em Lote e Filtros)                         */}
      {/* ========================================================================= */}
      {viewMode === "LIST" && (
        <div className="bg-brand-graphite rounded-2xl border border-brand-blue/30 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-blue/10 border-b border-brand-blue/30 text-brand-offwhite/70 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Data</th>
                  <th className="p-4 font-medium">Código & Rota</th>
                  <th className="p-4 font-medium">Vendedor Responsável</th>
                  <th className="p-4 font-medium">Clientes Previstos</th>
                  <th className="p-4 font-medium">Faturamento</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-blue/10 text-sm">
                {scheduledEvents
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((ev) => {
                    const color = ev.vendorColor || getVendorColor(ev.vendorName);
                    return (
                      <tr key={ev.id} className="hover:bg-brand-blue/5 transition group">
                        <td className="p-4 font-mono text-xs font-bold text-brand-offwhite/90">
                          {ev.date.split("-").reverse().join("/")}
                        </td>

                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <span
                              style={{ backgroundColor: color }}
                              className="px-2 py-0.5 rounded text-xs font-mono font-black text-white"
                            >
                              {ev.routeCode}
                            </span>
                            <span className="font-bold text-brand-offwhite">{ev.routeName}</span>
                          </div>
                        </td>

                        <td className="p-4">
                          <VendorBadge vendorName={ev.vendorName} color={color} size="sm" variant="chip" />
                        </td>

                        <td className="p-4 font-mono text-xs text-brand-offwhite/80">
                          {ev.completedVisits || 0} / {ev.totalClients} visitas
                        </td>

                        <td className="p-4 font-mono text-xs font-bold text-emerald-400">
                          {ev.totalSales && ev.totalSales > 0 ? formatValue(ev.totalSales, "currency") : "---"}
                        </td>

                        <td className="p-4">
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                              ev.status === "COMPLETED"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : ev.status === "IN_PROGRESS"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            }`}
                          >
                            {ev.status === "COMPLETED" ? "Concluída" : ev.status === "IN_PROGRESS" ? "Em Rota" : "Agendada"}
                          </span>
                        </td>

                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => handleEditEvent(ev)}
                            className="text-brand-offwhite/50 hover:text-brand-gold p-1.5 rounded-lg hover:bg-brand-blue/10 transition"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(ev.id)}
                            className="text-brand-offwhite/50 hover:text-rose-400 p-1.5 rounded-lg hover:bg-brand-blue/10 transition"
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
      )}

      {/* ========================================================================= */}
      {/* MODAL: CRIAR / EDITAR AGENDAMENTO DE ROTA                                  */}
      {/* ========================================================================= */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-brand-graphite w-full max-w-lg rounded-2xl border border-brand-blue/40 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEventModalOpen(false)}
              className="absolute top-4 right-4 text-brand-offwhite/50 hover:text-brand-offwhite p-1 rounded-lg hover:bg-brand-blue/20 transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-gold/20 text-brand-gold flex items-center justify-center border border-brand-gold/30">
                <CalendarIcon size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-offwhite">
                  {editingEvent ? "Editar Rota Agendada" : "Agendar Nova Rota"}
                </h3>
                <p className="text-xs text-brand-offwhite/60">
                  Selecione a data, rota mestre e o vendedor responsável.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              {/* Data do Agendamento */}
              <div>
                <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                  Data de Execução
                </label>
                <input
                  type="date"
                  required
                  value={formData.date || ""}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold font-mono"
                />
              </div>

              {/* Rota Mestra (Catálogo da Empresa) */}
              <div>
                <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                  Selecione a Rota (Catálogo Fixo da Empresa)
                </label>
                <select
                  value={formData.routeCode || "R1"}
                  onChange={(e) => handleSelectMasterRoute(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold font-mono font-bold"
                >
                  <optgroup label="Rotas Prefixo R (Principal: Alisson)">
                    {MASTER_ROUTES_CATALOG.filter((r) => r.prefix === "R").map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.code} - {r.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Rotas Prefixo F (Principal: Alexandre)">
                    {MASTER_ROUTES_CATALOG.filter((r) => r.prefix === "F").map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.code} - {r.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Rotas G & Y">
                    {MASTER_ROUTES_CATALOG.filter((r) => r.prefix === "G" || r.prefix === "Y").map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.code} - {r.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Especiais & Repasses">
                    {MASTER_ROUTES_CATALOG.filter((r) => r.prefix === "ESPECIAL").map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.code} - {r.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Vendedor Responsável nesta Data */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-brand-offwhite/70">
                    Vendedor Responsável nesta Data
                  </label>
                  <span className="text-[10px] text-brand-gold font-bold">Alternância Flexível</span>
                </div>
                <select
                  value={formData.vendorName || "Alisson"}
                  onChange={(e) => {
                    const vName = e.target.value;
                    const vColor = getVendorColor(vName);
                    setFormData({ ...formData, vendorName: vName, vendorColor: vColor });
                  }}
                  className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold font-bold"
                >
                  {VENDORS_LIST.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} (Cor padrão do vendedor)
                    </option>
                  ))}
                </select>
              </div>

              {/* Preview Visual */}
              <div className="p-3 bg-brand-black/60 rounded-xl border border-brand-blue/30 flex items-center justify-between">
                <span className="text-xs text-brand-offwhite/60">Identidade Visual na Agenda:</span>
                <div className="flex items-center space-x-2">
                  <span
                    style={{ backgroundColor: formData.vendorColor || "#10b981" }}
                    className="px-2 py-0.5 rounded text-xs font-mono font-black text-white shadow-xs"
                  >
                    {formData.routeCode}
                  </span>
                  <VendorBadge
                    vendorName={formData.vendorName || "Alisson"}
                    color={formData.vendorColor}
                    size="sm"
                    variant="chip"
                  />
                </div>
              </div>

              {/* Status & Total de Clientes */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status || "SCHEDULED"}
                    onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  >
                    <option value="SCHEDULED">Agendada</option>
                    <option value="IN_PROGRESS">Em Andamento</option>
                    <option value="COMPLETED">Concluída</option>
                    <option value="CANCELLED">Cancelada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                    Meta de Clientes
                  </label>
                  <input
                    type="number"
                    value={formData.totalClients || 20}
                    onChange={(e) => setFormData({ ...formData, totalClients: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold font-mono font-bold"
                  />
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                  Observações / Instruções Especiais
                </label>
                <textarea
                  rows={2}
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                  placeholder="Ex: Focar cobranças de boleto no cliente 12..."
                />
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center justify-between pt-4 border-t border-brand-blue/30">
                {editingEvent ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(editingEvent.id)}
                    className="px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                  >
                    Excluir Agendamento
                  </button>
                ) : <div />}

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEventModalOpen(false)}
                    className="px-4 py-2 text-sm text-brand-offwhite/70 hover:text-brand-offwhite transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-brand-gold text-brand-black rounded-lg font-extrabold hover:bg-yellow-500 transition shadow-lg text-sm"
                  >
                    Salvar na Agenda
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GERADOR AUTOMÁTICO DE CRONOGRAMA DO MÊS ("MONTAR MÊS")             */}
      {/* ========================================================================= */}
      {isGeneratorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-brand-graphite w-full max-w-lg rounded-2xl border border-brand-blue/40 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setIsGeneratorModalOpen(false)}
              className="absolute top-4 right-4 text-brand-offwhite/50 hover:text-brand-offwhite p-1 rounded-lg hover:bg-brand-blue/20 transition"
            >
              <X size={20} />
            </button>

            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-brand-gold/20 text-brand-gold flex items-center justify-center border border-brand-gold/30">
                <Wand2 size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-offwhite">
                  Montador Automático de Cronograma
                </h3>
                <p className="text-xs text-brand-offwhite/60">
                  Gere o cronograma para todo o mês de {MONTH_NAMES[currentMonth]} {currentYear} em 1 clique.
                </p>
              </div>
            </div>

            <div className="p-4 bg-brand-black/60 rounded-xl border border-brand-blue/30 space-y-2.5 text-xs text-brand-offwhite/80">
              <p className="font-bold text-brand-gold flex items-center gap-1.5">
                <Sparkles size={14} />
                <span>Regras Padrão da LUKE que serão aplicadas:</span>
              </p>
              <ul className="space-y-1.5 pl-4 list-disc text-brand-offwhite/70">
                <li><strong>Segundas-feiras:</strong> Rota Representação Especial (Lucas).</li>
                <li><strong>Terças-feiras:</strong> Rota R1 (Alisson) & Rota F1 (Alexandre).</li>
                <li><strong>Quartas-feiras:</strong> Rota R2 (Alisson) & Rota F2 (Alexandre).</li>
                <li><strong>Quintas-feiras:</strong> Rota R3 (Alisson) & Rota F3 (Alexandre).</li>
                <li><strong>Sextas-feiras:</strong> Rota R4 (Alisson) & Rota F4 (Alexandre).</li>
                <li><strong>Sábados:</strong> Repasse Sul (Alisson) & Repasse Centro (Alexandre).</li>
              </ul>
              <p className="text-[11px] text-brand-offwhite/50 pt-1">
                💡 Após a geração, você poderá arrastar, editar ou trocar vendedores pontualmente em qualquer dia diretamente no calendário.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-brand-blue/30">
              <button
                type="button"
                onClick={() => setIsGeneratorModalOpen(false)}
                className="px-4 py-2 text-sm text-brand-offwhite/70 hover:text-brand-offwhite transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGenerateMonthSchedule}
                className="px-6 py-2.5 bg-brand-gold text-brand-black rounded-xl font-extrabold hover:bg-yellow-500 transition shadow-lg text-sm flex items-center space-x-2"
              >
                <Sparkles size={16} />
                <span>Gerar para {MONTH_NAMES[currentMonth]}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
