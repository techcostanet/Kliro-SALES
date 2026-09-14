"use client";

import React, { useEffect, useState } from "react";
import { formatCurrency, formatCurrencyInput } from "@/lib/formatters";

interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: number | string | null | undefined;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  className = "",
  placeholder = "R$ 0,00",
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState<string>(() => {
    if (value === null || value === undefined || value === "") return "";
    return formatCurrency(Number(value) || 0);
  });

  // Sincroniza estado visual quando o valor do formulário pai muda externamente
  useEffect(() => {
    if (value === null || value === undefined || value === "") {
      setDisplayValue("");
      return;
    }
    const num = Number(value) || 0;
    const formatted = formatCurrency(num);
    setDisplayValue((current) => {
      // Evita atualizar se o número resultante for o mesmo para não atrapalhar a digitação
      const currentRes = formatCurrencyInput(current);
      if (currentRes.raw === num && current !== "") return current;
      return formatted;
    });
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    if (!rawInput.trim()) {
      setDisplayValue("");
      onChange(0);
      return;
    }

    const { raw, formatted } = formatCurrencyInput(rawInput);
    setDisplayValue(formatted);
    onChange(raw);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      {...props}
    />
  );
};

export default CurrencyInput;
