"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, writeBatch } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import initialProducts from "@/lib/products_catalog.json";

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSeed = async () => {
    setLoading(true);
    setMessage("Criando usuário e configurando Firestore...");

    try {
      // 1. Criar ou Logar o usuário no Firebase Auth
      let user;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, "admin@luke.com", "admin123");
        user = userCredential.user;
      } catch (authError: any) {
        if (authError.code === "auth/email-already-in-use") {
          const userCredential = await signInWithEmailAndPassword(auth, "admin@luke.com", "admin123");
          user = userCredential.user;
        } else {
          throw authError;
        }
      }

      // 2. Criar a Empresa (Tenant) LUKE no Firestore
      const tenantId = "tenant_luke_001";
      await setDoc(doc(db, "tenants", tenantId), {
        name: "LUKE Brasil",
        cnpj: "00.000.000/0001-00",
        active: true,
        createdAt: new Date(),
      });

      // 3. Cadastrar o usuário dentro do Tenant como ADMIN
      await setDoc(doc(db, `tenants/${tenantId}/users`, user.uid), {
        name: "Administrador LUKE",
        email: "admin@luke.com",
        role: "ADMIN",
        active: true,
        createdAt: new Date(),
      });

      // 4. Cadastrar os vendedores (Alisson, Alexandre, Lucas)
      const vendors = [
        { id: "usr_alisson", name: "Alisson", email: "alisson@luke.com", role: "VENDOR", active: true },
        { id: "usr_alexandre", name: "Alexandre", email: "alexandre@luke.com", role: "VENDOR", active: true },
        { id: "usr_lucas", name: "Lucas", email: "lucas@luke.com", role: "ADMIN_VENDOR", active: true },
      ];

      for (const v of vendors) {
        await setDoc(doc(db, `tenants/${tenantId}/users`, v.id), {
          ...v,
          createdAt: new Date(),
        });
      }

      // 5. Cadastrar todos os 46 Produtos extraídos do Backup de Carregamento
      setMessage(`Gravando ${initialProducts.length} produtos no catálogo Firestore...`);
      const batch = writeBatch(db);
      for (const prod of initialProducts) {
        const prodRef = doc(db, `tenants/${tenantId}/products`, prod.id);
        batch.set(prodRef, {
          ...prod,
          updatedAt: new Date(),
        });
      }
      await batch.commit();

      // 6. Roteamento de usuário global
      await setDoc(doc(db, "user_mappings", user.uid), {
        tenantId: tenantId,
      });

      setMessage(`✅ Sucesso! Setup concluído com ${initialProducts.length} produtos, equipe comercial e estrutura pronta.`);

      // Redireciona para o login após 2 segundos
      setTimeout(() => {
        router.push("/luke/produtos");
      }, 2000);

    } catch (error: any) {
      setMessage(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-black p-4 text-brand-offwhite">
      <div className="bg-brand-graphite p-8 rounded-xl border border-brand-blue/30 text-center max-w-md">
        <h1 className="text-2xl font-bold text-brand-gold mb-4">Setup & Carga Inicial</h1>
        <p className="mb-6 text-brand-offwhite/70 text-sm">
          Este botão criará a empresa LUKE Brasil, os usuários operacionais e importará os <strong>{initialProducts.length} produtos oficiais</strong> (extraídos da planilha de carregamento) diretamente no Firestore.
        </p>

        <button
          onClick={handleSeed}
          disabled={loading}
          className="bg-brand-gold text-brand-black px-6 py-3 rounded-lg font-bold w-full hover:bg-yellow-500 disabled:opacity-50 transition"
        >
          {loading ? "Processando e Gravando..." : `Importar ${initialProducts.length} Produtos & Setup`}
        </button>

        {message && (
          <div className="mt-6 p-4 rounded-lg bg-brand-black border border-brand-blue/30 text-sm text-left break-words">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
