"use client";

import type { Session, SessionChecklistState } from "@/lib/types";
import { defaultRoleSurvey } from "@/lib/surveys/roleSurvey";
import { defaultProductSurvey } from "@/lib/surveys/productSurvey";

const STORAGE_KEY = "reg_demo_sessions";
const CHECKLIST_KEY_PREFIX = "reg_demo_checklist_";

function randomUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getSessions(): Session[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function setSessions(sessions: Session[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // ignore
  }
}

export function createSession(): Session {
  const sessions = getSessions();
  const id = randomUUID();
  const now = new Date().toISOString();
  const session: Session = {
    id,
    createdAt: now,
    updatedAt: now,
    roleSurvey: { ...defaultRoleSurvey },
    productSurvey: { ...defaultProductSurvey },
  };
  sessions.unshift(session);
  setSessions(sessions);
  return session;
}

export function getSession(sessionId: string): Session | null {
  return getSessions().find((s) => s.id === sessionId) ?? null;
}

export function updateSession(sessionId: string, update: Partial<Pick<Session, "roleSurvey" | "productSurvey" | "analysis">>) {
  const sessions = getSessions();
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx === -1) return null;
  const session = sessions[idx];
  const updated: Session = {
    ...session,
    ...update,
    updatedAt: new Date().toISOString(),
  };
  sessions[idx] = updated;
  setSessions(sessions);
  return updated;
}

export function getOrCreateCurrentSession(): Session {
  const sessions = getSessions();
  if (sessions.length > 0) return sessions[0];
  return createSession();
}

export function getChecklistState(sessionId: string): SessionChecklistState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CHECKLIST_KEY_PREFIX + sessionId);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function setChecklistState(sessionId: string, state: SessionChecklistState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHECKLIST_KEY_PREFIX + sessionId, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function updateChecklistItem(
  sessionId: string,
  itemId: string,
  update: { status?: "todo" | "in_progress" | "done"; notes?: string }
) {
  const state = getChecklistState(sessionId);
  const existing = state[itemId];
  state[itemId] = {
    id: itemId,
    status: update.status ?? existing?.status ?? "todo",
    notes: update.notes !== undefined ? update.notes : existing?.notes,
  };
  setChecklistState(sessionId, state);
  return state;
}
