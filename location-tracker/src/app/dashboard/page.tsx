"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import Map from "@/components/Map";
import { Menu, X, Users, UserPlus, LogOut } from "lucide-react";
import dynamic from "next/dynamic";

export default function DashboardPage() {
  const { user, loading, logOut, joinGroup, createGroup } = useAuth();
  const router = useRouter();
  const [groupId, setGroupId] = useState("");
  const [groupName, setGroupName] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [redirectedForAuth, setRedirectedForAuth] = useState(false);

  const DynamicMap = dynamic(() => Promise.resolve(Map), {
    ssr: false,
  });

  useEffect(() => {
    // Só redirecionar uma vez se o usuário não estiver autenticado
    // E apenas quando o loading terminar e tivermos certeza que não há usuário
    if (!loading && !user && !redirectedForAuth) {
      setRedirectedForAuth(true);
      router.push("/login");
    }
  }, [user, loading, router, redirectedForAuth]);

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await joinGroup(groupId);
      setGroupId("");
      setSidebarOpen(false);
    } catch (err: unknown) {
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
      setSidebarOpen(false);
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : "Falha ao criar grupo";
      setError(error);
    }
  };

  const handleLogOut = async () => {
    await logOut();
    router.push("/");
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  if (!user) {
    return null; // Redirecionando para login
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header móvel fixo */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white shadow-sm p-2 flex justify-between items-center">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <h1 className="text-sm font-medium md:text-lg">
          <span className="hidden md:inline">Rastreador de Localização</span>
          <span className="md:hidden">Rastreador</span>
        </h1>

        <span className="w-8"></span> {/* Espaçador para manter centralizado */}
      </header>

      {/* Sidebar móvel deslizante */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } pt-14 md:pt-0 md:translate-x-0 md:static md:block md:shadow-none md:w-64 md:z-10`}
      >
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold mr-3">
              {user?.displayName?.[0].toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-medium">{user?.displayName || "Usuário"}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* Controle de rastreamento - visível apenas em desktop */}
          <div className="mb-6 pb-4 border-b border-gray-200 hidden md:block">
            <Button
              variant={isTracking ? "destructive" : "default"}
              onClick={() => setIsTracking(!isTracking)}
              className="w-full mb-3"
              size="lg"
            >
              {isTracking ? "Parar Rastreamento" : "Iniciar Rastreamento"}
            </Button>
          </div>

          <div className="mb-6">
            <div className="flex items-center mb-2">
              <Users className="mr-2" size={18} />
              <h2 className="text-lg font-medium">Seu Grupo</h2>
            </div>

            {user?.groupId ? (
              <div className="p-3 bg-green-100 text-green-800 rounded mb-3">
                <p className="text-sm font-medium">
                  <span className="hidden md:inline">ID do Grupo:</span>
                  <span className="md:hidden">Grupo:</span>
                </p>
                <p className="text-xs break-all md:block hidden">{user.groupId}</p>
                <p className="text-xs md:hidden">
                  Ativo <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-1"></span>
                </p>
              </div>
            ) : (
              <div className="p-3 bg-yellow-100 text-yellow-800 rounded mb-3">
                <p className="text-sm">Sem grupo</p>
              </div>
            )}
          </div>

          {error && <div className="p-3 mb-4 bg-red-100 text-red-600 rounded text-sm">{error}</div>}

          {!user?.groupId && (
            <div className="space-y-4 mb-6 flex-1">
              <form onSubmit={handleJoinGroup} className="space-y-2">
                <label htmlFor="groupId" className="block text-sm font-medium flex items-center">
                  <UserPlus className="mr-2" size={16} />
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

          <div className="mt-auto pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleLogOut}
              className="w-full flex items-center justify-center"
            >
              <LogOut size={16} className="mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Fundo escurecido quando o menu está aberto (apenas em mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity duration-200 ease-in-out"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Conteúdo principal com o mapa */}
      <main className="flex-1 flex mt-12 md:mt-0">
        <div className="flex-1">
          <DynamicMap />
        </div>
      </main>
    </div>
  );
}