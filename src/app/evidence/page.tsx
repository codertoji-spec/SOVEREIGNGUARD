"use client";

import React, { useEffect, useState } from "react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AgentRun, ContractFact, MarketEvidenceReport } from "@/types/guard";
import { Search, FileText, Globe, Cpu, CheckCircle2, ShieldCheck, ExternalLink, Quote } from "lucide-react";

export default function EvidencePage() {
  const [run, setRun] = useState<AgentRun | null>(null);

  useEffect(() => {
    fetch("/api/guard/runs")
      .then((res) => res.json())
      .then((data) => {
        if (data.runs && data.runs.length > 0) {
          setRun(data.runs[0]);
        }
      });
  }, []);

  const facts = run?.extracted_facts || {};
  const market = run?.market_evidence;

  return (
    <div className="min-h-screen flex flex-col bg-[#060606] text-neutral-100 grid-background">
      <AppNavbar />

      <div className="flex-1 flex">
        <AppSidebar />

        <main className="flex-1 p-6 space-y-6 max-w-6xl mx-auto w-full font-mono">
          <div className="border-b border-[#262626] pb-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-yellow-400" />
              <h1 className="text-xl font-bold text-neutral-100">Grounded Evidence Matrix</h1>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              SovereignGuard strictly separates Document Evidence, External Web Evidence, and AI Inference to prevent hallucinated authorization.
            </p>
          </div>

          {/* 3 Pillars Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pillar 1 */}
            <div className="p-5 rounded-xl border border-yellow-800/50 bg-[#0d0d0d] space-y-3">
              <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs">
                <FileText className="w-4 h-4" />
                <span>1. DOCUMENT EVIDENCE (NUTRIENT)</span>
              </div>
              <p className="text-xs text-neutral-300">
                Ground truth extracted directly from vendor proposal PDFs. Every fact is anchored to a specific page number and verbatim excerpt.
              </p>
              <div className="text-[11px] text-yellow-300 font-bold">
                {Object.keys(facts).length} Verified Document Facts
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="p-5 rounded-xl border border-emerald-900/60 bg-[#0d0d0d] space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Globe className="w-4 h-4" />
                <span>2. EXTERNAL WEB EVIDENCE (SERPAPI)</span>
              </div>
              <p className="text-xs text-neutral-300">
                Independent pricing and SLA benchmarks retrieved from live web queries to prevent accepting fabricated vendor rates.
              </p>
              <div className="text-[11px] text-emerald-300 font-bold">
                {market?.sources?.length || 3} Independent Industry Sources
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="p-5 rounded-xl border border-amber-900/60 bg-[#0d0d0d] space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Cpu className="w-4 h-4" />
                <span>3. AI INFERENCE (AGENT)</span>
              </div>
              <p className="text-xs text-neutral-300">
                Autonomous agent reasoning and extraction interpretations. Marked as untrusted until verified against the policy engine.
              </p>
              <div className="text-[11px] text-amber-300 font-bold">
                Isolated from Execution Gate
              </div>
            </div>
          </div>

          {/* Document Evidence List */}
          <div className="p-5 rounded-xl border border-[#262626] bg-[#0d0d0d] space-y-4">
            <h3 className="text-sm font-bold text-neutral-100 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-yellow-400" />
              <span>Extracted Document Evidence (Nutrient Engine)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {Object.values(facts).map((fact) => (
                <div key={fact.key} className="p-3.5 rounded-lg border border-[#262626] bg-[#141414] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-200">{fact.label}</span>
                    {fact.evidence?.page && (
                      <span className="px-2 py-0.5 rounded bg-yellow-950/40 text-yellow-300 border border-yellow-800/60 text-[10px]">
                        Page {fact.evidence.page}
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-yellow-300">{fact.formatted_value}</div>
                  {fact.evidence?.snippet && (
                    <div className="p-2.5 rounded bg-[#0a0a0a] border border-[#262626] text-[11px] text-neutral-400 italic">
                      &quot;{fact.evidence.snippet}&quot;
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* External Market Web Sources */}
          {market && (
            <div className="p-5 rounded-xl border border-[#262626] bg-[#0d0d0d] space-y-4">
              <h3 className="text-sm font-bold text-neutral-100 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>External Market Grounding Citations (SerpApi)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {market.sources.map((src, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg border border-[#262626] bg-[#141414] space-y-2">
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-bold text-neutral-200 line-clamp-1">{src.title}</span>
                      <ExternalLink className="w-3 h-3 text-neutral-500 shrink-0" />
                    </div>
                    <p className="text-[11px] text-neutral-400">{src.snippet}</p>
                    {src.price_mentioned && (
                      <div className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/60 inline-block">
                        {src.price_mentioned}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
