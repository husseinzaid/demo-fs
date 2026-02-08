import { z } from "zod";

const marketEnum = z.enum(["EU", "USA", "China", "UK", "Other"]);
const roleEnum = z.enum([
  "Hersteller",
  "Quasi-Hersteller",
  "Importeur",
  "Distributor/Händler",
  "Bevollmächtigter",
  "Dienstleister",
  "Softwarehersteller",
  "Betreiber",
  "Unklar",
]);
const confidenceEnum = z.enum(["high", "medium", "low"]);
const regulationTypeEnum = z.enum(["Verordnung", "Richtlinie", "Gesetz", "Leitlinie"]);
const batteryTypeEnum = z.enum(["Industriebatterie", "Gerätebatterie", "SLI", "LMT", "EV", "Unklar"]);

const compliancePlanSectionSchema = z.object({
  sectionCode: z.string(),
  sectionTitle: z.string(),
  items: z.array(
    z.object({
      id: z.string(),
      requirement: z.string(),
      evidenceExamples: z.array(z.string()),
      ownerRoleSuggested: z.string(),
      statusDefault: z.literal("todo"),
      tailoring: z.object({
        applicable: z.boolean(),
        tailoringReason: z.string().nullable(),
      }),
    })
  ),
});

export const compliancePlanSchema = z.object({
  regulationId: z.string(),
  regulationTitle: z.string(),
  jurisdiction: z.literal("EU"),
  applicable: z.boolean(),
  scopeSummary: z.array(z.string()),
  checklist: z.array(compliancePlanSectionSchema),
  outTailoredSections: z.array(
    z.object({
      reference: z.string(),
      reason: z.string(),
    })
  ),
});

export const analysisResultSchema = z.object({
  meta: z.object({
    createdAt: z.string(),
    model: z.string(),
    jurisdictionFocus: z.literal("EU"),
    disclaimer: z.string(),
  }),

  roleDetermination: z.object({
    byMarket: z.array(
      z.object({
        market: marketEnum,
        roles: z.array(
          z.object({
            role: roleEnum,
            confidence: confidenceEnum,
            reasons: z.array(z.string()),
          })
        ),
        missingInfo: z.array(z.string()),
        contradictions: z.array(z.string()),
      })
    ).min(1),
  }),

  productSummary: z.object({
    productName: z.string(),
    keyClassifications: z.array(z.string()),
    keyRiskDrivers: z.array(z.string()),
    assumptions: z.array(z.string()),
  }),

  regulations: z.object({
    applicable: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        type: regulationTypeEnum,
        jurisdiction: z.literal("EU"),
        whyApplicable: z.array(z.string()),
        notes: z.array(z.string()),
        confidence: confidenceEnum,
        sources: z.array(
          z.object({
            title: z.string(),
            url: z.string(),
            usedFor: z.array(z.string()),
          })
        ),
        harmonisedStandards: z.array(z.string()),
      })
    ).min(3),
    notApplicable: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        jurisdiction: z.literal("EU"),
        whyNotApplicable: z.array(z.string()),
      })
    ).min(3),
    needsClarification: z.array(
      z.object({
        topic: z.string(),
        question: z.string(),
        whyItMatters: z.string(),
      })
    ),
  }),

  compliancePlans: z.array(compliancePlanSchema),

  reportHtml: z.string(),
});

export type AnalysisResultSchema = z.infer<typeof analysisResultSchema>;
