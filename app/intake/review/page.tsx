"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getOrCreateCurrentSession, updateSession } from "@/lib/storage/sessionStore";
import { roleSurveyToCopyText, productSurveyToCopyText } from "@/lib/surveys/copyAsText";
import { buildAnalyzePrompt } from "@/lib/openai/analyze";
import { Button } from "@/components/ui/Button";
import { CopyAsText } from "@/components/CopyAsText";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function ReviewPage() {
  const router = useRouter();
  const [session, setSession] = useState<ReturnType<typeof getOrCreateCurrentSession> | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSession(getOrCreateCurrentSession());
  }, []);

  const handleGenerate = async () => {
    if (!session?.id) return;
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          roleSurvey: session.roleSurvey,
          productSurvey: session.productSurvey,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? `HTTP ${res.status}`);
        setGenerating(false);
        return;
      }
      updateSession(session.id, { analysis: data });
      router.push(`/results/${session.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setGenerating(false);
    }
  };

  if (!session) return <div className="p-4">Laden…</div>;

  const roleText = roleSurveyToCopyText(session.roleSurvey);
  const productText = productSurveyToCopyText(session.productSurvey);
  const debugPayload = {
    sessionId: session.id,
    roleSurvey: session.roleSurvey,
    productSurvey: session.productSurvey,
  };
  const promptPreview = buildAnalyzePrompt(session.roleSurvey, session.productSurvey);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Überblick & Generierung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Prüfen Sie die erfassten Daten. Sie können die Checklisten als Text kopieren oder die Analyse starten.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-slate-800">Rolle (Punkt 1)</span>
                <CopyAsText getText={() => roleText} />
              </div>
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words text-xs text-slate-700">
                {roleText.slice(0, 800)}
                {roleText.length > 800 ? "…" : ""}
              </pre>
            </div>
            <div className="rounded border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-slate-800">Produkt (Punkt 2)</span>
                <CopyAsText getText={() => productText} />
              </div>
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words text-xs text-slate-700">
                {productText.slice(0, 800)}
                {productText.length > 800 ? "…" : ""}
              </pre>
            </div>
          </div>

          <details className="rounded border border-slate-200 bg-slate-50">
            <summary className="cursor-pointer px-4 py-2 text-sm font-medium text-slate-700">
              Debug: Payload an /api/analyze
            </summary>
            <pre className="max-h-64 overflow-auto p-4 text-xs text-slate-600">
              {JSON.stringify(debugPayload, null, 2)}
            </pre>
          </details>

          <details className="rounded border border-slate-200 bg-slate-50">
            <summary className="cursor-pointer px-4 py-2 text-sm font-medium text-slate-700">
              Debug: Prompt-Vorschau (Auszug)
            </summary>
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words p-4 text-xs text-slate-600">
              {promptPreview.slice(0, 2000)}
              {promptPreview.length > 2000 ? "\n…" : ""}
            </pre>
          </details>

          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="flex justify-between border-t border-slate-200 pt-6">
            <Link href="/intake/product">
              <Button type="button" variant="ghost">Zurück</Button>
            </Link>
            <Button
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? "Generiere…" : "Ergebnisse generieren"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
