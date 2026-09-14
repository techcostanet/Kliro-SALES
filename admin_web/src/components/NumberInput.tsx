"use client";

import React, { useEffect, useState } from "react";

interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: number | string | null | undefined;
  onChange: (value: number) => void;
  allowDecimals?: boolean;
  min?: number;
  max?: number;
  className?: string;
  placeholder?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  allowDecimals = false,
  min,
  max,
  className = "",
  placeholder = "0",
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState<string>(() => {
    if (value === null || value === undefined || value === "") return "";
    return String(value);
  });

  // Sincroniza quando o valor externo muda
  useEffect(() => {
    if (value === null || value === undefined || value === "") {
      setDisplayValue("");
      return;
    }
    const num = Number(value);
    // Não substitui se o valor digitado atualmente representar o mesmo número
    setDisplayValue((current) => {
      const parsedCurrent = parseFloat(current.replace(",", "."));
      if (!isNaN(parsedCurrent) && parsedCurrent === num && (current.endsWith(".") || current.endsWith(","))) {
        return current;
      }
      if (parsedCurrent === num && current !== "") {
        return current;
      }
      return String(value);
    });
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;

    if (!rawInput.trim()) {
      setDisplayValue("");
      onChange(min !== undefined ? min : 0);
      return;
    }

    if (allowDecimals) {
      // Permite dígitos e apenas um separador decimal (. ou ,)
      const sanitized = rawInput.replace(/[^0-9.,]/g, "");
      // Permite apenas o primeiro ponto ou vírgula
      const parts = sanitized.split(/[.,]/);
      let formatted = parts[0];
      if (parts.length > 1) {
        formatted += "." + parts.slice(1).join("");
      }

      setDisplayValue(formatted);

      const parsed = parseFloat(formatted);
      if (!isNaN(parsed)) {
        let finalVal = parsed;
        if (min !== undefined && finalVal < min) finalVal = min;
        if (max !== undefined && finalVal > max) finalVal = max;
        onChange(finalVal);
      }
    } else {
      // Apenas números inteiros
      const sanitized = rawInput.replace(/\D/g, "");
      setDisplayValue(sanitized);

      const parsed = parseInt(sanitized, 10);
      if (!isNaN(parsed)) {
        let finalVal = parsed;
        if (min !== undefined && finalVal < min) finalVal = min;
        if (max !== undefined && finalVal > max) finalVal = max;
        onChange(finalVal);
      } else {
        onChange(min !== undefined ? min : 0);
      }
    }
  };

  return (
    <input
      type="text"
      inputMode={allowDecimals ? "decimal" : "numeric"}
      value={displayValue}
      onChange={handleChange}
      onWheel={(e) => e.currentTarget.blur()}
      placeholder={placeholder}
      className={className}
      {...props}
    />
  );
};

export default NumberInput;
