"use client";

import React, { useState, useEffect, useRef } from "react";
import { SlidersHorizontal, Check, RotateCcw, X, Eye } from "lucide-react";

export interface ColumnDefinition {
  key: string;
  label: string;
  defaultVisible?: boolean;
  alwaysVisible?: boolean; // ex: Ações
}

interface ColumnOrganizerProps {
  storageKey: string;
  columns: ColumnDefinition[];
  visibleColumns: string[];
  onChange: (visibleKeys: string[]) => void;
}

export default function ColumnOrganizer({
  storageKey,
  columns,
  visibleColumns,
  onChange,
}: ColumnOrganizerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleColumn = (key: string) => {
    const col = columns.find((c) => c.key === key);
    if (col?.alwaysVisible) return;

    let updated: string[];
    if (visibleColumns.includes(key)) {
      // Impede de desmarcar todas
      if (visibleColumns.length <= 1) return;
      updated = visibleColumns.filter((k) => k !== key);
    } else {
      updated = [...visibleColumns, key];
    }
    onChange(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (e) {}
  };

  const handleReset = () => {
    const defaultKeys = columns
      .filter((c) => c.defaultVisible !== false)
      .map((c) => c.key);
    onChange(defaultKeys);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {}
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-3 py-2 bg-brand-graphite border border-brand-blue/40 text-brand-offwhite/80 hover:text-brand-offwhite hover:border-brand-gold/60 rounded-xl text-xs font-bold transition shadow-sm"
        title="Personalizar Colunas da Tabela"
      >
        <SlidersHorizontal size={14} className="text-brand-gold" />
        <span>Colunas</span>
        <span className="bg-brand-blue/30 text-brand-gold text-[10px] px-1.5 py-0.2 rounded-full font-mono">
          {visibleColumns.length}/{columns.length}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-brand-black/95 border border-brand-blue/40 rounded-xl shadow-2xl p-3 z-40 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-brand-blue/30">
            <div className="flex items-center space-x-1.5 text-xs font-black text-brand-offwhite">
              <Eye size={13} className="text-brand-gold" />
              <span>Personalizar Colunas</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-brand-offwhite/40 hover:text-brand-offwhite"
            >
              <X size={14} />
            </button>
          </div>

          <p className="text-[10px] text-brand-offwhite/50 mb-2 leading-relaxed">
            Selecione as colunas que deseja exibir. As preferências são salvas automaticamente.
          </p>

          <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar pr-1">
            {columns.map((col) => {
              const isChecked = visibleColumns.includes(col.key);
              const isDisabled = col.alwaysVisible;

              return (
                <label
                  key={col.key}
                  className={`flex items-center space-x-2.5 p-1.5 rounded-lg text-xs cursor-pointer transition ${
                    isChecked
                      ? "bg-brand-blue/15 text-brand-offwhite font-medium"
                      : "text-brand-offwhite/50 hover:bg-brand-blue/5 hover:text-brand-offwhite/80"
                  } ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isDisabled}
                    onChange={() => toggleColumn(col.key)}
                    className="rounded border-brand-blue/40 text-brand-gold focus:ring-0 focus:ring-offset-0 bg-brand-graphite"
                  />
                  <span className="flex-1 truncate">{col.label}</span>
                  {isDisabled && (
                    <span className="text-[9px] uppercase font-mono text-brand-offwhite/40">
                      Fixa
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          <div className="pt-2.5 mt-2 border-t border-brand-blue/30 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center space-x-1 text-[11px] text-brand-offwhite/60 hover:text-brand-gold transition"
            >
              <RotateCcw size={11} />
              <span>Restaurar Padrão</span>
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2.5 py-1 bg-brand-gold text-brand-black text-[11px] font-extrabold rounded-md hover:bg-yellow-500 transition shadow-sm"
            >
              Pronto
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
