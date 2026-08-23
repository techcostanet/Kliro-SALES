import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Função para fechamento de rota (Anti-Fraude)
export const closeRouteExecution = functions.https.onCall(async (data, context) => {
    // 1. Verificar Autenticação
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'O usuário precisa estar logado.');
    }

    const { executionId, routeId } = data;
    const tenantId = context.auth.token.tenantId;

    if (!tenantId) {
        throw new functions.https.HttpsError('permission-denied', 'Usuário não pertence a nenhuma empresa.');
    }

    const db = admin.firestore();
    const executionRef = db.doc(`tenants/${tenantId}/route_executions/${executionId}`);
    
    // Transação para garantir consistência
    await db.runTransaction(async (transaction) => {
        const executionDoc = await transaction.get(executionRef);
        if (!executionDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Execução de rota não encontrada.');
        }

        const executionData = executionDoc.data();
        if (executionData?.status === 'CLOSED') {
            throw new functions.https.HttpsError('failed-precondition', 'Esta rota já foi fechada.');
        }

        // Lógica de auditoria e travamento
        // Aqui podemos varrer todas as transações, somar os totais e gerar um Hash
        const closedAt = admin.firestore.Timestamp.now();
        const auditHash = `HASH-${executionId}-${closedAt.toMillis()}`; // Placeholder para o hash real

        transaction.update(executionRef, {
            status: 'CLOSED',
            closedAt: closedAt,
            auditHash: auditHash
        });
    });

    return { success: true, message: 'Rota fechada com sucesso. Dados bloqueados para edição.' };
});

// Trigger: Consolidação Financeira (Roda sempre que uma nova transação é criada)
export const consolidateFinancials = functions.firestore
    .document('tenants/{tenantId}/transactions/{transactionId}')
    .onCreate(async (snap, context) => {
        const transactionData = snap.data();
        const tenantId = context.params.tenantId;

        const db = admin.firestore();
        const tenantRef = db.doc(`tenants/${tenantId}`);
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const summaryRef = db.doc(`tenants/${tenantId}/financial_summaries/${currentMonth}`);

        await db.runTransaction(async (transaction) => {
            const summaryDoc = await transaction.get(summaryRef);
            let totalRevenue = 0;
            let transactionCount = 0;

            if (summaryDoc.exists) {
                totalRevenue = summaryDoc.data()?.totalRevenue || 0;
                transactionCount = summaryDoc.data()?.transactionCount || 0;
            }

            if (transactionData.type === 'INCOME') {
                totalRevenue += transactionData.amount || 0;
            } else if (transactionData.type === 'EXPENSE') {
                totalRevenue -= transactionData.amount || 0;
            }

            transaction.set(summaryRef, {
                totalRevenue,
                transactionCount: transactionCount + 1,
                lastUpdate: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        });
        
        console.log(`[Consolidation] Atualizado para o tenant ${tenantId}. Total Revenue: ${transactionData.amount}`);
    });
