import React from "react";

export function flag(value, rules) {
  if (value == null) return "none";
  for (const rule of rules) {
    if (rule.fn(value)) return rule.color;
  }
  return "green";
}

const tones = {
  red:    "bg-rose-100 text-rose-700 border-rose-200",
  yellow: "bg-amber-100 text-amber-700 border-amber-200",
  green:  "bg-emerald-100 text-emerald-700 border-emerald-200",
  none:   "bg-slate-100 text-slate-400 border-slate-200",
};

export default function MetricsBadge({ value, unit = "", rules, label }) {
  const color = rules ? flag(value, rules) : "none";
  const cls = tones[color];
  return (
    <div className={`inline-flex flex-col items-center px-2 py-1 rounded-lg border text-xs ${cls} min-w-[52px]`}>
      <span className="font-semibold">{value != null ? `${value}${unit}` : "—"}</span>
      {label && <span className="text-[10px] opacity-70 leading-tight">{label}</span>}
    </div>
  );
}