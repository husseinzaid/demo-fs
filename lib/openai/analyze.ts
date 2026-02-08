import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { analysisResultSchema, type AnalysisResultSchema } from "./schema";
import type { RoleSurvey, ProductSurvey } from "@/lib/types";

const SYSTEM_INSTRUCTION = `You are a CE & market access expert for technical products in the EU.
Be precise. Do not invent facts. Use the survey data only; if a key fact is missing, add it to needsClarification and avoid assumptions.
Output must be valid JSON matching the required schema.

Language: All strings in all fields (including reasons, whyApplicable, missingInfo, contradictions, titles, notes, reportHtml) must be in German. No English fragments.

If you use web search results, prefer official sources (EUR-Lex, EU Commission) and add a "Quellen" section with clickable links in reportHtml.
Include meta.disclaimer: "Not legal advice; verify with regulatory experts."

Strictness:
- If a decisive field is missing (e.g. H2 battery type, capacity, chemistry) → do not infer; mark as Unklar and ask in needsClarification.
- Exactly one entry per market in roleDetermination.byMarket (no duplicates).
- For borderline or unclear cases (e.g. PED when only hydraulics is present), do not assert "not applicable" with a strong reason. Put the regime into needsClarification with a specific question instead. Example for PED: "Enthält das Hydrauliksystem Druckspeicher/Behälter oder andere druckhaltende Ausrüstung > 0,5 bar, die als Druckgerät/-zubehör einzustufen wäre?"`;

const USER_INSTRUCTION_TEMPLATE = `Analyse den folgenden Intake und liefere die strukturierte Auswertung.

1) Rollen je Zielmarkt: Rolle(n) mit Konfidenz und Gründen. missingInfo und contradictions pro Markt. Genau ein Eintrag pro Markt (keine Duplikate).

2) Anwendbare EU-Regelungen identifizieren – ausschließlich anhand des Surveys, keine vorgegebene feste Liste:
   Für jede in Frage kommende Regelung: einordnen als applicable / notApplicable / needsClarification (mit Begründung).
   Logik: Wenn im Produkt Batterien vorkommen → EU 2023/1542 (Batterien) prüfen. Wenn Funk/drahtlos → RED. Wenn Maschine (bewegte Teile, Maschinenfunktion) → Maschinenrichtlinie/-verordnung prüfen. Wenn nur Verbraucherprodukt und keine sektorspezifische Sicherheitsregelung greift → GPSR prüfen. Wenn elektrisch > 50 V AC / 75 V DC und keine Maschine → LVD prüfen. Wenn Maschine: LVD nicht als eigene anwendbare Regelung listen – elektrische Sicherheit wird über die Maschinenrichtlinie abgedeckt; EN 60204-1 ggf. als relevante Norm unter Maschine nennen, nicht als LVD-harmonisiert. Wenn EMV-relevant (elektronisch/elektrisch) → EMV. Wenn Ex-Umgebung → ATEX. Wenn medizinischer Zweck → MDR. Wenn Druckgerät/Behälter > 0,5 bar im Anwendungsbereich → Druckgeräterichtlinie (PED); bei Unklarheit (z. B. nur Hydraulik) → needsClarification mit konkreter Frage, nicht "nicht anwendbar".
   Keine Anker-Beispiele wie "Battery Regulation für Li-Ion Industriebatterie" – rein bedingungsbasiert aus dem Survey.

3) Compliance-Checklisten (compliancePlans):
   Erstelle für jede Regelung in regulations.applicable einen Eintrag in compliancePlans (regulationId, regulationTitle, jurisdiction "EU", applicable, scopeSummary, checklist, outTailoredSections).
   Erstelle keine Checkliste für Regelungen in notApplicable.
   Für die 1–2 regulatorisch höchstrangigen/risikorelevanten Regelungen: detaillierte Checkliste (mehrere Sektionen mit konkreten Anforderungspunkten, evidenceExamples, ownerRoleSuggested, tailoring). Für die übrigen anwendbaren Regelungen: kürzere Checkliste oder wenige Sektionen mit Überblickspunkten.
   Wo klar begründet: out-tailoren (outTailoredSections mit reference + reason). Nicht anwendbare Regelungen haben keinen Eintrag in compliancePlans.

4) reportHtml: Vollständiger Bericht auf Deutsch (Überschriften, Tabellen, Aufzählungen). Bei genutzten Quellen "Quellen"-Abschnitt mit klickbaren Links.

Role survey (JSON):
{{ROLE_SURVEY}}

Product survey (JSON):
{{PRODUCT_SURVEY}}`;

export function buildAnalyzePrompt(roleSurvey: RoleSurvey, productSurvey: ProductSurvey): string {
  return USER_INSTRUCTION_TEMPLATE
    .replace("{{ROLE_SURVEY}}", JSON.stringify(roleSurvey, null, 2))
    .replace("{{PRODUCT_SURVEY}}", JSON.stringify(productSurvey, null, 2));
}

export async function runAnalysis(
  roleSurvey: RoleSurvey,
  productSurvey: ProductSurvey,
  options: { apiKey: string; model: string; reasoningEffort?: string }
): Promise<AnalysisResultSchema> {
  const openai = new OpenAI({ apiKey: options.apiKey });
  const userContent = buildAnalyzePrompt(roleSurvey, productSurvey);

  const response = await openai.responses.parse({
    model: options.model,
    instructions: SYSTEM_INSTRUCTION,
    input: userContent,
    reasoning: options.reasoningEffort ? { effort: options.reasoningEffort as "low" | "medium" | "high" } : undefined,
    text: {
      format: zodTextFormat(analysisResultSchema, "AnalysisResult"),
    },
  });

  const parsed = response.output_parsed;
  if (parsed == null) throw new Error("OpenAI returned no parsed output");

  const result = parsed as AnalysisResultSchema;

  if (!result.meta.createdAt) result.meta.createdAt = new Date().toISOString();
  result.meta.model = options.model;
  result.meta.jurisdictionFocus = "EU";
  if (!result.meta.disclaimer) result.meta.disclaimer = "Not legal advice; verify with regulatory experts.";

  // De-duplicate byMarket: one entry per market, merge roles, unique missingInfo/contradictions
  const byMarketMap = new Map<string, (typeof result.roleDetermination.byMarket)[number]>();
  for (const entry of result.roleDetermination.byMarket ?? []) {
    const existing = byMarketMap.get(entry.market);
    if (!existing) {
      byMarketMap.set(entry.market, { ...entry, missingInfo: [...(entry.missingInfo ?? [])], contradictions: [...(entry.contradictions ?? [])] });
    } else {
      existing.roles = [...(existing.roles ?? []), ...(entry.roles ?? [])];
      const mi = new Set([...(existing.missingInfo ?? []), ...(entry.missingInfo ?? [])]);
      existing.missingInfo = [...mi];
      const co = new Set([...(existing.contradictions ?? []), ...(entry.contradictions ?? [])]);
      existing.contradictions = [...co];
    }
  }
  result.roleDetermination.byMarket = [...byMarketMap.values()];

  return result;
}
