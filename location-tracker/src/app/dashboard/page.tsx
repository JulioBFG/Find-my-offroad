"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";
import Map from "@/components/Map";
import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => Promise.resolve(Map), {
  ssr: false,
});

export default function DashboardPage() {
  const { user, loading, logOut, joinGroup, createGroup } = useAuth();
  const router = useRouter();
  const [groupId, setGroupId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await joinGroup(groupId);
      setGroupId("");
    } catch (err: Error | unknown) {
      const error = err instanceof Error ? err.message : "Falha ao entrar no grupo";
      setError(error);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await createGroup(groupName);
      setGroupName("");
      setShowCreateGroup(false);
    } catch (err: Error | unknown) {
      const error = err instanceof Error ? err.message : "Falha ao criar grupo";
      setError(error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Rastreador de Localização</h1>

          <div className="flex items-center space-x-4">
            <span>Olá, {user?.displayName || "Usuário"}</span>
            <Button variant="outline" onClick={() => logOut()}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row">
        <div className="w-full md:w-64 p-4 bg-gray-50">
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Seu Grupo</h2>
            {user?.groupId ? (
              <div className="p-3 bg-green-100 text-green-800 rounded">
                ID do Grupo: {user.groupId}
              </div>
            ) : (
              <div className="p-3 bg-yellow-100 text-yellow-800 rounded">
                Você não está em nenhum grupo
              </div>
            )}
          </div>

          {error && <div className="p-3 mb-4 bg-red-100 text-red-600 rounded">{error}</div>}

          {!user?.groupId && (
            <div className="space-y-4">
              <form onSubmit={handleJoinGroup} className="space-y-2">
                <label htmlFor="groupId" className="block text-sm font-medium">
                  Entrar em um grupo
                </label>
                <input
                  id="groupId"
                  type="text"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  placeholder="ID do grupo"
                  className="w-full px-3 py-2 border rounded"
                />
                <Button type="submit" size="sm" className="w-full">
                  Entrar
                </Button>
              </form>

              {showCreateGroup ? (
                <form onSubmit={handleCreateGroup} className="space-y-2">
                  <label htmlFor="groupName" className="block text-sm font-medium">
                    Nome do novo grupo
                  </label>
                  <input
                    id="groupName"
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Nome do grupo"
                    className="w-full px-3 py-2 border rounded"
                  />
                  <div className="flex space-x-2">
                    <Button type="submit" size="sm">
                      Criar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCreateGroup(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <Button
                  onClick={() => setShowCreateGroup(true)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Criar novo grupo
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex-1">
          <DynamicMap />
        </div>
      </main>
    </div>
  );
}