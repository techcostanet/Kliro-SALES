"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

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
        if (authError.code === 'auth/email-already-in-use') {
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
        createdAt: new Date()
      });

      // 3. Cadastrar o usuário dentro do Tenant como ADMIN
      await setDoc(doc(db, `tenants/${tenantId}/users`, user.uid), {
        name: "Administrador LUKE",
        email: "admin@luke.com",
        role: "ADMIN",
        active: true,
        createdAt: new Date()
      });

      // 4. (Opcional) Criar a coleção global de roteamento de usuários para regras de segurança
      await setDoc(doc(db, "user_mappings", user.uid), {
        tenantId: tenantId
      });

      setMessage("✅ Sucesso! Usuário admin@luke.com criado e banco estruturado.");
      
      // Redireciona para o login após 2 segundos
      setTimeout(() => {
        router.push("/");
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
        <h1 className="text-2xl font-bold text-brand-gold mb-4">Configuração Inicial (Seed)</h1>
        <p className="mb-6 text-brand-offwhite/70">
          Este botão criará automaticamente a empresa LUKE e o usuário <strong>admin@luke.com</strong> (senha: <strong>admin123</strong>) no seu Firebase.
        </p>
        
        <button 
          onClick={handleSeed}
          disabled={loading}
          className="bg-brand-gold text-brand-black px-6 py-3 rounded-lg font-bold w-full hover:bg-yellow-500 disabled:opacity-50 transition"
        >
          {loading ? "Processando..." : "Executar Setup Inicial"}
        </button>

        {message && (
          <div className="mt-6 p-4 rounded-lg bg-brand-black border border-brand-blue/30 text-sm">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
