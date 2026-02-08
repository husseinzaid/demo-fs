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

  compliancePlan: z.object({
    batteryRegulation_2023_1542: z.object({
      scopeClassification: z.object({
        batteryType: batteryTypeEnum,
        rationale: z.array(z.string()),
      }),
      checklist: z.array(
        z.object({
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
          ).min(3),
        })
      ).min(6),
      outTailoredSections: z.array(
        z.object({
          reference: z.string(),
          reason: z.string(),
        })
      ),
    }),
    otherRegulationsSummary: z.array(
      z.object({
        regulationId: z.string(),
        whatToDoNext: z.array(z.string()),
      })
    ),
  }),

  reportHtml: z.string(),
});

export type AnalysisResultSchema = z.infer<typeof analysisResultSchema>;
