// src/app/join/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function JoinGroupPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading, joinGroup } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [groupId, setGroupId] = useState("");

  useEffect(() => {
    const groupParam = searchParams.get("group");
    if (groupParam) {
      setGroupId(groupParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirectTo=/join?group=${groupId}`);
    }
  }, [user, loading, router, groupId]);

  const handleJoinGroup = async () => {
    if (!groupId) return;

    try {
      await joinGroup(groupId);
      setSuccess(true);
      // Redirecionar para o dashboard após um breve momento
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : "Falha ao entrar no grupo";
      setError(error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  if (!user) {
    return null; // Redirecionando para login
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Entrar no Grupo</h1>
          <p className="text-gray-600 mt-2">
            Você foi convidado para participar de um grupo de rastreamento
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-600 rounded">{error}</div>
        )}

        {success && (
          <div className="p-3 bg-green-100 text-green-600 rounded">
            Você entrou no grupo com sucesso! Redirecionando...
          </div>
        )}

        {!success && (
          <div className="space-y-6">
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="font-medium">ID do Grupo:</p>
              <p className="text-blue-600 break-all">{groupId}</p>
            </div>

            <div className="flex flex-col space-y-4">
              <Button onClick={handleJoinGroup} className="w-full">
                Entrar no Grupo
              </Button>

              <Link href="/dashboard">
                <Button variant="outline" className="w-full">
                  Cancelar
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}