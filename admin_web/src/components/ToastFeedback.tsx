"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, Info, X, Cloud, CloudOff } from "lucide-react";

export interface ToastMessage {
  id?: string;
  type: "success" | "error" | "info" | "cloud_success" | "cloud_error";
  title: string;
  message?: string;
  isCloud?: boolean;
}

interface ToastFeedbackProps {
  toast: ToastMessage | null;
  onClose: () => void;
  duration?: number;
}

export default function ToastFeedback({ toast, onClose, duration = 10000 }: ToastFeedbackProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, duration, onClose]);

  if (!toast || !mounted) return null;

  const isSuccess = toast.type === "success" || toast.type === "cloud_success";
  const isError = toast.type === "error" || toast.type === "cloud_error";
  const isCloud = toast.isCloud ?? (toast.type === "cloud_success" || toast.type === "cloud_error" || isSuccess || toast.title.toLowerCase().includes("nuvem") || toast.title.toLowerCase().includes("salvo"));

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[999999] animate-in fade-in slide-in-from-bottom-5 duration-300 max-w-md w-full px-4 sm:px-0 pointer-events-auto">
      <div
        className={`flex items-start space-x-3.5 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all ${
          isSuccess
            ? "bg-brand-black/95 border-emerald-500/50 shadow-emerald-950/40 text-brand-offwhite"
            : isError
            ? "bg-brand-black/95 border-red-500/60 shadow-red-950/40 text-brand-offwhite"
            : "bg-brand-black/95 border-brand-gold/60 text-brand-offwhite"
        }`}
      >
        <div className="shrink-0 pt-0.5">
          {isSuccess && (
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <CheckCircle2 size={20} className="animate-pulse" />
            </div>
          )}
          {isError && (
            <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-inner">
              <AlertCircle size={20} />
            </div>
          )}
          {!isSuccess && !isError && (
            <div className="w-9 h-9 rounded-xl bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-brand-gold shadow-inner">
              <Info size={20} />
            </div>
          )}
        </div>

        <div className="flex-1 pr-1 min-w-0">
          {isCloud && (
            <div
              className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider mb-1.5 border ${
                isSuccess
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  : isError
                  ? "bg-red-500/15 text-red-300 border-red-500/30"
                  : "bg-brand-gold/15 text-brand-gold border-brand-gold/30"
              }`}
            >
              {isError ? (
                <>
                  <CloudOff size={11} />
                  <span>Erro de Conexão com a Nuvem</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <Cloud size={11} />
                  <span>Nuvem Firestore Sincronizada</span>
                </>
              )}
            </div>
          )}

          <h4 className="text-sm font-extrabold tracking-tight text-brand-offwhite leading-snug">
            {toast.title}
          </h4>
          {toast.message && (
            <p className="text-xs text-brand-offwhite/80 mt-1 leading-relaxed break-words">
              {toast.message}
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="text-brand-offwhite/40 hover:text-brand-offwhite transition p-1 rounded-lg hover:bg-white/5 shrink-0"
          title="Fechar"
        >
          <X size={16} />
        </button>
      </div>
    </div>,
    document.body
  );
}
