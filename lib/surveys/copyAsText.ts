import type { RoleSurvey } from "@/lib/types";
import type { ProductSurvey } from "@/lib/types";

const CHECKED = "☒";
const UNCHECKED = "☐";

function line(checked: boolean, text: string) {
  return `${checked ? CHECKED : UNCHECKED} ${text}`;
}

export function roleSurveyToCopyText(s: RoleSurvey): string {
  const markets = s.A1_targetMarkets.length
    ? s.A1_targetMarkets.join(", ") + (s.A1_otherText ? ` (${s.A1_otherText})` : "")
    : "";
  return [
    "=== Rolle (Punkt 1) ===",
    "A. Allgemeine Markt- & Lieferkettenfragen",
    line(s.A1_targetMarkets.includes("EU"), "Zielmarkt(e): EU/EWR"),
    line(s.A1_targetMarkets.includes("USA"), "Zielmarkt(e): USA"),
    line(s.A1_targetMarkets.includes("China"), "Zielmarkt(e): China"),
    line(s.A1_targetMarkets.includes("UK"), "Zielmarkt(e): UK"),
    line(s.A1_targetMarkets.includes("Other"), "Zielmarkt(e): Andere" + (s.A1_otherText ? ` (${s.A1_otherText})` : "")),
    line(s.A2_firstPlacing === "our_company", "A2. Erstes Inverkehrbringen: unser Unternehmen"),
    line(s.A2_firstPlacing === "affiliate", "A2. Erstes Inverkehrbringen: verbundenes Unternehmen"),
    line(s.A2_firstPlacing === "external_partner", "A2. Erstes Inverkehrbringen: externer Partner"),
    line(s.A2_firstPlacing === "unclear", "A2. Erstes Inverkehrbringen: unklar"),
    "",
    "B. Produktbezogene Verantwortung",
    line(s.B1_productDevelopment === "inhouse", "B1. Produktentwicklung: inhouse"),
    line(s.B1_productDevelopment === "partial", "B1. Produktentwicklung: teilweise"),
    line(s.B1_productDevelopment === "external_to_spec", "B1. Produktentwicklung: extern nach Spezifikation"),
    line(s.B1_productDevelopment === "external_no_spec", "B1. Produktentwicklung: extern ohne Spezifikation"),
    line(s.B2_intendedUseDefinedBy === "our_company", "B2. Bestimmungsgemäße Verwendung: unser Unternehmen"),
    line(s.B2_intendedUseDefinedBy === "joint", "B2. Bestimmungsgemäße Verwendung: gemeinsam"),
    line(s.B2_intendedUseDefinedBy === "external", "B2. Bestimmungsgemäße Verwendung: extern"),
    line(s.B2_intendedUseDefinedBy === "unclear", "B2. Bestimmungsgemäße Verwendung: unklar"),
    "",
    "C. Inverkehrbringen & Bereitstellung",
    line(s.C1_branding === "our_brand", "C1. Verkaufsname/Marke: unsere Marke"),
    line(s.C1_branding === "other_brand", "C1. Verkaufsname/Marke: andere Marke"),
    line(s.C1_branding === "neutral", "C1. Verkaufsname/Marke: neutral"),
    line(s.C2_conformityResponsibility === "our_company", "C2. Konformitätsverantwortung: unser Unternehmen"),
    line(s.C2_conformityResponsibility === "partner", "C2. Konformitätsverantwortung: Partner"),
    line(s.C2_conformityResponsibility === "not_defined", "C2. Konformitätsverantwortung: nicht definiert"),
    line(s.C3_techDocsHeldBy === "our_company", "C3. Technische Unterlagen: unser Unternehmen"),
    line(s.C3_techDocsHeldBy === "partner", "C3. Technische Unterlagen: Partner"),
    line(s.C3_techDocsHeldBy === "unclear", "C3. Technische Unterlagen: unklar"),
    "",
    "D. Import & Vertrieb",
    line(s.D1_importFromThirdCountry === "no", "D1. Import aus Drittstaat: nein"),
    line(s.D1_importFromThirdCountry === "yes_by_us", "D1. Import aus Drittstaat: ja, durch uns"),
    line(s.D1_importFromThirdCountry === "yes_by_others", "D1. Import aus Drittstaat: ja, durch andere"),
    line(s.D2_importerOnDocs === "our_company", "D2. Importeur in Dokumenten: unser Unternehmen"),
    line(s.D2_importerOnDocs === "external", "D2. Importeur in Dokumenten: extern"),
    line(s.D2_importerOnDocs === "unclear", "D2. Importeur in Dokumenten: unklar"),
    line(s.D2_importerOnDocs === "not_applicable", "D2. Importeur: nicht anwendbar (kein Import)"),
    line(s.D3_distribution === "direct_to_end_users", "D3. Vertrieb: direkt an Endverbraucher"),
    line(s.D3_distribution === "to_distributors", "D3. Vertrieb: an Händler/Distributoren"),
    line(s.D3_distribution === "internal_only", "D3. Vertrieb: nur intern"),
    "",
    "E. Modifikation & Anpassung",
    line(s.E1_modifiedAfterReceipt.includes("no") || s.E1_modifiedAfterReceipt.length === 0, "E1. Veränderungen nach Erhalt: nein"),
    line(s.E1_modifiedAfterReceipt.includes("mechanical"), "E1. Veränderungen: mechanisch"),
    line(s.E1_modifiedAfterReceipt.includes("electrical"), "E1. Veränderungen: elektrisch"),
    line(s.E1_modifiedAfterReceipt.includes("software"), "E1. Veränderungen: Software"),
    line(s.E1_modifiedAfterReceipt.includes("configuration"), "E1. Veränderungen: Konfiguration"),
    line(s.E2_mod_affects_conformity === "no", "E2. Einfluss auf Konformität: nein"),
    line(s.E2_mod_affects_conformity === "yes", "E2. Einfluss auf Konformität: ja"),
    line(s.E2_mod_affects_conformity === "unclear", "E2. Einfluss auf Konformität: unklar"),
    line(s.E2_mod_affects_conformity === "not_applicable", "E2. Einfluss: nicht anwendbar (keine Änderungen)"),
    "",
    "F. Kennzeichnung & Marktüberwachung",
    line(s.F1_marksAppliedBy === "our_company", "F1. Kennzeichnungen (CE etc.) anbringen: unser Unternehmen"),
    line(s.F1_marksAppliedBy === "manufacturer", "F1. Kennzeichnungen: Hersteller"),
    line(s.F1_marksAppliedBy === "importer", "F1. Kennzeichnungen: Importeur"),
    line(s.F2_marketSurveillanceHandledBy === "our_company", "F2. Marktüberwachung: unser Unternehmen"),
    line(s.F2_marketSurveillanceHandledBy === "partner", "F2. Marktüberwachung: Partner"),
    line(s.F2_marketSurveillanceHandledBy === "not_defined", "F2. Marktüberwachung: nicht definiert"),
    "",
    "G. Software & digitale Aspekte",
    line(s.G1_softwareIncluded === "no", "G1. Enthält Software: nein"),
    line(s.G1_softwareIncluded === "embedded", "G1. Enthält Software: eingebettet"),
    line(s.G1_softwareIncluded === "standalone", "G1. Enthält Software: standalone"),
    line(s.G1_softwareIncluded === "cloud_saas", "G1. Enthält Software: Cloud/SaaS"),
    line(s.G2_softwareMaintainedBy === "our_company", "G2. Softwarepflege: unser Unternehmen"),
    line(s.G2_softwareMaintainedBy === "service_provider", "G2. Softwarepflege: Dienstleister"),
    line(s.G2_softwareMaintainedBy === "customer", "G2. Softwarepflege: Kunde"),
  ].join("\n");
}

