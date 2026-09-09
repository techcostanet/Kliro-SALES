import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type ActivityAction =
  | "LOGIN"
  | "LOGOUT"
  | "CLIENTE_CRIADO"
  | "CLIENTE_EDITADO"
  | "CLIENTE_STATUS"
  | "CLIENTE_EXCLUIDO"
  | "USUARIO_CRIADO"
  | "USUARIO_EDITADO"
  | "USUARIO_EXCLUIDO"
  | "PERMISSOES_ALTERADAS"
  | "CONDICAO_PAGTO_CRIADA"
  | "CONDICAO_PAGTO_EDITADA"
  | "CONDICAO_PAGTO_EXCLUIDA"
  | "ROTA_CRIADA"
  | "ROTA_EDITADA"
  | "ROTA_EXCLUIDA"
  | "ROTA_INATIVADA"
  | "VENDA_REALIZADA"
  | "ROTA_INICIADA"
  | "ROTA_FINALIZADA"
  | "PRECO_ALTERADO"
  | "SISTEMA_CONFIGURADO";

export type ActivityEntity =
  | "CLIENTE"
  | "USUARIO"
  | "ROTA"
  | "PRODUTO"
  | "CONDICAO_PAGTO"
  | "TRANSACAO"
  | "EXECUCAO_ROTA"
  | "FINANCEIRO"
  | "SISTEMA";

export interface ActivityLogItem {
  id?: string;
  timestamp?: string;
  createdAt?: any;
  userId?: string;
  userName: string;
  userEmail: string;
  action: ActivityAction;
  entity: ActivityEntity;
  entityId?: string;
  details: string;
  metadata?: Record<string, any>;
}

export async function logActivity(
  tenantId: string = "tenant_luke_001",
  data: Omit<ActivityLogItem, "id" | "timestamp" | "createdAt">
): Promise<string | null> {
  try {
    const payload = {
      ...data,
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp(),
    };
    const colRef = collection(db, `tenants/${tenantId}/activity_logs`);
    const docRef = await addDoc(colRef, payload);
    return docRef.id;
  } catch (err) {
    console.warn("Falha ao registrar log de atividade (modo offline/permissão):", err);
    return null;
  }
}
