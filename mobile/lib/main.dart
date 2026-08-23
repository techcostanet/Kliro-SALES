import 'package:flutter/material.dart';
import 'screens/modo_rua_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Firebase.initializeApp() será chamado quando a configuração nativa for injetada
  runApp(const KliroSalesMobileApp());
}

class KliroSalesMobileApp extends StatelessWidget {
  const KliroSalesMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Kliro-SALES Modo Rua',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF12110F), // Preto da marca LUKE
        primaryColor: const Color(0xFFBB8334), // Dourado da marca LUKE
        cardColor: const Color(0xFF181A1E), // Grafite
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFBB8334),
          secondary: Color(0xFF1B2535),
          surface: Color(0xFF181A1E),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF181A1E),
          elevation: 0,
          titleTextStyle: TextStyle(
            color: Color(0xFFF0EADD),
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      home: const ModoRuaScreen(),
    );
  }
}
