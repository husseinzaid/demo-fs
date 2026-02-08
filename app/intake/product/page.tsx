"use client";

import { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { productSurveySchema, defaultProductSurvey, exampleProductSurvey } from "@/lib/surveys/productSurvey";
import type { ProductSurvey } from "@/lib/types";
import { getOrCreateCurrentSession, updateSession } from "@/lib/storage/sessionStore";
import { productSurveyToCopyText } from "@/lib/surveys/copyAsText";
import { Button } from "@/components/ui/Button";
import { SurveySection, SurveyQuestion } from "@/components/SurveySection";
import { CopyAsText } from "@/components/CopyAsText";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

const CATEGORY_OPTIONS: { key: keyof ProductSurvey["A2_category"]; label: string }[] = [
  { key: "machine", label: "Maschine" },
  { key: "electricalEquipment", label: "Elektrische Ausrüstung" },
  { key: "electronicDevice", label: "Elektronikgerät" },
  { key: "medicalDevice", label: "Medizinprodukt" },
  { key: "pressureEquipment", label: "Druckgerät" },
  { key: "radioEquipment", label: "Funkanlage" },
  { key: "constructionProduct", label: "Bauprodukt" },
  { key: "toy", label: "Spielzeug" },
  { key: "ppe", label: "PSA" },
  { key: "softwareDigital", label: "Software/digital" },
  { key: "combinationSystem", label: "Kombinationssystem" },
  { key: "other", label: "Sonstige" },
];

const MARKETS = [
  { value: "EU" as const, label: "EU/EWR" },
  { value: "USA" as const, label: "USA" },
  { value: "China" as const, label: "China" },
  { value: "UK" as const, label: "UK" },
  { value: "Other" as const, label: "Andere" },
];

const B2_OPTIONS = [
  { value: "no", label: "Nein" },
  { value: "manual", label: "Manuell" },
  { value: "motorized", label: "Motorisiert" },
  { value: "automatic_autonomous", label: "Automatisch/autonom" },
];

const B3_OPTIONS = [
  "electrical", "mechanical", "pneumatic", "hydraulic", "thermal", "chemical", "radiation", "none",
] as const;

const B4_OPTIONS = [
  { value: "le_50vac_75vdc", label: "≤ 50 V AC / 75 V DC" },
  { value: "gt_50vac_75vdc", label: "> 50 V AC / 75 V DC" },
  { value: "not_applicable", label: "Nicht anwendbar" },
];

const C2_OPTIONS = [
  { value: "no", label: "Nein" },
  { value: "indirect", label: "Indirekt" },
  { value: "direct", label: "Direkt" },
  { value: "worn_on_body", label: "Am Körper getragen" },
];

const C3_OPTIONS = [
  "consumer", "commercial", "industry", "trained_staff", "patients", "children",
] as const;

const D1_OPTIONS = [
  "household", "office", "industry", "outdoor", "medical", "public_space", "atex",
] as const;

const D2_OPTIONS = [
  "humidity", "dust", "heat_cold", "chemicals", "vibration", "none",
] as const;

const E1_OPTIONS = [
  { value: "no", label: "Nein" },
  { value: "embedded", label: "Eingebettet" },
  { value: "standalone", label: "Standalone" },
  { value: "cloud_saas", label: "Cloud/SaaS" },
];

const E2_OPTIONS = [
  { value: "no", label: "Nein" },
  { value: "wifi", label: "WLAN" },
  { value: "bluetooth", label: "Bluetooth" },
  { value: "cellular", label: "Mobilfunk" },
  { value: "other", label: "Andere" },
];

const E3_OPTIONS = [
  { value: "no", label: "Nein" },
  { value: "supportive", label: "Unterstützend" },
  { value: "safety_relevant", label: "Sicherheitsrelevant" },
  { value: "autonomous", label: "Autonom" },
];

const F1_OPTIONS = [
  { value: "single_device", label: "Einzelgerät" },
  { value: "assembly", label: "Baugruppe" },
  { value: "safety_component", label: "Sicherheitsbauteil" },
  { value: "accessory", label: "Zubehör" },
  { value: "spare_part", label: "Ersatzteil" },
  { value: "system_plant", label: "System/Anlage" },
  { value: "subsystem_for_integration", label: "Subsystem zur Integration in System/Anlage" },
];

const F2_OPTIONS = [
  { value: "yes", label: "Ja" },
  { value: "installation_required", label: "Installation nötig" },
  { value: "integration_required", label: "Integration nötig" },
];

const F3_OPTIONS = [
  { value: "no", label: "Nein" },
  { value: "yes_open", label: "Ja, offenes System" },
  { value: "yes_closed", label: "Ja, geschlossenes System" },
];

const G2_OPTIONS = [
  "sale", "rental", "leasing", "free", "internal_use", "digital_supply",
] as const;

export default function ProductSurveyPage() {
  const router = useRouter();
  const session = typeof window !== "undefined" ? getOrCreateCurrentSession() : null;
  const { register, watch, setValue, handleSubmit } = useForm<ProductSurvey>({
    resolver: zodResolver(productSurveySchema),
    defaultValues: session?.productSurvey ?? defaultProductSurvey,
  });

  const values = watch();

  const persist = useCallback(() => {
    if (!session?.id) return;
    updateSession(session.id, { productSurvey: values });
  }, [session?.id, values]);

  useEffect(() => {
    if (!session?.id) return;
    const t = setTimeout(persist, 500);
    return () => clearTimeout(t);
  }, [values, session?.id, persist]);

  useEffect(() => {
    if (session?.productSurvey) {
      Object.entries(session.productSurvey).forEach(([k, v]) => {
        if (k === "A2_category" && v && typeof v === "object") {
          Object.entries(v).forEach(([ck, cv]) => setValue(`A2_category.${ck}` as keyof ProductSurvey, cv as never));
        } else setValue(k as keyof ProductSurvey, v);
      });
    }
  }, [session?.id]);

  const loadExample = () => {
    Object.entries(exampleProductSurvey).forEach(([k, v]) => {
      if (k === "A2_category" && v && typeof v === "object")
        Object.entries(v).forEach(([ck, cv]) => setValue(`A2_category.${ck}` as keyof ProductSurvey, cv as never));
      else setValue(k as keyof ProductSurvey, v);
    });
  };

  const onSubmit = () => {
    persist();
    router.push("/intake/review");
  };

  if (!session) return <div className="p-4">Laden…</div>;

  const showB4 = values.B3_energyForms?.includes("electrical");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Schritt 2: Produktdefinition (Punkt 2)</CardTitle>
        <div className="flex gap-2">
          <CopyAsText getText={() => productSurveyToCopyText(values)} />
          <Button variant="outline" size="sm" onClick={loadExample}>
            Beispiel laden
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <SurveySection title="A. Produktidentifikation">
            <SurveyQuestion label="A1. Produktbezeichnung (intern/extern)" whyMatters="Eindeutige Identifikation für Unterlagen.">
              <input
                type="text"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                placeholder="z. B. Modulare Li-Ion Hochvoltbatterie"
                {...register("A1_productName")}
              />
            </SurveyQuestion>
            <SurveyQuestion label="A2. Produktkategorie" whyMatters="Bestimmt anwendbare Richtlinien/Verordnungen.">
              <div className="flex flex-wrap gap-3">
                {CATEGORY_OPTIONS.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={typeof values.A2_category?.[key] === "boolean" ? values.A2_category[key] : false}
                      onChange={(e) => setValue(`A2_category.${key}`, e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
              {values.A2_category?.other && (
                <input
                  type="text"
                  placeholder="Sonstige (Freitext)"
                  className="mt-2 w-full max-w-xs rounded border border-slate-300 px-3 py-1.5 text-sm"
                  {...register("A2_category.otherText")}
                />
              )}
            </SurveyQuestion>
          </SurveySection>

          <SurveySection title="B. Physische & technische Eigenschaften">
            <SurveyQuestion label="B1. Physisch greifbar?" whyMatters="Abgrenzung Hardware vs. reine Software.">
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" value="true" checked={values.B1_tangible === true} onChange={() => setValue("B1_tangible", true)} className="border-slate-300" />
                  <span className="text-sm">Ja</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" value="false" checked={values.B1_tangible === false} onChange={() => setValue("B1_tangible", false)} className="border-slate-300" />
                  <span className="text-sm">Nein</span>
                </label>
              </div>
            </SurveyQuestion>
            <SurveyQuestion label="B2. Bewegliche Teile?" whyMatters="Maschinenrichtlinie, Sicherheit.">
              <select className="w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm" {...register("B2_movingParts")}>
                {B2_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SurveyQuestion>
            <SurveyQuestion label="B3. Energieformen" whyMatters="LVD, Druckgeräterichtlinie, etc.">
              <div className="flex flex-wrap gap-3">
                {B3_OPTIONS.map((e) => (
                  <label key={e} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={values.B3_energyForms?.includes(e) ?? false}
                      onChange={(ev) => {
                        const prev = values.B3_energyForms ?? [];
                        const next = ev.target.checked ? [...prev, e] : prev.filter((x) => x !== e);
                        setValue("B3_energyForms", next);
                      }}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm">{e}</span>
                  </label>
                ))}
              </div>
            </SurveyQuestion>
            {showB4 && (
              <SurveyQuestion label="B4. Maximale elektrische Kenndaten" whyMatters="LVD-Anwendbarkeit (>50V AC/75V DC).">
                <select className="w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm" {...register("B4_maxElectricalRatings")}>
                  {B4_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </SurveyQuestion>
            )}
          </SurveySection>

          <SurveySection title="C. Zweck & bestimmungsgemäße Verwendung">
            <SurveyQuestion label="C1. Hauptzweck" whyMatters="Bestimmungsgemäße Verwendung für Konformität.">
              <textarea
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm min-h-[80px]"
                placeholder="Kurzbeschreibung des Hauptzwecks"
                {...register("C1_mainPurpose")}
              />
            </SurveyQuestion>
            <SurveyQuestion label="C2. Bedienung/Tragen durch Menschen" whyMatters="Nutzerkreis, PSA, MDR.">
              <select className="w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm" {...register("C2_humanInteraction")}>
                {C2_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SurveyQuestion>
            <SurveyQuestion label="C3. Zielnutzer" whyMatters="Verbraucher vs. gewerblich, MDR.">
              <div className="flex flex-wrap gap-3">
                {C3_OPTIONS.map((u) => (
                  <label key={u} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={values.C3_targetUsers?.includes(u) ?? false}
                      onChange={(ev) => {
                        const prev = values.C3_targetUsers ?? [];
                        const next = ev.target.checked ? [...prev, u] : prev.filter((x) => x !== u);
                        setValue("C3_targetUsers", next);
                      }}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm">{u}</span>
                  </label>
                ))}
              </div>
            </SurveyQuestion>
          </SurveySection>

          <SurveySection title="D. Einsatzumgebung">
            <SurveyQuestion label="D1. Typische Einsatzorte" whyMatters="Umgebungsanforderungen, ATEX.">
              <div className="flex flex-wrap gap-3">
                {D1_OPTIONS.map((e) => (
                  <label key={e} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={values.D1_useEnvironments?.includes(e) ?? false}
                      onChange={(ev) => {
                        const prev = values.D1_useEnvironments ?? [];
                        const next = ev.target.checked ? [...prev, e] : prev.filter((x) => x !== e);
                        setValue("D1_useEnvironments", next);
                      }}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm">{e}</span>
                  </label>
                ))}
              </div>
            </SurveyQuestion>
            <SurveyQuestion label="D2. Besondere Umgebungsbedingungen" whyMatters="IP, ATEX, Umgebungstemperatur.">
              <div className="flex flex-wrap gap-3">
                {D2_OPTIONS.map((c) => (
                  <label key={c} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={values.D2_specialConditions?.includes(c) ?? false}
                      onChange={(ev) => {
                        const prev = values.D2_specialConditions ?? [];
                        const next = ev.target.checked ? [...prev, c] : prev.filter((x) => x !== c);
                        setValue("D2_specialConditions", next);
                      }}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm">{c}</span>
                  </label>
                ))}
              </div>
            </SurveyQuestion>
          </SurveySection>

          <SurveySection title="E. Funktionen & Technologie">
            <SurveyQuestion label="E1. Enthält Software?" whyMatters="RED, MDR, Software-Risiko.">
              <select className="w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm" {...register("E1_software")}>
                {E1_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SurveyQuestion>
            <SurveyQuestion label="E2. Funk-/drahtlose Schnittstelle?" whyMatters="RED-Anwendbarkeit.">
              <select className="w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm" {...register("E2_wireless")}>
                {E2_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {values.E2_wireless === "other" && (
                <input
                  type="text"
                  placeholder="Andere (Freitext)"
                  className="mt-2 w-full max-w-xs rounded border border-slate-300 px-3 py-1.5 text-sm"
                  {...register("E2_wirelessOtherText")}
                />
              )}
            </SurveyQuestion>
            <SurveyQuestion label="E3. KI?" whyMatters="KI-Verordnung, Sicherheit.">
              <select className="w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm" {...register("E3_ai")}>
                {E3_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SurveyQuestion>
          </SurveySection>

          <SurveySection title="F. Bereitstellungsform & Abgrenzung">
            <SurveyQuestion label="F1. Wird das Produkt als… bereitgestellt?" whyMatters="Einzelgerät vs. Bauteil vs. Subsystem.">
              <select className="w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm" {...register("F1_supplyForm")}>
                {F1_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SurveyQuestion>
            <SurveyQuestion label="F2. Sofort einsatzbereit?" whyMatters="Installations-/Integrationspflichten.">
              <select className="w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm" {...register("F2_readyToUse")}>
                {F2_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SurveyQuestion>
            <SurveyQuestion label="F3. Teil eines größeren Systems?" whyMatters="Systemverantwortung.">
              <select className="w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm" {...register("F3_partOfBiggerSystem")}>
                {F3_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </SurveyQuestion>
          </SurveySection>

          <SurveySection title="G. Markt & regulatorischer Fokus">
            <SurveyQuestion label="G1. Zielmärkte" whyMatters="Rechtsordnungen für Analyse.">
              <div className="flex flex-wrap gap-3">
                {MARKETS.map((m) => (
                  <label key={m.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={values.G1_targetMarkets?.includes(m.value) ?? false}
                      onChange={(e) => {
                        const prev = values.G1_targetMarkets ?? [];
                        const next = e.target.checked ? [...prev, m.value] : prev.filter((x) => x !== m.value);
                        setValue("G1_targetMarkets", next);
                      }}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm">{m.label}</span>
                  </label>
                ))}
              </div>
              {values.G1_targetMarkets?.includes("Other") && (
                <input
                  type="text"
                  placeholder="Andere (Freitext)"
                  className="mt-2 w-full max-w-xs rounded border border-slate-300 px-3 py-1.5 text-sm"
                  {...register("G1_otherText")}
                />
              )}
            </SurveyQuestion>
            <SurveyQuestion label="G2. Art der Bereitstellung" whyMatters="Verkauf, Leasing, etc.">
              <div className="flex flex-wrap gap-3">
                {G2_OPTIONS.map((g) => (
                  <label key={g} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={values.G2_supplyMode?.includes(g) ?? false}
                      onChange={(ev) => {
                        const prev = values.G2_supplyMode ?? [];
                        const next = ev.target.checked ? [...prev, g] : prev.filter((x) => x !== g);
                        setValue("G2_supplyMode", next);
                      }}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm">{g}</span>
                  </label>
                ))}
              </div>
            </SurveyQuestion>
          </SurveySection>

          <SurveySection title="H. Batterie (optional, für EU-Batterieverordnung 2023/1542)">
            <SurveyQuestion label="H1. Kapazität (kWh)" whyMatters="Schwellenwerte Batteriepass, Due Diligence.">
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="z. B. 50"
                className="w-full max-w-xs rounded border border-slate-300 px-3 py-2 text-sm"
                value={values.H1_batteryCapacityKwh ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setValue("H1_batteryCapacityKwh", v === "" ? undefined : Number(v));
                }}
              />
            </SurveyQuestion>
            <SurveyQuestion label="H2. Batterietyp (Einstufung)" whyMatters="Portable vs. Industrie vs. EV/LMT – unterschiedliche Pflichten.">
              <select
                className="w-full max-w-md rounded border border-slate-300 px-3 py-2 text-sm"
                value={values.H2_batteryCategory ?? ""}
                onChange={(e) => setValue("H2_batteryCategory", e.target.value ? (e.target.value as ProductSurvey["H2_batteryCategory"]) : undefined)}
              >
                <option value="">— Optional —</option>
                <option value="portable">Tragbar (portable)</option>
                <option value="industrial">Industriebatterie</option>
                <option value="ev">Elektrofahrzeug (EV)</option>
                <option value="lmt">Leichtelektrofahrzeug (LMT)</option>
                <option value="other">Sonstige</option>
              </select>
            </SurveyQuestion>
            <SurveyQuestion label="H3–H5. Enthält kritische Rohstoffe? (Due Diligence)" whyMatters="Kobalt, Nickel, Naturgraphit – Sorgfaltspflichten.">
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={values.H3_batteryContainsCobalt === true}
                    onChange={(e) => setValue("H3_batteryContainsCobalt", e.target.checked ? true : undefined)}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm">Kobalt</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={values.H4_batteryContainsNickel === true}
                    onChange={(e) => setValue("H4_batteryContainsNickel", e.target.checked ? true : undefined)}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm">Nickel</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={values.H5_batteryContainsNaturalGraphite === true}
                    onChange={(e) => setValue("H5_batteryContainsNaturalGraphite", e.target.checked ? true : undefined)}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm">Naturgraphit</span>
                </label>
              </div>
            </SurveyQuestion>
          </SurveySection>

          <div className="flex justify-between border-t border-slate-200 pt-6">
            <Link href="/intake/role">
              <Button type="button" variant="ghost">Zurück</Button>
            </Link>
            <Button type="submit">Weiter zur Überprüfung</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
