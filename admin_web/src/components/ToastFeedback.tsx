"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export interface ToastMessage {
  id?: string;
  type: "success" | "error" | "info";
  title: string;
  message?: string;
}

interface ToastFeedbackProps {
  toast: ToastMessage | null;
  onClose: () => void;
  duration?: number;
}

export default function ToastFeedback({ toast, onClose, duration = 3500 }: ToastFeedbackProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, duration, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 max-w-sm">
      <div
        className={`flex items-start space-x-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md ${
          isSuccess
            ? "bg-brand-black/95 border-brand-gold/60 text-brand-offwhite"
            : isError
            ? "bg-brand-black/95 border-red-500/60 text-brand-offwhite"
            : "bg-brand-black/95 border-brand-blue/60 text-brand-offwhite"
        }`}
      >
        <div className="shrink-0 pt-0.5">
          {isSuccess && <CheckCircle2 size={20} className="text-brand-gold animate-pulse" />}
          {isError && <AlertCircle size={20} className="text-red-400" />}
          {!isSuccess && !isError && <Info size={20} className="text-brand-blue" />}
        </div>

        <div className="flex-1 pr-2">
          <h4 className="text-sm font-extrabold tracking-tight text-brand-offwhite">
            {toast.title}
          </h4>
          {toast.message && (
            <p className="text-xs text-brand-offwhite/70 mt-0.5 leading-relaxed">
              {toast.message}
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="text-brand-offwhite/40 hover:text-brand-offwhite transition p-0.5"
          title="Fechar"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
