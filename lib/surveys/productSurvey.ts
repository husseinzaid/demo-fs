import { z } from "zod";
import type { ProductSurvey } from "@/lib/types";

const marketEnum = z.enum(["EU", "USA", "China", "UK", "Other"]);

export const productSurveySchema = z.object({
  A1_productName: z.string(),

  A2_category: z.object({
    machine: z.boolean(),
    electricalEquipment: z.boolean(),
    electronicDevice: z.boolean(),
    medicalDevice: z.boolean(),
    pressureEquipment: z.boolean(),
    radioEquipment: z.boolean(),
    constructionProduct: z.boolean(),
    toy: z.boolean(),
    ppe: z.boolean(),
    softwareDigital: z.boolean(),
    combinationSystem: z.boolean(),
    other: z.boolean(),
    otherText: z.string().optional(),
  }),

  B1_tangible: z.boolean(),
  B2_movingParts: z.enum(["no", "manual", "motorized", "automatic_autonomous"]),
  B3_energyForms: z.array(z.enum(["electrical", "mechanical", "pneumatic", "hydraulic", "thermal", "chemical", "radiation", "none"])),
  B4_maxElectricalRatings: z.enum(["le_50vac_75vdc", "gt_50vac_75vdc", "not_applicable"]),

  C1_mainPurpose: z.string(),
  C2_humanInteraction: z.enum(["no", "indirect", "direct", "worn_on_body"]),
  C3_targetUsers: z.array(z.enum(["consumer", "commercial", "industry", "trained_staff", "patients", "children"])),

  D1_useEnvironments: z.array(z.enum(["household", "office", "industry", "outdoor", "medical", "public_space", "atex"])),
  D2_specialConditions: z.array(z.enum(["humidity", "dust", "heat_cold", "chemicals", "vibration", "none"])),

  E1_software: z.enum(["no", "embedded", "standalone", "cloud_saas"]),
  E2_wireless: z.enum(["no", "wifi", "bluetooth", "cellular", "other"]),
  E2_wirelessOtherText: z.string().optional(),
  E3_ai: z.enum(["no", "supportive", "safety_relevant", "autonomous"]),

  F1_supplyForm: z.enum(["single_device", "assembly", "safety_component", "accessory", "spare_part", "system_plant", "subsystem_for_integration"]),
  F2_readyToUse: z.enum(["yes", "installation_required", "integration_required"]),
  F3_partOfBiggerSystem: z.enum(["no", "yes_open", "yes_closed"]),

  G1_targetMarkets: z.array(marketEnum),
  G1_otherText: z.string().optional(),
  G2_supplyMode: z.array(z.enum(["sale", "rental", "leasing", "free", "internal_use", "digital_supply"])),

  H1_batteryCapacityKwh: z.number().optional(),
  H2_batteryCategory: z.enum(["portable", "industrial", "ev", "lmt", "other"]).optional(),
  H3_batteryContainsCobalt: z.boolean().optional(),
  H4_batteryContainsNickel: z.boolean().optional(),
  H5_batteryContainsNaturalGraphite: z.boolean().optional(),
});

const defaultCategory = {
  machine: false,
  electricalEquipment: false,
  electronicDevice: false,
  medicalDevice: false,
  pressureEquipment: false,
  radioEquipment: false,
  constructionProduct: false,
  toy: false,
  ppe: false,
  softwareDigital: false,
  combinationSystem: false,
  other: false,
};

export const defaultProductSurvey: ProductSurvey = {
  A1_productName: "",
  A2_category: { ...defaultCategory },
  B1_tangible: true,
  B2_movingParts: "no",
  B3_energyForms: [],
  B4_maxElectricalRatings: "not_applicable",
  C1_mainPurpose: "",
  C2_humanInteraction: "indirect",
  C3_targetUsers: [],
  D1_useEnvironments: [],
  D2_specialConditions: [],
  E1_software: "no",
  E2_wireless: "no",
  E3_ai: "no",
  F1_supplyForm: "single_device",
  F2_readyToUse: "yes",
  F3_partOfBiggerSystem: "no",
  G1_targetMarkets: [],
  G2_supplyMode: [],

  H1_batteryCapacityKwh: undefined,
  H2_batteryCategory: undefined,
  H3_batteryContainsCobalt: undefined,
  H4_batteryContainsNickel: undefined,
  H5_batteryContainsNaturalGraphite: undefined,
};

// Example prefill: "Modulare Li-Ion Hochvoltbatterie (400V) ..."
export const exampleProductSurvey: ProductSurvey = {
  A1_productName: "Modulare Li-Ion Hochvoltbatterie (400V) – Subsystem zur Integration in industrielle Energiespeicher",
  A2_category: {
    ...defaultCategory,
    electricalEquipment: true,
    electronicDevice: true,
  },
  B1_tangible: true,
  B2_movingParts: "no",
  B3_energyForms: ["electrical", "chemical"],
  B4_maxElectricalRatings: "gt_50vac_75vdc",
  C1_mainPurpose: "Energiespeicherung für industrielle Anwendungen; Integration in größere Speichersysteme.",
  C2_humanInteraction: "indirect",
  C3_targetUsers: ["industry", "trained_staff"],
  D1_useEnvironments: ["industry", "outdoor"],
  D2_specialConditions: ["none"],
  E1_software: "embedded",
  E2_wireless: "no",
  E3_ai: "no",
  F1_supplyForm: "subsystem_for_integration",
  F2_readyToUse: "integration_required",
  F3_partOfBiggerSystem: "yes_open",
  G1_targetMarkets: ["EU"],
  G2_supplyMode: ["sale"],

  H1_batteryCapacityKwh: 50,
  H2_batteryCategory: "industrial",
  H3_batteryContainsCobalt: true,
  H4_batteryContainsNickel: true,
  H5_batteryContainsNaturalGraphite: false,
};
