"use client";

import React from "react";
import { ContractFact } from "@/types/guard";
import { X, FileText, CheckCircle2, ShieldCheck, Quote } from "lucide-react";

interface EvidenceDrawerProps {
  fact: ContractFact | null;
  onClose: () => void;
}

export function EvidenceDrawer({ fact, onClose }: EvidenceDrawerProps) {
  if (!fact) return null;

  const { evidence } = fact;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#262626] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
            <h3 className="font-mono text-sm font-bold text-neutral-100">Document Evidence Inspector</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-100 hover:bg-[#1f1f1f] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-mono text-neutral-500 uppercase">Fact Parameter</span>
            <h4 className="text-base font-bold font-mono text-yellow-400">{fact.label}</h4>
            <div className="text-lg font-mono text-neutral-100 mt-0.5">{fact.formatted_value}</div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#141414] border border-[#262626] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <FileText className="w-3.5 h-3.5 text-yellow-400" />
                {evidence.source}
              </span>
              {evidence.page && (
                <span className="px-2 py-0.5 rounded bg-yellow-950/40 text-yellow-300 border border-yellow-800/60 text-[11px] font-bold">
                  Page {evidence.page}
                </span>
              )}
            </div>

            {evidence.snippet && (
              <div className="p-3 rounded bg-[#0a0a0a] border border-[#262626] text-xs font-mono text-neutral-200 leading-relaxed relative">
                <Quote className="w-4 h-4 text-yellow-500/20 absolute top-2 left-2 pointer-events-none" />
                <p className="pl-4">{evidence.snippet}</p>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-1">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Confidence: {(evidence.confidence * 100).toFixed(0)}% (Nutrient Engine)
              </span>
              <span>Timestamp: {new Date(evidence.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-[#262626] bg-[#141414] text-[11px] font-mono text-neutral-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-yellow-400 shrink-0" />
            <span>
              Evidence is immutably anchored to the source document bytes and referenced in the audit trail.
            </span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-mono bg-[#1c1c1c] hover:bg-[#282828] text-neutral-200 transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
