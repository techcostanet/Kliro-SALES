"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface PrivacyContextType {
  hideValues: boolean;
  togglePrivacy: () => void;
  formatValue: (amount: number, prefix?: string) => string;
}

const PrivacyContext = createContext<PrivacyContextType>({
  hideValues: true,
  togglePrivacy: () => {},
  formatValue: () => "••••••",
});

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  // Padrão: Valores ocultos (true) conforme requisito do usuário
  const [hideValues, setHideValues] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("kliro_privacy_mode");
    if (saved !== null) {
      setHideValues(saved === "true");
    }
  }, []);

  const togglePrivacy = () => {
    setHideValues((prev) => {
      const next = !prev;
      localStorage.setItem("kliro_privacy_mode", String(next));
      return next;
    });
  };

  const formatValue = (amount: number, prefix: string = "R$ ") => {
    if (hideValues) {
      return `${prefix}••••••`;
    }
    return `${prefix}${amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <PrivacyContext.Provider value={{ hideValues, togglePrivacy, formatValue }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  return useContext(PrivacyContext);
}
