"use client";

import { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { roleSurveySchema, defaultRoleSurvey, exampleRoleSurvey } from "@/lib/surveys/roleSurvey";
import type { RoleSurvey } from "@/lib/types";
import { getOrCreateCurrentSession, updateSession } from "@/lib/storage/sessionStore";
import { roleSurveyToCopyText } from "@/lib/surveys/copyAsText";
import { Button } from "@/components/ui/Button";
import { SurveySection, SurveyQuestion } from "@/components/SurveySection";
import { CopyAsText } from "@/components/CopyAsText";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

const MARKETS: { value: RoleSurvey["A1_targetMarkets"][number]; label: string }[] = [
  { value: "EU", label: "EU/EWR" },
  { value: "USA", label: "USA" },
  { value: "China", label: "China" },
  { value: "UK", label: "UK" },
  { value: "Other", label: "Andere" },
];

const A2_OPTIONS: { value: RoleSurvey["A2_firstPlacing"]; label: string }[] = [
  { value: "our_company", label: "Unser Unternehmen" },
  { value: "affiliate", label: "Verbundenes Unternehmen" },
  { value: "external_partner", label: "Externer Partner" },
  { value: "unclear", label: "Unklar" },
];

const B1_OPTIONS = [
  { value: "inhouse", label: "Inhouse" },
  { value: "partial", label: "Teilweise extern" },
  { value: "external_to_spec", label: "Extern nach unserer Spezifikation" },
  { value: "external_no_spec", label: "Extern ohne unsere Spezifikation" },
];

const B2_OPTIONS = [
  { value: "our_company", label: "Unser Unternehmen" },
  { value: "joint", label: "Gemeinsam" },
  { value: "external", label: "Extern" },
  { value: "unclear", label: "Unklar" },
];

const C1_OPTIONS = [
  { value: "our_brand", label: "Unsere Marke" },
  { value: "other_brand", label: "Fremde Marke" },
  { value: "neutral", label: "Neutral / White Label" },
];

const C2_C3_OPTIONS = [
  { value: "our_company", label: "Unser Unternehmen" },
  { value: "partner", label: "Partner" },
  { value: "unclear", label: "Unklar" },
];
const C2_EXTRA = { value: "not_defined", label: "Nicht definiert" };

const D1_OPTIONS = [
  { value: "no", label: "Nein" },
  { value: "yes_by_us", label: "Ja, durch uns" },
  { value: "yes_by_others", label: "Ja, durch andere" },
];

const D2_OPTIONS = [
  { value: "our_company", label: "Unser Unternehmen" },
  { value: "external", label: "Extern" },
  { value: "unclear", label: "Unklar" },
  { value: "not_applicable", label: "Nicht anwendbar (kein Import)" },
];

const D3_OPTIONS = [
  { value: "direct_to_end_users", label: "Direkt an Endverbraucher" },
  { value: "to_distributors", label: "An Händler / Distributoren" },
  { value: "internal_only", label: "Nur intern" },
];

const E1_OPTIONS = [
  { value: "no", label: "Nein" },
  { value: "mechanical", label: "Mechanisch" },
  { value: "electrical", label: "Elektrisch" },
  { value: "software", label: "Software" },
  { value: "configuration", label: "Konfiguration" },
];

const E2_OPTIONS = [
  { value: "no", label: "Nein" },
  { value: "yes", label: "Ja" },
  { value: "unclear", label: "Unklar" },
  { value: "not_applicable", label: "Nicht anwendbar (keine Änderungen)" },
];

const F1_OPTIONS = [
  { value: "our_company", label: "Unser Unternehmen" },
  { value: "manufacturer", label: "Hersteller" },
  { value: "importer", label: "Importeur" },
];

const F2_OPTIONS = [
  { value: "our_company", label: "Unser Unternehmen" },
  { value: "partner", label: "Partner" },
  { value: "not_defined", label: "Nicht definiert" },
];

const G1_OPTIONS = [
  { value: "no", label: "Nein" },
  { value: "embedded", label: "Eingebettet" },
  { value: "standalone", label: "Standalone" },
  { value: "cloud_saas", label: "Cloud / SaaS" },
];

const G2_OPTIONS = [
  { value: "our_company", label: "Unser Unternehmen" },
  { value: "service_provider", label: "Dienstleister" },
  { value: "customer", label: "Kunde" },
];

export default function RoleSurveyPage() {
  const router = useRouter();
  const session = typeof window !== "undefined" ? getOrCreateCurrentSession() : null;
  const { register, watch, setValue, handleSubmit } = useForm<RoleSurvey>({
    resolver: zodResolver(roleSurveySchema),
    defaultValues: session?.roleSurvey ?? defaultRoleSurvey,
  });

  const values = watch();

  const persist = useCallback(() => {
    if (!session?.id) return;
    updateSession(session.id, { roleSurvey: values });
  }, [session?.id, values]);

  useEffect(() => {
    if (!session?.id) return;
    const t = setTimeout(persist, 500);
    return () => clearTimeout(t);
  }, [values, session?.id, persist]);

  useEffect(() => {
    if (session?.roleSurvey) {
      Object.entries(session.roleSurvey).forEach(([k, v]) => setValue(k as keyof RoleSurvey, v));
    }
  }, [session?.id]);

  // Conditional: D1 "no" → D2 = not_applicable; D1 "yes" and D2 was not_applicable → D2 = unclear
  useEffect(() => {
    if (values.D1_importFromThirdCountry === "no") {
      setValue("D2_importerOnDocs", "not_applicable");
    } else if (values.D2_importerOnDocs === "not_applicable") {
      setValue("D2_importerOnDocs", "unclear");
    }
  }, [values.D1_importFromThirdCountry, values.D2_importerOnDocs, setValue]);

  // Conditional: E1 empty or only "no" → E2 = not_applicable; E1 has modifications and E2 was not_applicable → E2 = unclear
  const e1HasModifications =
    values.E1_modifiedAfterReceipt?.length > 0 &&
    values.E1_modifiedAfterReceipt.some((x) => x !== "no");
  useEffect(() => {
    if (!e1HasModifications) {
      setValue("E2_mod_affects_conformity", "not_applicable");
    } else if (values.E2_mod_affects_conformity === "not_applicable") {
      setValue("E2_mod_affects_conformity", "unclear");
    }
  }, [e1HasModifications, values.E2_mod_affects_conformity, setValue]);

  const loadExample = () => {
    Object.entries(exampleRoleSurvey).forEach(([k, v]) => setValue(k as keyof RoleSurvey, v));
  };

  const onSubmit = () => {
    persist();
    router.push("/intake/product");
  };

  if (!session) return <div className="p-4">Laden…</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Schritt 1: Rollen-Identifikation (Punkt 1)</CardTitle>
        <div className="flex gap-2">
          <CopyAsText getText={() => roleSurveyToCopyText(values)} />
          <Button variant="outline" size="sm" onClick={loadExample}>
            Beispiel laden
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <SurveySection title="A. Allgemeine Markt- & Lieferkettenfragen">
            <SurveyQuestion label="A1. Zielmarkt(e)" whyMatters="Bestimmt anwendbare Rechtsordnungen und Rollen.">
              <div className="flex flex-wrap gap-3">
                {MARKETS.map((m) => (
                  <label key={m.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={values.A1_targetMarkets?.includes(m.value) ?? false}
                      onChange={(e) => {
                        const prev = values.A1_targetMarkets ?? [];
                        const next = e.target.checked ? [...prev, m.value] : prev.filter((x) => x !== m.value);
                        setValue("A1_targetMarkets", next);
                      }}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm">{m.label}</span>
                  </label>
                ))}
              </div>
              {values.A1_targetMarkets?.includes("Other") && (
                <input
                  type="text"
                  placeholder="Andere (Freitext)"
                  className="mt-2 w-full max-w-xs rounded border border-slate-300 px-3 py-1.5 text-sm"
                  {...register("A1_otherText")}
                />
              )}
            </SurveyQuestion>
            <SurveyQuestion label="A2. Wer bringt das Produkt erstmals in den Markt?" whyMatters="Relevanz für Hersteller-/Importeurrolle.">
              <select className="w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm" {...register("A2_firstPlacing")}>
                {A2_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SurveyQuestion>
          </SurveySection>

          <SurveySection title="B. Produktbezogene Verantwortung">
            <SurveyQuestion label="B1. Produktentwicklung" whyMatters="Abgrenzung Hersteller vs. Händler.">
              <select className="w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm" {...register("B1_productDevelopment")}>
                {B1_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SurveyQuestion>
            <SurveyQuestion label="B2. Festlegung der bestimmungsgemäßen Verwendung" whyMatters="Verantwortung für Zweckbestimmung.">
              <select className="w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm" {...register("B2_intendedUseDefinedBy")}>
                {B2_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SurveyQuestion>
          </SurveySection>

          <SurveySection title="C. Inverkehrbringen & Bereitstellung">
            <SurveyQuestion label="C1. Verkaufsname / Marke" whyMatters="Eigenes vs. fremdes Produkt.">
              <select className="w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm" {...register("C1_branding")}>
                {C1_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SurveyQuestion>
            <SurveyQuestion label="C2. Konformitätsverantwortung" whyMatters="Wer haftet für Konformität.">
              <select className="w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm" {...register("C2_conformityResponsibility")}>
                {[...C2_C3_OPTIONS, C2_EXTRA].map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SurveyQuestion>
            <SurveyQuestion label="C3. Technische Unterlagen werden erstellt/verwaltet durch" whyMatters="Dokumentationsverantwortung.">
              <select className="w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm" {...register("C3_techDocsHeldBy")}>
                {C2_C3_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SurveyQuestion>
          </SurveySection>

          <SurveySection title="D. Import & Vertrieb">
            <SurveyQuestion label="D1. Import aus Drittstaat" whyMatters="Importeurpflichten.">
              <select className="w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm" {...register("D1_importFromThirdCountry")}>
                {D1_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SurveyQuestion>
            {values.D1_importFromThirdCountry !== "no" && (
              <SurveyQuestion label="D2. Offizieller Importeur laut Dokumenten" whyMatters="Wer in Unterlagen genannt wird.">
                <select className="w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm" {...register("D2_importerOnDocs")}>
                  {D2_OPTIONS.filter((o) => o.value !== "not_applicable").map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </SurveyQuestion>
            )}
            <SurveyQuestion label="D3. Vertriebsform (Pflichtangabe)" whyMatters="Distributorpflichten; Hersteller vs. Händler.">
              <select className="w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm" {...register("D3_distribution")}>
                {D3_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SurveyQuestion>
          </SurveySection>

          <SurveySection title="E. Modifikation & Anpassung">
            <SurveyQuestion label="E1. Produktveränderungen nach Erhalt" whyMatters="Einfluss auf Konformität.">
              <div className="flex flex-wrap gap-3">
                {E1_OPTIONS.map((o) => (
                  <label key={o.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={values.E1_modifiedAfterReceipt?.includes(o.value as RoleSurvey["E1_modifiedAfterReceipt"][number]) ?? false}
                      onChange={(e) => {
                        const prev = values.E1_modifiedAfterReceipt ?? [];
                        const next = e.target.checked
                          ? [...prev, o.value as RoleSurvey["E1_modifiedAfterReceipt"][number]]
                          : prev.filter((x) => x !== o.value);
                        setValue("E1_modifiedAfterReceipt", next);
                      }}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm">{o.label}</span>
                  </label>
                ))}
              </div>
            </SurveyQuestion>
            {e1HasModifications && (
              <SurveyQuestion label="E2. Einfluss auf Konformität" whyMatters="Neubewertung nötig?">
                <select className="w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm" {...register("E2_mod_affects_conformity")}>
                  {E2_OPTIONS.filter((o) => o.value !== "not_applicable").map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </SurveyQuestion>
            )}
          </SurveySection>

          <SurveySection title="F. Kennzeichnung & Marktüberwachung">
            <SurveyQuestion label="F1. Wer bringt Kennzeichnungen an (CE, FCC, etc.)?" whyMatters="Verantwortung für Konformitätskennzeichnung.">
              <select className="w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm" {...register("F1_marksAppliedBy")}>
                {F1_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SurveyQuestion>
            <SurveyQuestion label="F2. Marktüberwachung & Meldepflichten" whyMatters="Post-Market-Verantwortung.">
              <select className="w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm" {...register("F2_marketSurveillanceHandledBy")}>
                {F2_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SurveyQuestion>
          </SurveySection>

          <SurveySection title="G. Software & digitale Aspekte">
            <SurveyQuestion label="G1. Enthält Software?" whyMatters="Softwarehersteller-Rolle, RED/MDR.">
              <select className="w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm" {...register("G1_softwareIncluded")}>
                {G1_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SurveyQuestion>
            <SurveyQuestion label="G2. Softwarepflege nach Markteintritt" whyMatters="Verantwortung für Updates.">
              <select className="w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm" {...register("G2_softwareMaintainedBy")}>
                {G2_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SurveyQuestion>
          </SurveySection>

          <div className="flex justify-between border-t border-slate-200 pt-6">
            <Link href="/">
              <Button type="button" variant="ghost">Abbrechen</Button>
            </Link>
            <Button type="submit">Weiter zu Produkt</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
