"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState([
    { id: "1", name: "Produto A", price: 15.50, barcode: "78910001", active: true },
    { id: "2", name: "Produto B", price: 22.00, barcode: "78910002", active: true },
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-brand-offwhite">Produtos</h2>
          <p className="text-brand-offwhite/60 mt-1">Gerencie o catálogo de produtos da sua empresa.</p>
        </div>
        <button className="flex items-center space-x-2 bg-brand-gold text-brand-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-500 transition shadow-lg">
          <Plus size={20} />
          <span>Novo Produto</span>
        </button>
      </div>

      <div className="bg-brand-graphite rounded-xl border border-brand-blue/30 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-brand-blue/30 flex justify-between items-center bg-brand-black/50">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-brand-offwhite/40" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 bg-brand-black border border-brand-blue/50 rounded-lg text-sm text-brand-offwhite placeholder-brand-offwhite/30 focus:outline-none focus:ring-1 focus:ring-brand-gold"
              placeholder="Buscar por nome ou código..."
            />
          </div>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-blue/10 border-b border-brand-blue/30 text-brand-offwhite/70 text-sm">
              <th className="p-4 font-medium">Nome do Produto</th>
              <th className="p-4 font-medium">Código de Barras</th>
              <th className="p-4 font-medium">Preço (R$)</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-blue/10">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-brand-blue/5 transition group">
                <td className="p-4 text-brand-offwhite font-medium">{product.name}</td>
                <td className="p-4 text-brand-offwhite/70">{product.barcode}</td>
                <td className="p-4 text-brand-gold font-bold">R$ {product.price.toFixed(2).replace('.', ',')}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full border border-green-500/20">
                    Ativo
                  </span>
                </td>
                <td className="p-4 text-right space-x-3">
                  <button className="text-brand-offwhite/50 hover:text-brand-gold transition">
                    <Edit2 size={18} />
                  </button>
                  <button className="text-brand-offwhite/50 hover:text-red-400 transition">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
