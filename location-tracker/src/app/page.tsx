import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Rastreador de Localização</h1>

          <div className="space-x-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Registrar</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="max-w-3xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Acompanhe seu grupo em tempo real</h2>
          <p className="text-lg mb-8">
            Nosso aplicativo permite que grupos de pessoas acompanhem a localização
            uns dos outros em tempo real. Perfeito para viagens, eventos e muito mais.
          </p>

          <div className="flex justify-center space-x-4">
            <Link href="/signup">
              <Button size="lg">Começar Agora</Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-white p-4 text-center text-gray-600">
        <p>&copy; {new Date().getFullYear()} Rastreador de Localização</p>
      </footer>
    </div>
  );
}