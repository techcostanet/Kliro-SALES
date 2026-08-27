import React from "react";
import { getVendorColor } from "@/lib/vendorColors";

interface VendorBadgeProps {
  vendorName: string;
  color?: string;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "solid" | "subtle" | "pill" | "chip";
  showDot?: boolean;
  showAvatar?: boolean;
  className?: string;
}

export default function VendorBadge({
  vendorName,
  color,
  size = "sm",
  variant = "subtle",
  showDot = true,
  showAvatar = false,
  className = "",
}: VendorBadgeProps) {
  const vendorColor = getVendorColor(vendorName, color);
  const initial = vendorName ? vendorName.charAt(0).toUpperCase() : "V";

  const sizeClasses = {
    xs: "text-[10px] px-1.5 py-0.5 font-medium gap-1",
    sm: "text-xs px-2 py-0.5 font-semibold gap-1.5",
    md: "text-xs px-2.5 py-1 font-bold gap-1.5",
    lg: "text-sm px-3 py-1.5 font-bold gap-2",
  }[size];

  if (variant === "solid") {
    return (
      <span
        style={{ backgroundColor: vendorColor }}
        className={`inline-flex items-center rounded-lg text-white shadow-xs font-semibold ${sizeClasses} ${className}`}
      >
        {showAvatar && (
          <span className="w-3.5 h-3.5 rounded-full bg-white/25 flex items-center justify-center text-[9px] font-black">
            {initial}
          </span>
        )}
        {showDot && !showAvatar && (
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        )}
        <span>{vendorName}</span>
      </span>
    );
  }

  if (variant === "chip") {
    return (
      <span
        style={{
          backgroundColor: `${vendorColor}18`,
          borderColor: `${vendorColor}45`,
          color: vendorColor,
        }}
        className={`inline-flex items-center rounded-md border font-bold shadow-2xs tracking-tight ${sizeClasses} ${className}`}
      >
        <span
          style={{ backgroundColor: vendorColor }}
          className="w-2 h-2 rounded-full ring-2 ring-white shrink-0"
        />
        <span>{vendorName}</span>
      </span>
    );
  }

  // Default "subtle" / "pill"
  return (
    <span
      style={{
        backgroundColor: `${vendorColor}15`,
        borderColor: `${vendorColor}35`,
        color: vendorColor,
      }}
      className={`inline-flex items-center rounded-full border font-semibold ${sizeClasses} ${className}`}
    >
      {showAvatar && (
        <span
          style={{ backgroundColor: vendorColor }}
          className="w-3.5 h-3.5 rounded-full text-white flex items-center justify-center text-[9px] font-black"
        >
          {initial}
        </span>
      )}
      {showDot && !showAvatar && (
        <span
          style={{ backgroundColor: vendorColor }}
          className="w-1.5 h-1.5 rounded-full shrink-0"
        />
      )}
      <span>{vendorName}</span>
    </span>
  );
}
