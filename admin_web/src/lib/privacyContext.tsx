"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface PrivacyContextType {
  hideValues: boolean;
  togglePrivacy: () => void;
  formatValue: (amount: number, prefixOrType?: string) => string;
}

const PrivacyContext = createContext<PrivacyContextType>({
  hideValues: true,
  togglePrivacy: () => {},
  formatValue: () => "R$ ••••••",
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

  const formatValue = (amount: number, prefixOrType: string = "R$ ") => {
    let actualPrefix = "R$ ";
    if (prefixOrType === "currency" || !prefixOrType) {
      actualPrefix = "R$ ";
    } else if (prefixOrType === "number") {
      actualPrefix = "";
    } else {
      actualPrefix = prefixOrType;
    }

    if (hideValues) {
      return `${actualPrefix}••••••`.trim();
    }

    const num = isNaN(amount) ? 0 : amount;
    const isNegative = num < 0;
    const formattedNumber = Math.abs(num).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    if (isNegative) {
      return `-${actualPrefix}${formattedNumber}`;
    }

    return `${actualPrefix}${formattedNumber}`;
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
