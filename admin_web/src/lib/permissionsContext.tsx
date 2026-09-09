"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type MenuPermissionKey =
  | "visao"
  | "clientes"
  | "rotas"
  | "carregamento"
  | "financeiro"
  | "transacoes"
  | "vendedores"
  | "produtos"
  | "empresa"
  | "configuracoes"
  | "logs"
  | "rua";

export type UserRole = "ADMIN" | "GERENTE" | "VENDEDOR" | "FINANCEIRO" | "OPERACIONAL" | "CUSTOM";

export interface UserPermissions {
  visao: boolean;
  clientes: boolean;
  rotas: boolean;
  carregamento: boolean;
  financeiro: boolean;
  transacoes: boolean;
  vendedores: boolean;
  produtos: boolean;
  empresa: boolean;
  configuracoes: boolean;
  logs: boolean;
  rua: boolean;
}

export const ALL_MENU_KEYS: { key: MenuPermissionKey; label: string; description: string }[] = [
  { key: "visao", label: "Visão Geral (Dashboard)", description: "Visualizar KPIs, faturamento e resumo" },
  { key: "clientes", label: "Clientes", description: "Cadastro e gestão de clientes e compradores" },
  { key: "rotas", label: "Rotas & Agenda", description: "Visualizar e gerenciar escala e calendário de rotas" },
  { key: "carregamento", label: "Cargas", description: "Conferência de carregamento de veículos" },
  { key: "financeiro", label: "Financeiro", description: "Contas a pagar, receber, DRE e fluxo de caixa" },
  { key: "transacoes", label: "Transações", description: "Histórico de vendas e recebimentos em campo" },
  { key: "vendedores", label: "Vendedores", description: "Equipe comercial, metas e comissões" },
  { key: "produtos", label: "Produtos", description: "Catálogo de produtos, tabelas e preços" },
  { key: "empresa", label: "Empresa", description: "Dados cadastrais, logotipo e dados bancários" },
  { key: "configuracoes", label: "Configurações", description: "Gestão de usuários, rotas e condições de pagamento" },
  { key: "logs", label: "Logs de Auditoria", description: "Consulta de atividades e histórico de ações" },
  { key: "rua", label: "Modo Rua", description: "Acesso à aplicação de vendas externa em campo" },
];

export const ROLE_PRESETS: Record<UserRole, UserPermissions> = {
  ADMIN: {
    visao: true,
    clientes: true,
    rotas: true,
    carregamento: true,
    financeiro: true,
    transacoes: true,
    vendedores: true,
    produtos: true,
    empresa: true,
    configuracoes: true,
    logs: true,
    rua: true,
  },
  GERENTE: {
    visao: true,
    clientes: true,
    rotas: true,
    carregamento: true,
    financeiro: true,
    transacoes: true,
    vendedores: true,
    produtos: true,
    empresa: true,
    configuracoes: false,
    logs: true,
    rua: true,
  },
  VENDEDOR: {
    visao: false,
    clientes: true,
    rotas: true,
    carregamento: true,
    financeiro: false,
    transacoes: false,
    vendedores: false,
    produtos: true,
    empresa: false,
    configuracoes: false,
    logs: false,
    rua: true,
  },
  FINANCEIRO: {
    visao: true,
    clientes: true,
    rotas: false,
    carregamento: false,
    financeiro: true,
    transacoes: true,
    vendedores: false,
    produtos: false,
    empresa: false,
    configuracoes: false,
    logs: true,
    rua: false,
  },
  OPERACIONAL: {
    visao: false,
    clientes: true,
    rotas: true,
    carregamento: true,
    financeiro: false,
    transacoes: false,
    vendedores: false,
    produtos: true,
    empresa: false,
    configuracoes: false,
    logs: false,
    rua: false,
  },
  CUSTOM: {
    visao: true,
    clientes: true,
    rotas: false,
    carregamento: false,
    financeiro: false,
    transacoes: false,
    vendedores: false,
    produtos: true,
    empresa: false,
    configuracoes: false,
    logs: false,
    rua: true,
  },
};

interface PermissionsContextType {
  currentUser: User | null;
  role: UserRole;
  permissions: UserPermissions;
  hasPermission: (key: MenuPermissionKey) => boolean;
  isAdmin: boolean;
  loading: boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType>({
  currentUser: null,
  role: "ADMIN",
  permissions: ROLE_PRESETS.ADMIN,
  hasPermission: () => true,
  isAdmin: true,
  loading: false,
  refreshPermissions: async () => {},
});

export function PermissionsProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>("ADMIN");
  const [permissions, setPermissions] = useState<UserPermissions>(ROLE_PRESETS.ADMIN);
  const [loading, setLoading] = useState(true);

  const tenantId = "tenant_luke_001";

  const loadUserPermissions = async (user: User | null) => {
    if (!user) {
      setRole("ADMIN");
      setPermissions(ROLE_PRESETS.ADMIN);
      setLoading(false);
      return;
    }

    try {
      // Tenta buscar no perfil do usuário no Firestore
      const userDoc = await getDoc(doc(db, `tenants/${tenantId}/users`, user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        const userRole: UserRole = data.role || "ADMIN";
        setRole(userRole);
        if (data.permissions) {
          setPermissions({ ...ROLE_PRESETS[userRole] || ROLE_PRESETS.ADMIN, ...data.permissions });
        } else {
          setPermissions(ROLE_PRESETS[userRole] || ROLE_PRESETS.ADMIN);
        }
      } else {
        // Usuário master padrão sem restrição
        setRole("ADMIN");
        setPermissions(ROLE_PRESETS.ADMIN);
      }
    } catch (e) {
      console.warn("Erro ao buscar permissões do usuário, usando padrão ADMIN:", e);
      setRole("ADMIN");
      setPermissions(ROLE_PRESETS.ADMIN);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      loadUserPermissions(user);
    });
    return () => unsub();
  }, []);

  const hasPermission = (key: MenuPermissionKey): boolean => {
    if (role === "ADMIN") return true;
    return permissions[key] === true;
  };

  const refreshPermissions = async () => {
    await loadUserPermissions(currentUser);
  };

  return (
    <PermissionsContext.Provider
      value={{
        currentUser,
        role,
        permissions,
        hasPermission,
        isAdmin: role === "ADMIN",
        loading,
        refreshPermissions,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionsContext);
}
