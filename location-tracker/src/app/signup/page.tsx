// src/app/signup/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [redirectTo, setRedirectTo] = useState("/dashboard");
  const [isClient, setIsClient] = useState(false);
  const { signUp, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectParam = urlParams.get("redirectTo");
      if (redirectParam) {
        setRedirectTo(redirectParam);
      }
    }
  }, []);

  useEffect(() => {
    if (user && isClient) {
      router.push(redirectTo);
    }
  }, [user, router, redirectTo, isClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await signUp(email, password, name);
      router.push(redirectTo);
    } catch (err: unknown) {
      const error = err instanceof Error ? "Falha ao criar conta" : "Falha ao criar conta";
      setError(error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Criar Conta</h1>
          <p className="text-gray-600">Registre-se para começar a usar o sistema</p>
        </div>

        {error && <div className="p-3 bg-red-100 text-red-600 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nome
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <Button type="submit" className="w-full">
              Registrar
            </Button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p>
            Já tem uma conta?{" "}
            {isClient && (
              <Link
                href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}
                className="text-blue-600 hover:underline"
              >
                Faça login
              </Link>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}