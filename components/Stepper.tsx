"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";

const STEPS = [
  { path: "/intake/role", label: "Rolle" },
  { path: "/intake/product", label: "Produkt" },
  { path: "/intake/review", label: "Überblick" },
  { path: "/results", label: "Ergebnis" },
];

export function Stepper() {
  const pathname = usePathname();
  const currentIndex = STEPS.findIndex((s) => pathname === s.path || pathname.startsWith(s.path + "/"));

  return (
    <nav className="flex items-center justify-center gap-2 py-4" aria-label="Fortschritt">
      {STEPS.map((step, i) => {
        const isActive = i === currentIndex;
        const isPast = currentIndex > i;
        const href = step.path === "/results" ? "#" : step.path;
        const content = (
          <>
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium ${
                isPast
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : isActive
                    ? "border-emerald-600 bg-white text-emerald-700"
                    : "border-slate-200 bg-white text-slate-400"
              }`}
            >
              {isPast ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={isActive ? "font-medium text-slate-900" : "text-slate-500"}>{step.label}</span>
          </>
        );
        return (
          <div key={step.path} className="flex items-center gap-2">
            {step.path !== "/results" ? (
              <Link
                href={href}
                className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-slate-50"
              >
                {content}
              </Link>
            ) : (
              <span className="flex items-center gap-2">{content}</span>
            )}
            {i < STEPS.length - 1 && (
              <div className="h-0.5 w-6 bg-slate-200" aria-hidden />
            )}
          </div>
        );
      })}
    </nav>
  );
}
