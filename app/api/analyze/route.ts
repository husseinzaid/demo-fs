import { NextResponse } from "next/server";
import { runAnalysis } from "@/lib/openai/analyze";
import type { RoleSurvey, ProductSurvey } from "@/lib/types";

const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 5000;

function rateLimit(sessionId: string): boolean {
  const now = Date.now();
  const last = rateLimitMap.get(sessionId);
  if (last != null && now - last < RATE_LIMIT_MS) {
    return false;
  }
  rateLimitMap.set(sessionId, now);
  return true;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY. Add it to .env.local." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { sessionId, roleSurvey, productSurvey } = body as {
      sessionId: string;
      roleSurvey: RoleSurvey;
      productSurvey: ProductSurvey;
    };

    if (!sessionId || !roleSurvey || !productSurvey) {
      return NextResponse.json(
        { error: "Missing sessionId, roleSurvey, or productSurvey" },
        { status: 400 }
      );
    }

    if (!rateLimit(sessionId)) {
      return NextResponse.json(
        { error: "Rate limit: wait at least 5 seconds between requests per session." },
        { status: 429 }
      );
    }

    const model = process.env.OPENAI_MODEL ?? "gpt-4o-2024-08-06";
    const reasoningEffort = process.env.OPENAI_REASONING_EFFORT;

    const result = await runAnalysis(roleSurvey, productSurvey, {
      apiKey,
      model,
      reasoningEffort,
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const isValidation = message.includes("schema") || message.includes("pars");
    return NextResponse.json(
      { error: isValidation ? `Validation error: ${message}` : message },
      { status: 500 }
    );
  }
}
