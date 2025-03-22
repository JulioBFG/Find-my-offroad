import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Location Tracker</h1>

          <div className="space-x-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-black text-white">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="max-w-3xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Track your group&apos;s location in real-time</h2>
          <p className="text-lg mb-8">
            Our app allows groups of people to track each other&apos;s location in real-time. Perfect for trips, events, and more.
          </p>

          <div className="flex justify-center space-x-4">
            <Link href="/signup">
              <Button size="lg" className="bg-black text-white">Get Started</Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-white p-4 text-center text-gray-600">
        <p>&copy; {new Date().getFullYear()} Location Tracker</p>
      </footer>
    </div>
  );
}