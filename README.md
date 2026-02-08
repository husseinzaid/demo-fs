# CE Compliance Intake – Demo

Demo web app for technical product market access / CE compliance intake: landing → role survey → product survey → review → OpenAI analysis → results with tabs and exports.

## Tech stack

- **Next.js** (App Router) + TypeScript
- **TailwindCSS** + custom UI components (Button, Card, Tabs, Stepper)
- **react-hook-form** + **zod** for form validation
- **OpenAI** Responses API with **Structured Outputs** (Zod schema)
- **localStorage** for client-side session persistence
- **isomorphic-dompurify** for safe HTML rendering in the report tab

## Run locally

1. **Install dependencies** (already done if you cloned):

   ```bash
   npm install
   ```

2. **Configure environment**

   Copy the example env and set your OpenAI API key:

   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local`:

   - `OPENAI_API_KEY` – required for the analyze API
   - `OPENAI_MODEL` – e.g. `gpt-4o-2024-08-06` (structured outputs)
   - Optional: `OPENAI_REASONING_EFFORT=low`

3. **Start the dev server**

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

   - **Landing** → “Assessment starten”
   - **Step 1**: Role survey (Punkt 1) – optional “Beispiel laden” / “Als Text kopieren”
   - **Step 2**: Product survey (Punkt 2) – same
   - **Review**: Summary, copy-as-text, debug payload/prompt, then “Ergebnisse generieren”
   - **Results** (`/results/[sessionId]`): Tabs Rollen, Verordnungen, Batterie-Verordnung, Vollständiger Bericht; export buttons (copy checklists, download JSON, download HTML).

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing, CTA “Assessment starten” |
| `/intake/role` | Role identification survey (Step 1) |
| `/intake/product` | Product definition survey (Step 2) |
| `/intake/review` | Review + “Generate Results” (calls OpenAI) |
| `/results/[sessionId]` | Results with tabs and exports |

## Data & API

- **Sessions** are stored in `localStorage` under `reg_demo_sessions`.
- **Analyze** is a POST to `/api/analyze` with `{ sessionId, roleSurvey, productSurvey }`. The API uses the OpenAI Responses API and returns a schema-valid `AnalysisResult` (Zod).
- **Rate limiting**: one request per 5 seconds per `sessionId` (in-memory, for demo).

## Project structure (main)

- `app/` – pages and API route (`api/analyze/route.ts`)
- `components/` – Stepper, SurveySection, CopyAsText, UI (Button, Card, Tabs)
- `lib/` – types, surveys (role/product schemas + defaults + copy-as-text), storage (sessionStore), OpenAI (schema + analyze)

## Acceptance criteria (from spec)

- `npm run dev` starts the app.
- Completing both surveys and refreshing keeps data (localStorage).
- Review shows summary, copy-as-text, and debug payload/prompt.
- “Ergebnisse generieren” calls OpenAI and shows Results.
- OpenAI output is schema-valid (Zod structured outputs).
- Export JSON and HTML work.
- UI is suitable for a demo.
