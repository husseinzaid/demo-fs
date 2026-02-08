import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-xl text-center space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          CE Compliance & Marktzugang
        </h1>
        <p className="text-slate-600">
          Technische Bewertung für Produktmarktzugang und Konformität. Starten Sie mit der Rollen- und Produkterfassung.
        </p>
        <Link href="/intake/role">
          <Button size="lg">Assessment starten</Button>
        </Link>
      </div>
    </main>
  );
}
