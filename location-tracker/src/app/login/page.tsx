// src/app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [redirectTo, setRedirectTo] = useState("/dashboard");
  const [isClient, setIsClient] = useState(false);
  const { signIn, user } = useAuth();
  const router = useRouter();
  const [redirected, setRedirected] = useState(false);

  // Extrair o parâmetro redirectTo da URL
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

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (user && isClient && !redirected) {
      setRedirected(true);
      router.push(redirectTo);
    }
  }, [user, router, redirectTo, isClient, redirected]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await signIn(email, password);
      router.push(redirectTo);
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : "Falha ao fazer login";
      setError(error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-4 md:p-8 space-y-6 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold">Login</h1>
          <p className="text-gray-600 text-sm md:text-base">Acesse sua conta para rastrear sua localização</p>
        </div>

        {error && <div className="p-3 bg-red-100 text-red-600 rounded text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>

          <div>
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm">
            Não tem uma conta?{" "}
            {isClient && (
              <Link
                href={`/signup?redirectTo=${encodeURIComponent(redirectTo)}`}
                className="text-blue-600 hover:underline"
              >
                Registre-se
              </Link>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}