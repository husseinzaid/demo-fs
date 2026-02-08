"use client";

import * as React from "react";

export function Tabs({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function TabsList({
  value,
  onValueChange,
  children,
  className = "",
}: {
  value: string;
  onValueChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex gap-1 border-b border-slate-200 ${className}`} role="tablist">
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  activeValue,
  onSelect,
  children,
  className = "",
}: {
  value: string;
  activeValue: string;
  onSelect: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const isActive = value === activeValue;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => onSelect(value)}
      className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
        isActive
          ? "border-emerald-600 text-emerald-700"
          : "border-transparent text-slate-600 hover:text-slate-900"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  activeValue,
  children,
  className = "",
}: {
  value: string;
  activeValue: string;
  children: React.ReactNode;
  className?: string;
}) {
  if (value !== activeValue) return null;
  return <div className={className} role="tabpanel">{children}</div>;
}
