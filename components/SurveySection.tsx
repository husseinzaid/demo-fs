"use client";

import * as React from "react";

export function SurveySection({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`mb-8 ${className}`}>
      <h2 className="mb-4 text-base font-semibold uppercase tracking-wide text-slate-600 border-b border-slate-200 pb-2">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function SurveyQuestion({
  label,
  whyMatters,
  children,
}: {
  label: string;
  whyMatters?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-800">{label}</label>
      {whyMatters && (
        <p className="text-xs text-slate-500">Warum relevant: {whyMatters}</p>
      )}
      <div>{children}</div>
    </div>
  );
}
