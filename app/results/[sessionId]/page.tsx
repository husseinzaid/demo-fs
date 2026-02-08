"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import Link from "next/link";
import { getSession, getChecklistState, updateChecklistItem } from "@/lib/storage/sessionStore";
import { roleSurveyToCopyText, productSurveyToCopyText } from "@/lib/surveys/copyAsText";
import type { Session, AnalysisResult } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { ChevronDown, ChevronRight } from "lucide-react";

type TabId = "roles" | "regulations" | "battery" | "report";

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<Session | null>(null);
  const [tab, setTab] = useState<TabId>("roles");
  const [checklistState, setChecklistState] = useState<Record<string, { id: string; status: string; notes?: string }>>({});

  useEffect(() => {
    const s = getSession(sessionId);
    setSession(s ?? null);
    setChecklistState(getChecklistState(sessionId));
  }, [sessionId]);

  if (!session) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-slate-600">
          <p>Session nicht gefunden oder keine Analyse vorhanden.</p>
          <Link href="/intake/review" className="mt-4 inline-block">
            <Button variant="outline">Zur Überprüfung</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const analysis = session.analysis;
  if (!analysis) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-slate-600">
          <p>Keine Analyse vorhanden. Bitte zuerst Ergebnisse generieren.</p>
          <Link href="/intake/review" className="mt-4 inline-block">
            <Button>Zur Überprüfung</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const refreshChecklist = () => setChecklistState(getChecklistState(sessionId));

  const copyRoleChecklist = () => {
    navigator.clipboard.writeText(roleSurveyToCopyText(session.roleSurvey));
  };
  const copyProductChecklist = () => {
    navigator.clipboard.writeText(productSurveyToCopyText(session.productSurvey));
  };
  const downloadJson = () => {
    const blob = new Blob([JSON.stringify({ session, analysis }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compliance-result-${sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const downloadHtml = () => {
    const fullHtml = `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"/><title>Compliance-Bericht</title></head><body>${analysis.reportHtml}</body></html>`;
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compliance-report-${sessionId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-900">Ergebnisse</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={copyRoleChecklist}>
            Rollen-Checkliste kopieren
          </Button>
          <Button variant="outline" size="sm" onClick={copyProductChecklist}>
            Produkt-Checkliste kopieren
          </Button>
          <Button variant="outline" size="sm" onClick={downloadJson}>
            JSON herunterladen
          </Button>
          <Button variant="outline" size="sm" onClick={downloadHtml}>
            HTML-Bericht herunterladen
          </Button>
        </div>
      </div>

      <Tabs>
        <TabsList value={tab} onValueChange={(v) => setTab(v as TabId)}>
          <TabsTrigger value="roles" activeValue={tab} onSelect={(v) => setTab(v as TabId)}>Rollen</TabsTrigger>
          <TabsTrigger value="regulations" activeValue={tab} onSelect={(v) => setTab(v as TabId)}>Verordnungen</TabsTrigger>
          <TabsTrigger value="battery" activeValue={tab} onSelect={(v) => setTab(v as TabId)}>Batterie-Verordnung</TabsTrigger>
          <TabsTrigger value="report" activeValue={tab} onSelect={(v) => setTab(v as TabId)}>Vollständiger Bericht</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" activeValue={tab} className="mt-4">
          <RolesTab analysis={analysis} />
        </TabsContent>

        <TabsContent value="regulations" activeValue={tab} className="mt-4">
          <RegulationsTab analysis={analysis} />
        </TabsContent>

        <TabsContent value="battery" activeValue={tab} className="mt-4">
          <BatteryTab
            analysis={analysis}
            sessionId={sessionId}
            checklistState={checklistState}
            onUpdate={refreshChecklist}
          />
        </TabsContent>

        <TabsContent value="report" activeValue={tab} className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Vollständiger Bericht</CardTitle>
              <Button variant="outline" size="sm" onClick={downloadHtml}>
                HTML herunterladen
              </Button>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(analysis.reportHtml) }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RolesTab({ analysis }: { analysis: AnalysisResult }) {
  const byMarket = analysis.roleDetermination?.byMarket ?? [];
  return (
    <div className="space-y-4">
      {byMarket.map((m) => (
        <Card key={m.market}>
          <CardHeader>
            <CardTitle className="text-base">Markt: {m.market}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {m.roles?.map((r, i) => (
              <div key={i} className="rounded border border-slate-100 bg-slate-50 p-3">
                <p className="font-medium text-slate-800">
                  {r.role} <span className="text-slate-500">({r.confidence})</span>
                </p>
                <ul className="mt-1 list-inside list-disc text-sm text-slate-600">
                  {r.reasons?.map((reason, j) => (
                    <li key={j}>{reason}</li>
                  ))}
                </ul>
              </div>
            ))}
            {m.missingInfo?.length > 0 && (
              <p className="text-sm text-amber-700">
                <strong>Fehlende Infos:</strong> {m.missingInfo.join("; ")}
              </p>
            )}
            {m.contradictions?.length > 0 && (
              <p className="text-sm text-red-700">
                <strong>Widersprüche:</strong> {m.contradictions.join("; ")}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RegulationsTab({ analysis }: { analysis: AnalysisResult }) {
  const regs = analysis.regulations;
  if (!regs) return null;
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Anwendbar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(regs.applicable ?? []).map((r, i) => (
            <div key={i} className="rounded border border-emerald-100 bg-emerald-50/50 p-3">
              <p className="font-medium text-slate-800">{r.id} – {r.title}</p>
              <p className="text-xs text-slate-500">{r.type}</p>
              <ul className="mt-1 list-inside list-disc text-sm text-slate-600">
                {r.whyApplicable?.map((w, j) => (
                  <li key={j}>{w}</li>
                ))}
              </ul>
              {r.notes?.length > 0 && (
                <p className="mt-1 text-xs text-slate-500">{r.notes.join(" ")}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nicht anwendbar (Out-Tailoring)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(regs.notApplicable ?? []).map((r, i) => (
            <div key={i} className="rounded border border-slate-200 bg-slate-50 p-3">
              <p className="font-medium text-slate-800">{r.id} – {r.title}</p>
              <ul className="mt-1 list-inside list-disc text-sm text-slate-600">
                {r.whyNotApplicable?.map((w, j) => (
                  <li key={j}>{w}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      {(regs.needsClarification?.length ?? 0) > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="text-base text-amber-800">Klärungsbedarf</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {regs.needsClarification?.map((n, i) => (
              <div key={i} className="rounded border border-amber-200 bg-white p-3">
                <p className="font-medium text-slate-800">{n.topic}</p>
                <p className="text-sm text-slate-600">{n.question}</p>
                <p className="text-xs text-amber-700">Warum relevant: {n.whyItMatters}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function BatteryTab({
  analysis,
  sessionId,
  checklistState,
  onUpdate,
}: {
  analysis: AnalysisResult;
  sessionId: string;
  checklistState: Record<string, { id: string; status: string; notes?: string }>;
  onUpdate: () => void;
}) {
  const plan = analysis.compliancePlan?.batteryRegulation_2023_1542;
  const [open, setOpen] = useState<Record<string, boolean>>({});

  if (!plan) return <p className="text-slate-600">Keine Batterie-Checkliste vorhanden.</p>;

  const scope = plan.scopeClassification;
  const toggle = (id: string) => setOpen((o) => ({ ...o, [id]: !o[id] }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Einstufung Batterie-Verordnung (EU) 2023/1542</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium text-slate-800">Batterietyp: {scope?.batteryType}</p>
          <ul className="mt-1 list-inside list-disc text-sm text-slate-600">
            {scope?.rationale?.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {plan.checklist?.map((section) => {
          const sid = section.sectionCode;
          const isOpen = open[sid] ?? true;
          return (
            <Card key={sid}>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-5 py-4 text-left font-medium text-slate-900 hover:bg-slate-50"
                onClick={() => toggle(sid)}
              >
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                {section.sectionCode}. {section.sectionTitle}
              </button>
              {isOpen && (
                <CardContent className="border-t border-slate-100 pt-4">
                  <ul className="space-y-3">
                    {section.items?.map((item) => {
                      if (!item.tailoring?.applicable) {
                        return (
                          <li key={item.id} className="rounded border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
                            <span className="line-through">{item.requirement}</span>
                            <p className="mt-1 text-xs text-slate-500">{item.tailoring.tailoringReason}</p>
                          </li>
                        );
                      }
                      const state = checklistState[item.id];
                      const status = state?.status ?? "todo";
                      return (
                        <li key={item.id} className="flex items-start gap-3 rounded border border-slate-200 p-3">
                          <select
                            value={status}
                            onChange={(e) => {
                              updateChecklistItem(sessionId, item.id, { status: e.target.value as "todo" | "in_progress" | "done" });
                              onUpdate();
                            }}
                            className="rounded border border-slate-300 px-2 py-1 text-xs"
                          >
                            <option value="todo">Offen</option>
                            <option value="in_progress">In Bearbeitung</option>
                            <option value="done">Erledigt</option>
                          </select>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-800">{item.requirement}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              Beispiele für Nachweise: {item.evidenceExamples?.join("; ")}
                            </p>
                            <p className="text-xs text-slate-500">Vorgeschlagener Verantwortlicher: {item.ownerRoleSuggested}</p>
                            <input
                              type="text"
                              placeholder="Notizen"
                              className="mt-2 w-full rounded border border-slate-200 px-2 py-1 text-xs"
                              defaultValue={state?.notes}
                              onBlur={(e) => {
                                updateChecklistItem(sessionId, item.id, { notes: e.target.value });
                                onUpdate();
                              }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {(plan.outTailoredSections?.length ?? 0) > 0 && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Out-tailored Abschnitte</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-600">
              {plan.outTailoredSections?.map((o, i) => (
                <li key={i}>
                  <strong>{o.reference}:</strong> {o.reason}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
