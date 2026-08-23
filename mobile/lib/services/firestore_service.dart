import 'package:cloud_firestore/cloud_firestore.dart';

class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  final String tenantId;

  FirestoreService({required this.tenantId});

  // Obter clientes da rota
  Stream<QuerySnapshot> getRouteClients(String routeId) {
    return _db
        .collection('tenants')
        .doc(tenantId)
        .collection('clients')
        .snapshots();
  }

  // Registrar uma venda realizada no Modo Rua
  Future<void> recordSale({
    required String executionId,
    required String clientId,
    required double amount,
    required String paymentMethod,
    required Map<String, dynamic> items,
  }) async {
    await _db
        .collection('tenants')
        .doc(tenantId)
        .collection('transactions')
        .add({
      'executionId': executionId,
      'clientId': clientId,
      'type': 'SALE',
      'paymentMethod': paymentMethod,
      'amount': amount,
      'items': items,
      'timestamp': FieldValue.serverTimestamp(),
    });
  }

  // Fechamento de rota anti-fraude
  Future<void> closeRouteExecution({
    required String executionId,
    required String auditHash,
  }) async {
    await _db
        .collection('tenants')
        .doc(tenantId)
        .collection('route_executions')
        .doc(executionId)
        .update({
      'status': 'CLOSED',
      'closedAt': FieldValue.serverTimestamp(),
      'auditHash': auditHash,
    });
  }
}
