// Market and survey types for CE compliance intake demo

export type Market = "EU" | "USA" | "China" | "UK" | "Other";

export type RoleSurvey = {
  A1_targetMarkets: Market[];
  A1_otherText?: string;
  A2_firstPlacing: "our_company" | "affiliate" | "external_partner" | "unclear";

  B1_productDevelopment: "inhouse" | "partial" | "external_to_spec" | "external_no_spec";
  B2_intendedUseDefinedBy: "our_company" | "joint" | "external" | "unclear";

  C1_branding: "our_brand" | "other_brand" | "neutral";
  C2_conformityResponsibility: "our_company" | "partner" | "not_defined";
  C3_techDocsHeldBy: "our_company" | "partner" | "unclear";

  D1_importFromThirdCountry: "no" | "yes_by_us" | "yes_by_others";
  D2_importerOnDocs: "our_company" | "external" | "unclear" | "not_applicable";
  D3_distribution: "direct_to_end_users" | "to_distributors" | "internal_only";

  E1_modifiedAfterReceipt: ("no" | "mechanical" | "electrical" | "software" | "configuration")[];
  E2_mod_affects_conformity: "no" | "yes" | "unclear" | "not_applicable";

  F1_marksAppliedBy: "our_company" | "manufacturer" | "importer";
  F2_marketSurveillanceHandledBy: "our_company" | "partner" | "not_defined";

  G1_softwareIncluded: "no" | "embedded" | "standalone" | "cloud_saas";
  G2_softwareMaintainedBy: "our_company" | "service_provider" | "customer";
};

export type ProductSurvey = {
  A1_productName: string;

  A2_category: {
    machine: boolean;
    electricalEquipment: boolean;
    electronicDevice: boolean;
    medicalDevice: boolean;
    pressureEquipment: boolean;
    radioEquipment: boolean;
    constructionProduct: boolean;
    toy: boolean;
    ppe: boolean;
    softwareDigital: boolean;
    combinationSystem: boolean;
    other: boolean;
    otherText?: string;
  };

  B1_tangible: boolean;
  B2_movingParts: "no" | "manual" | "motorized" | "automatic_autonomous";
  B3_energyForms: ("electrical" | "mechanical" | "pneumatic" | "hydraulic" | "thermal" | "chemical" | "radiation" | "none")[];
  B4_maxElectricalRatings: "le_50vac_75vdc" | "gt_50vac_75vdc" | "not_applicable";

  C1_mainPurpose: string;
  C2_humanInteraction: "no" | "indirect" | "direct" | "worn_on_body";
  C3_targetUsers: ("consumer" | "commercial" | "industry" | "trained_staff" | "patients" | "children")[];

  D1_useEnvironments: ("household" | "office" | "industry" | "outdoor" | "medical" | "public_space" | "atex")[];
  D2_specialConditions: ("humidity" | "dust" | "heat_cold" | "chemicals" | "vibration" | "none")[];

  E1_software: "no" | "embedded" | "standalone" | "cloud_saas";
  E2_wireless: "no" | "wifi" | "bluetooth" | "cellular" | "other";
  E2_wirelessOtherText?: string;
  E3_ai: "no" | "supportive" | "safety_relevant" | "autonomous";

  F1_supplyForm: "single_device" | "assembly" | "safety_component" | "accessory" | "spare_part" | "system_plant" | "subsystem_for_integration";
  F2_readyToUse: "yes" | "installation_required" | "integration_required";
  F3_partOfBiggerSystem: "no" | "yes_open" | "yes_closed";

  G1_targetMarkets: Market[];
  G1_otherText?: string;
  G2_supplyMode: ("sale" | "rental" | "leasing" | "free" | "internal_use" | "digital_supply")[];

  /** Optional: for EU Battery Regulation (capacity thresholds, passport, etc.) */
  H1_batteryCapacityKwh?: number;
  H2_batteryCategory?: "portable" | "industrial" | "ev" | "lmt" | "other";
  H3_batteryContainsCobalt?: boolean;
  H4_batteryContainsNickel?: boolean;
  H5_batteryContainsNaturalGraphite?: boolean;
};

// Analysis result from OpenAI (schema enforced via Zod in API)
export type AnalysisResult = {
  meta: {
    createdAt: string;
    model: string;
    jurisdictionFocus: "EU";
    disclaimer: string;
  };

  roleDetermination: {
    byMarket: Array<{
      market: Market;
      roles: Array<{
        role:
          | "Hersteller"
          | "Quasi-Hersteller"
          | "Importeur"
          | "Distributor/Händler"
          | "Bevollmächtigter"
          | "Dienstleister"
          | "Softwarehersteller"
          | "Betreiber"
          | "Unklar";
        confidence: "high" | "medium" | "low";
        reasons: string[];
      }>;
      missingInfo: string[];
      contradictions: string[];
    }>;
  };

  productSummary: {
    productName: string;
    keyClassifications: string[];
    keyRiskDrivers: string[];
    assumptions: string[];
  };

  regulations: {
    applicable: Array<{
      id: string;
      title: string;
      type: "Verordnung" | "Richtlinie" | "Gesetz" | "Leitlinie";
      jurisdiction: "EU";
      whyApplicable: string[];
      notes: string[];
      confidence: "high" | "medium" | "low";
      sources: Array<{ title: string; url: string; usedFor: string[] }>;
      harmonisedStandards: string[];
    }>;
    notApplicable: Array<{
      id: string;
      title: string;
      jurisdiction: "EU";
      whyNotApplicable: string[];
    }>;
    needsClarification: Array<{
      topic: string;
      question: string;
      whyItMatters: string;
    }>;
  };

  /** New: per-regulation compliance plans (dynamic) */
  compliancePlans?: Array<{
    regulationId: string;
    regulationTitle: string;
    jurisdiction: "EU";
    applicable: boolean;
    scopeSummary: string[];
    checklist: Array<{
      sectionCode: string;
      sectionTitle: string;
      items: Array<{
        id: string;
        requirement: string;
        evidenceExamples: string[];
        ownerRoleSuggested: string;
        statusDefault: "todo";
        tailoring: { applicable: boolean; tailoringReason?: string | null };
      }>;
    }>;
    outTailoredSections: Array<{ reference: string; reason: string }>;
  }>;

  /** @deprecated Legacy: only present in old stored results; UI migrates to compliancePlans */
  compliancePlan?: {
    batteryRegulation_2023_1542?: {
      applicable?: boolean;
      scopeClassification?: { batteryType?: string; rationale?: string[] };
      checklist?: Array<{
        sectionCode: string;
        sectionTitle: string;
        items: Array<{
          id: string;
          requirement: string;
          evidenceExamples: string[];
          ownerRoleSuggested: string;
          statusDefault: string;
          tailoring: { applicable: boolean; tailoringReason?: string | null };
        }>;
      }>;
      outTailoredSections?: Array<{ reference: string; reason: string }>;
    };
    otherRegulationsSummary?: Array<{ regulationId: string; whatToDoNext: string[] }>;
  };

  reportHtml: string;
};

export type Session = {
  id: string;
  createdAt: string;
  updatedAt: string;
  roleSurvey: RoleSurvey;
  productSurvey: ProductSurvey;
  analysis?: AnalysisResult;
};

// User-editable checklist status (stored in localStorage per session)
export type ChecklistItemStatus = {
  id: string;
  status: "todo" | "in_progress" | "done";
  notes?: string;
};

export type SessionChecklistState = Record<string, ChecklistItemStatus>;
