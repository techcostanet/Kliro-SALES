"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LukeOverviewPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/luke/produtos");
  }, [router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-10 h-10 rounded-full border-2 border-brand-gold border-t-transparent animate-spin" />
      <p className="text-sm font-semibold text-brand-offwhite/80">
        Carregando Cadastro de Produtos...
      </p>
    </div>
  );
}
