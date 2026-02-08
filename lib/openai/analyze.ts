import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { analysisResultSchema, type AnalysisResultSchema } from "./schema";
import type { RoleSurvey, ProductSurvey } from "@/lib/types";

const SYSTEM_INSTRUCTION = `
Du bist CE- und Marktzugangs-Experte für technische Produkte (EU-Fokus).
Arbeite präzise, regulatorisch korrekt und nachvollziehbar.

WICHTIG:
- Nutze die Survey-Daten als Primärquelle.
- Du darfst allgemeines Fachwissen nutzen, ABER: Wenn eine Aussage nicht direkt aus dem Survey folgt, schreibe sie als "Annahme" in productSummary.assumptions oder als Hinweis in notes – und markiere ggf. Klärungsbedarf.
- Stelle nur dann Fragen in needsClarification, wenn Survey-Daten fehlen/unklar/widersprüchlich sind. Wenn Survey eindeutig ist, KEIN Klärungsbedarf dazu.
- RED (Richtlinie 2014/53/EU): Nur dann einen RED-Klärungsbedarf in needsClarification aufnehmen, wenn Funk/drahtlos fehlt oder widersprüchlich ist. Wenn der Survey explizit productSurvey.E2_wireless = "no" angibt, darf KEIN RED-Klärungsbedarf gestellt werden.
- Gib pro Markt genau EINEN Eintrag in roleDetermination.byMarket aus (keine Duplikate).
- Ausgabe MUSS gültiges JSON gemäß Schema sein.
- Alle nutzerseitigen Texte auf Deutsch.
`.trim();

const USER_INSTRUCTION_TEMPLATE = `
Analysiere den folgenden Intake und liefere eine strukturierte Auswertung.

Ziele:
1) Rollenbestimmung je Zielmarkt:
   - Bestimme Rolle(n) (z.B. Hersteller, Quasi-Hersteller, Importeur, Distributor/Händler, Bevollmächtigter, Dienstleister, Softwarehersteller, Betreiber).
   - Gib pro Rolle: confidence + reasons (mit Bezug auf konkrete Survey-Felder).
   - missingInfo und contradictions je Markt befüllen (auch wenn nur "keine" → leere Liste).

2) Relevante EU-Regelungen identifizieren (EU/EWR):
   - Du MUSST jede der folgenden Kandidaten bewerten und EINORDNEN als:
     a) regulations.applicable, oder
     b) regulations.notApplicable, oder
     c) regulations.needsClarification (nur wenn Survey nicht reicht)
   Kandidatenliste:
   - Verordnung (EU) 2023/1542 (Batterien)
   - Richtlinie 2014/35/EU (Niederspannung, LVD) – wenn Spannungsbereich zutrifft
   - Richtlinie 2014/30/EU (EMV) – wenn elektronische/elektrische Funktionen vorhanden sind
   - Richtlinie 2006/42/EG bzw. Verordnung (EU) 2023/1230 (Maschinen) – typischerweise nur bei relevanten Maschinenmerkmalen
   - Richtlinie 2014/53/EU (RED) – nur bei Funk/Radio
   - Richtlinie 2014/34/EU (ATEX) – nur bei Ex-Umgebung
   - Verordnung (EU) 2017/745 (MDR) – nur bei medizinischer Zweckbestimmung
   - Produkthaftung: nenne die aktuell relevante Basis (und ggf. künftige Änderungen als Hinweis)

   HINWEIS ZUR GPSR (EU) 2023/988:
   - Nur aufnehmen, wenn das Produkt ein Verbraucherprodukt ist oder vernünftigerweise von Verbrauchern genutzt werden kann; sonst "notApplicable" oder "notes".

3) Battery Regulation 2023/1542: Tailorierte Compliance-Checkliste erstellen
   - Nutze die Produkt-Survey-Felder H1_batteryCapacityKwh, H2_batteryCategory, H3/H4/H5 (Kobalt, Nickel, Naturgraphit) sofern angegeben – sie steuern Batteriepass-Schwellen, Due Diligence und Einstufung (portable/industrial/EV/LMT).
   - Liefere mindestens 6 Checklist-Sektionen, jede Sektion mindestens 3 Items.
   - Abdecken: Sicherheit/Risikoanalyse, Konformitätsbewertung + Unterlagen, Kennzeichnung/Information, Batteriepass-Readiness (gestaffelt), Lieferkette/Due Diligence (besonders bei Kobalt/Nickel/Graphite), Post-Market/Marktüberwachung.
   - Out-Tailoring: liste nicht zutreffende Themen als outTailoredSections mit Begründung.
   - Wenn H1/H2 fehlen, setze needsClarification oder productSummary.assumptions.

4) reportHtml:
   - Erstelle einen vollständigen Bericht auf Deutsch (Überschriften, Tabellen, Bullet-Listen).
   - Muss konsistent zu den strukturierten Feldern sein.

Role survey (JSON):
{{ROLE_SURVEY}}

Product survey (JSON):
{{PRODUCT_SURVEY}}
`.trim();

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
    // If you use a reasoning model, keep this; otherwise harmless.
    reasoning: options.reasoningEffort ? { effort: options.reasoningEffort as any } : undefined,
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

  // De-duplicate byMarket: group by market, merge roles + reasons, unique missingInfo/contradictions
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
