import { z } from "zod";
import type { RoleSurvey } from "@/lib/types";

const marketEnum = z.enum(["EU", "USA", "China", "UK", "Other"]);

export const roleSurveySchema = z.object({
  A1_targetMarkets: z.array(marketEnum),
  A1_otherText: z.string().optional(),
  A2_firstPlacing: z.enum(["our_company", "affiliate", "external_partner", "unclear"]),

  B1_productDevelopment: z.enum(["inhouse", "partial", "external_to_spec", "external_no_spec"]),
  B2_intendedUseDefinedBy: z.enum(["our_company", "joint", "external", "unclear"]),

  C1_branding: z.enum(["our_brand", "other_brand", "neutral"]),
  C2_conformityResponsibility: z.enum(["our_company", "partner", "not_defined"]),
  C3_techDocsHeldBy: z.enum(["our_company", "partner", "unclear"]),

  D1_importFromThirdCountry: z.enum(["no", "yes_by_us", "yes_by_others"]),
  D2_importerOnDocs: z.enum(["our_company", "external", "unclear", "not_applicable"]),
  D3_distribution: z.enum(["direct_to_end_users", "to_distributors", "internal_only"]),

  E1_modifiedAfterReceipt: z.array(z.enum(["no", "mechanical", "electrical", "software", "configuration"])),
  E2_mod_affects_conformity: z.enum(["no", "yes", "unclear", "not_applicable"]),

  F1_marksAppliedBy: z.enum(["our_company", "manufacturer", "importer"]),
  F2_marketSurveillanceHandledBy: z.enum(["our_company", "partner", "not_defined"]),

  G1_softwareIncluded: z.enum(["no", "embedded", "standalone", "cloud_saas"]),
  G2_softwareMaintainedBy: z.enum(["our_company", "service_provider", "customer"]),
});

export const defaultRoleSurvey: RoleSurvey = {
  A1_targetMarkets: [],
  A2_firstPlacing: "unclear",
  B1_productDevelopment: "external_no_spec",
  B2_intendedUseDefinedBy: "unclear",
  C1_branding: "neutral",
  C2_conformityResponsibility: "not_defined",
  C3_techDocsHeldBy: "unclear",
  D1_importFromThirdCountry: "no",
  D2_importerOnDocs: "not_applicable",
  D3_distribution: "to_distributors",
  E1_modifiedAfterReceipt: [],
  E2_mod_affects_conformity: "not_applicable",
  F1_marksAppliedBy: "manufacturer",
  F2_marketSurveillanceHandledBy: "not_defined",
  G1_softwareIncluded: "no",
  G2_softwareMaintainedBy: "customer",
};

// Example prefill for "Load Example"
export const exampleRoleSurvey: RoleSurvey = {
  A1_targetMarkets: ["EU"],
  A2_firstPlacing: "our_company",
  B1_productDevelopment: "inhouse",
  B2_intendedUseDefinedBy: "our_company",
  C1_branding: "our_brand",
  C2_conformityResponsibility: "our_company",
  C3_techDocsHeldBy: "our_company",
  D1_importFromThirdCountry: "no",
  D2_importerOnDocs: "not_applicable",
  D3_distribution: "to_distributors",
  E1_modifiedAfterReceipt: [],
  E2_mod_affects_conformity: "not_applicable",
  F1_marksAppliedBy: "our_company",
  F2_marketSurveillanceHandledBy: "our_company",
  G1_softwareIncluded: "embedded",
  G2_softwareMaintainedBy: "our_company",
};