const categoryLabels: Record<string, string> = {
  machine: "Maschine",
  electricalEquipment: "Elektrische Ausrüstung",
  electronicDevice: "Elektronikgerät",
  medicalDevice: "Medizinprodukt",
  pressureEquipment: "Druckgerät",
  radioEquipment: "Funkanlage",
  constructionProduct: "Bauprodukt",
  toy: "Spielzeug",
  ppe: "PSA",
  softwareDigital: "Software/digital",
  combinationSystem: "Kombinationssystem",
  other: "Sonstige",
};

export function productSurveyToCopyText(s: ProductSurvey): string {
  const cat = s.A2_category;
  const catLines = Object.keys(categoryLabels).map((k) => {
    const v = cat[k as keyof typeof cat];
    if (typeof v !== "boolean") return null;
    return line(v, `A2. Kategorie: ${categoryLabels[k]}` + (k === "other" && cat.otherText ? ` (${cat.otherText})` : ""));
  }).filter(Boolean) as string[];

  return [
    "=== Produkt (Punkt 2) ===",
    "A. Produktidentifikation",
    `A1. Produktbezeichnung: ${s.A1_productName || "(nicht angegeben)"}`,
    "",
    ...catLines,
    "",
    "B. Physisch & technisch",
    line(s.B1_tangible, "B1. Physisch greifbar: ja"),
    line(!s.B1_tangible, "B1. Physisch greifbar: nein"),
    line(s.B2_movingParts === "no", "B2. Bewegliche Teile: nein"),
    line(s.B2_movingParts === "manual", "B2. Bewegliche Teile: manuell"),
    line(s.B2_movingParts === "motorized", "B2. Bewegliche Teile: motorisiert"),
    line(s.B2_movingParts === "automatic_autonomous", "B2. Bewegliche Teile: automatisch/autonom"),
    ...(["electrical", "mechanical", "pneumatic", "hydraulic", "thermal", "chemical", "radiation", "none"] as const).map((e) =>
      line(s.B3_energyForms.includes(e), `B3. Energieform: ${e}`)
    ),
    line(s.B4_maxElectricalRatings === "le_50vac_75vdc", "B4. Elektrische Kenndaten: ≤50V AC/75V DC"),
    line(s.B4_maxElectricalRatings === "gt_50vac_75vdc", "B4. Elektrische Kenndaten: >50V AC/75V DC"),
    line(s.B4_maxElectricalRatings === "not_applicable", "B4. Elektrische Kenndaten: nicht anwendbar"),
    "",
    "C. Zweck & Verwendung",
    `C1. Hauptzweck: ${s.C1_mainPurpose || "(nicht angegeben)"}`,
    line(s.C2_humanInteraction === "no", "C2. Bedienung/Tragen: nein"),
    line(s.C2_humanInteraction === "indirect", "C2. Bedienung/Tragen: indirekt"),
    line(s.C2_humanInteraction === "direct", "C2. Bedienung/Tragen: direkt"),
    line(s.C2_humanInteraction === "worn_on_body", "C2. Bedienung/Tragen: am Körper getragen"),
    ...(["consumer", "commercial", "industry", "trained_staff", "patients", "children"] as const).map((u) =>
      line(s.C3_targetUsers.includes(u), `C3. Zielnutzer: ${u}`)
    ),
    "",
    "D. Einsatzumgebung",
    ...(["household", "office", "industry", "outdoor", "medical", "public_space", "atex"] as const).map((e) =>
      line(s.D1_useEnvironments.includes(e), `D1. Einsatzort: ${e}`)
    ),
    ...(["humidity", "dust", "heat_cold", "chemicals", "vibration", "none"] as const).map((c) =>
      line(s.D2_specialConditions.includes(c), `D2. Bedingungen: ${c}`)
    ),
    "",
    "E. Funktionen & Technologie",
    line(s.E1_software === "no", "E1. Software: nein"),
    line(s.E1_software === "embedded", "E1. Software: eingebettet"),
    line(s.E1_software === "standalone", "E1. Software: standalone"),
    line(s.E1_software === "cloud_saas", "E1. Software: Cloud/SaaS"),
    line(s.E2_wireless === "no", "E2. Funk: nein"),
    line(s.E2_wireless === "wifi", "E2. Funk: WLAN"),
    line(s.E2_wireless === "bluetooth", "E2. Funk: Bluetooth"),
    line(s.E2_wireless === "cellular", "E2. Funk: Mobilfunk"),
    line(s.E2_wireless === "other", "E2. Funk: andere" + (s.E2_wirelessOtherText ? ` (${s.E2_wirelessOtherText})` : "")),
    line(s.E3_ai === "no", "E3. KI: nein"),
    line(s.E3_ai === "supportive", "E3. KI: unterstützend"),
    line(s.E3_ai === "safety_relevant", "E3. KI: sicherheitsrelevant"),
    line(s.E3_ai === "autonomous", "E3. KI: autonom"),
    "",
    "F. Bereitstellungsform",
    line(s.F1_supplyForm === "single_device", "F1. Bereitstellung: Einzelgerät"),
    line(s.F1_supplyForm === "assembly", "F1. Bereitstellung: Baugruppe"),
    line(s.F1_supplyForm === "safety_component", "F1. Bereitstellung: Sicherheitsbauteil"),
    line(s.F1_supplyForm === "accessory", "F1. Bereitstellung: Zubehör"),
    line(s.F1_supplyForm === "spare_part", "F1. Bereitstellung: Ersatzteil"),
    line(s.F1_supplyForm === "system_plant", "F1. Bereitstellung: System/Anlage"),
    line(s.F1_supplyForm === "subsystem_for_integration", "F1. Bereitstellung: Subsystem zur Integration"),
    line(s.F2_readyToUse === "yes", "F2. Sofort einsatzbereit: ja"),
    line(s.F2_readyToUse === "installation_required", "F2. Sofort einsatzbereit: Installation nötig"),
    line(s.F2_readyToUse === "integration_required", "F2. Sofort einsatzbereit: Integration nötig"),
    line(s.F3_partOfBiggerSystem === "no", "F3. Teil größeres System: nein"),
    line(s.F3_partOfBiggerSystem === "yes_open", "F3. Teil größeres System: ja, offen"),
    line(s.F3_partOfBiggerSystem === "yes_closed", "F3. Teil größeres System: ja, geschlossen"),
    "",
    "G. Markt & Fokus",
    line(s.G1_targetMarkets.includes("EU"), "G1. Zielmarkt: EU/EWR"),
    line(s.G1_targetMarkets.includes("USA"), "G1. Zielmarkt: USA"),
    line(s.G1_targetMarkets.includes("China"), "G1. Zielmarkt: China"),
    line(s.G1_targetMarkets.includes("UK"), "G1. Zielmarkt: UK"),
    line(s.G1_targetMarkets.includes("Other"), "G1. Zielmarkt: Andere" + (s.G1_otherText ? ` (${s.G1_otherText})` : "")),
    ...(["sale", "rental", "leasing", "free", "internal_use", "digital_supply"] as const).map((m) =>
      line(s.G2_supplyMode.includes(m), `G2. Bereitstellungsart: ${m}`)
    ),
    "",
    "H. Batterie (EU 2023/1542)",
    `H1. Kapazität (kWh): ${s.H1_batteryCapacityKwh != null ? s.H1_batteryCapacityKwh : "(nicht angegeben)"}`,
    line(s.H2_batteryCategory === "portable", "H2. Batterietyp: tragbar"),
    line(s.H2_batteryCategory === "industrial", "H2. Batterietyp: Industriebatterie"),
    line(s.H2_batteryCategory === "ev", "H2. Batterietyp: EV"),
    line(s.H2_batteryCategory === "lmt", "H2. Batterietyp: LMT"),
    line(s.H2_batteryCategory === "other", "H2. Batterietyp: sonstige"),
    line(s.H3_batteryContainsCobalt === true, "H3. Enthält Kobalt"),
    line(s.H4_batteryContainsNickel === true, "H4. Enthält Nickel"),
    line(s.H5_batteryContainsNaturalGraphite === true, "H5. Enthält Naturgraphit"),
  ].join("\n");
}
