import 'package:flutter/material.dart';

class ModoRuaScreen extends StatefulWidget {
  const ModoRuaScreen({super.key});

  @override
  State<ModoRuaScreen> createState() => _ModoRuaScreenState();
}

class _ModoRuaScreenState extends State<ModoRuaScreen> {
  bool _isRouteOpen = true;
  double _totalSold = 4850.0;
  int _completedVisits = 9;
  final int _totalVisits = 14;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text(
              'LUKE BRASIL • MODO RUA',
              style: TextStyle(fontSize: 12, color: Color(0xFFBB8334), letterSpacing: 1.2),
            ),
            Text(
              'Carlos Eduardo (Vendedor)',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: _isRouteOpen ? Colors.green.withOpacity(0.2) : Colors.amber.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: _isRouteOpen ? Colors.green : const Color(0xFFBB8334),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  _isRouteOpen ? Icons.circle : Icons.lock,
                  size: 10,
                  color: _isRouteOpen ? Colors.green : const Color(0xFFBB8334),
                ),
                const SizedBox(width: 4),
                Text(
                  _isRouteOpen ? 'Ativa' : 'Fechada',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: _isRouteOpen ? Colors.green : const Color(0xFFBB8334),
                  ),
                ),
              ],
            ),
          )
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Resumo da Rota
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            color: const Color(0xFF181A1E),
            child: Padding(
              padding: const EdgeInsets.all(16),
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Total Vendido Hoje', style: TextStyle(color: Colors.white70)),
                    Text(
                      'R\$ ${_totalSold.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFBB8334),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                LinearProgressIndicator(
                  value: _completedVisits / _totalVisits,
                  backgroundColor: Colors.black,
                  valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFBB8334)),
                ),
                const SizedBox(height: 8),
                Text(
                  'Progresso: $_completedVisits de $_totalVisits visitas concluídas',
                  style: const TextStyle(fontSize: 12, color: Colors.white60),
                ),
                const SizedBox(height: 12),
                if (_isRouteOpen)
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFBB8334),
                      foregroundColor: Colors.black,
                      minimumSize: const Size.fromHeight(42),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    onPressed: () {
                      setState(() {
                        _isRouteOpen = false;
                      });
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Rota fechada e bloqueada com sucesso!'),
                          backgroundColor: Colors.green,
                        ),
                      );
                    },
                    icon: const Icon(Icons.lock),
                    label: const Text('Fechar Rota Anti-Fraude', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'CLIENTES DA ROTA',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white70),
          ),
          const SizedBox(height: 8),

          // Lista de Clientes
          _buildClientCard('1', 'Padaria & Confeitaria Estrela', 'Rua das Flores, 142 - Centro', true, 450.0),
          _buildClientCard('2', 'Supermercado Boa Vista', 'Av. Brasil, 1200 - Centro', true, 1280.5),
          _buildClientCard('3', 'Mercearia Central', 'Rua XV de Novembro, 88 - Centro', false, 0.0),
          _buildClientCard('4', 'Panificadora Pão Dourado', 'Rua São Paulo, 305 - Zona Sul', false, 0.0),
        ],
      ),
    );
  }

  Widget _buildClientCard(String order, String name, String address, bool visited, double sale) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      color: const Color(0xFF181A1E),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: visited ? Colors.green.withOpacity(0.2) : const Color(0xFFBB8334).withOpacity(0.2),
          child: visited
              ? const Icon(Icons.check, color: Colors.green, size: 20)
              : Text(order, style: const TextStyle(color: Color(0xFFBB8334), fontWeight: FontWeight.bold)),
        ),
        title: Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text(address, style: const TextStyle(fontSize: 12, color: Colors.white54)),
        trailing: visited
            ? Text(
                'R\$ ${sale.toStringAsFixed(2)}',
                style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 13),
              )
            : const Icon(Icons.chevron_right, color: Colors.white30),
      ),
    );
  }
}
