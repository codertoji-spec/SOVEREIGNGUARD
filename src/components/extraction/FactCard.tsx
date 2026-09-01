"use client";

import React from "react";
import { ContractFact } from "@/types/guard";
import { FileText, Eye, ShieldCheck, AlertCircle } from "lucide-react";

interface FactCardProps {
  fact: ContractFact;
  onInspectEvidence: (fact: ContractFact) => void;
  isTampered?: boolean;
}

export function FactCard({ fact, onInspectEvidence, isTampered }: FactCardProps) {
  const categoryColors = {
    commercial: "border-yellow-700/60 bg-yellow-950/20 text-yellow-300",
    legal: isTampered
      ? "border-rose-600 bg-rose-950/40 text-rose-300 glow-red"
      : "border-amber-700/60 bg-amber-950/20 text-amber-300",
    sla: "border-neutral-700 bg-[#1a1a1a] text-neutral-300",
    compliance: "border-emerald-800/60 bg-emerald-950/20 text-emerald-300",
  };

  return (
    <div
      className={`p-3.5 rounded-lg border transition-all hover:border-yellow-500/50 bg-[#121212] ${
        isTampered ? "border-rose-600 ring-1 ring-rose-500" : "border-[#262626]"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
            categoryColors[fact.category]
          }`}
        >
          {fact.category}
        </span>
        {fact.evidence?.page && (
          <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1">
            <FileText className="w-3 h-3 text-neutral-500" />
            Page {fact.evidence.page}
          </span>
        )}
      </div>

      <div className="mb-2">
        <h4 className="text-xs text-neutral-400 font-mono">{fact.label}</h4>
        <div className="text-sm font-bold font-mono text-neutral-100 flex items-center gap-1.5 mt-0.5">
          <span>{fact.formatted_value}</span>
          {isTampered && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-800 font-mono">
              TAMPERED
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onInspectEvidence(fact)}
        className="w-full mt-1.5 py-1 px-2 rounded text-[11px] font-mono bg-[#181818] hover:bg-[#222222] text-neutral-300 hover:text-yellow-400 border border-[#2a2a2a] hover:border-yellow-500/40 transition-all flex items-center justify-center gap-1.5"
      >
        <Eye className="w-3 h-3" />
        <span>Inspect Page Evidence</span>
      </button>
    </div>
  );
}
