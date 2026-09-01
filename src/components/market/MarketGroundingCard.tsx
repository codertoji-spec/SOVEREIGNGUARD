"use client";

import React from "react";
import { MarketEvidenceReport } from "@/types/guard";
import { Search, CheckCircle2, AlertTriangle, Globe, ExternalLink, ShieldAlert, HelpCircle, Calculator, Info } from "lucide-react";

interface MarketGroundingCardProps {
  report?: MarketEvidenceReport;
  vendorQuote?: number;
  onRefreshSearch?: () => void;
  isLoading?: boolean;
}

export function MarketGroundingCard({
  report,
  vendorQuote = 87000,
  onRefreshSearch,
  isLoading,
}: MarketGroundingCardProps) {
  if (!report) {
    return (
      <div className="p-6 rounded-xl border border-[#262626] bg-[#0d0d0d] text-center space-y-3 font-mono">
        <Search className="w-8 h-8 text-yellow-400 mx-auto animate-pulse" />
        <p className="text-xs text-neutral-400">
          Independent market pricing grounding not yet executed.
        </p>
        {onRefreshSearch && (
          <button
            onClick={onRefreshSearch}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-xs bg-[#161616] hover:bg-[#202020] text-yellow-400 border border-yellow-500/40 transition-all font-semibold"
          >
            {isLoading ? "Searching SerpApi..." : "Run SerpApi Market Grounding"}
          </button>
        )}
      </div>
    );
  }

  const { market_price_range, is_consistent, sources, status, integration_mode, evidence_classification } = report;

  return (
    <div className="p-5 rounded-xl border border-[#262626] bg-[#0d0d0d] space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#262626] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-yellow-950/40 text-yellow-400 border border-yellow-600/40">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <span>External Market Grounding</span>
              <span className="text-[10px] px-2 py-0.2 rounded bg-[#181818] text-yellow-400 border border-[#333333]">
                {report.engine}
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                  integration_mode === "LIVE"
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    : "bg-[#181818] text-neutral-400 border border-[#333333]"
                }`}
              >
                {integration_mode} MODE
              </span>
            </h3>
            <p className="text-[11px] text-neutral-400">Query: &quot;{report.query}&quot;</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === "VERIFIED" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/40 text-emerald-300 border border-emerald-800/80">
              <CheckCircle2 className="w-3.5 h-3.5" /> Price Consistent With Market
            </span>
          )}
          {status === "DEVIATION" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-950/40 text-yellow-300 border border-yellow-600/60">
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" /> External Benchmark Divergence
            </span>
          )}
          {status === "INSUFFICIENT_EXTERNAL_EVIDENCE" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#141414] text-neutral-300 border border-[#2a2a2a]">
              <HelpCircle className="w-3.5 h-3.5 text-yellow-400" /> Insufficient Pricing Evidence
            </span>
          )}
        </div>
      </div>

      {/* Crucial Axiom Banner: MARKET EVIDENCE != AUTHORIZATION */}
      <div className="p-3 rounded-lg bg-yellow-950/20 border border-yellow-600/40 flex items-start gap-2.5 text-xs text-yellow-300/90 leading-relaxed">
        <Info className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-yellow-300 font-bold uppercase tracking-wider block mb-0.5">
            Core Distinction: Market Evidence ≠ Authorization
          </strong>
          <span>
            External web benchmarks serve as advisory pricing signals — not an authorization decision. Benchmark comparability must be validated against equivalent infrastructure scope. Final commercial authorization is strictly governed by the Deterministic Policy Engine.
          </span>
        </div>
      </div>

      {/* 4-Way Distinct Evidence Classification Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3.5 rounded-lg bg-[#141414] border border-[#262626] text-xs">
        {/* 1. Direct Vendor Quote */}
        <div className="space-y-1">
          <div className="text-[10px] text-neutral-400 uppercase font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> 1. Direct Vendor Quote
          </div>
          <div className="font-bold text-neutral-100 text-sm">
            ${vendorQuote.toLocaleString("en-US")} / year
          </div>
          <p className="text-[10px] text-neutral-500">Extracted from Proposal PDF (Nutrient)</p>
        </div>

        {/* 2. Third-Party References (Raw) */}
        <div className="space-y-1 border-t md:border-t-0 md:border-l border-[#262626] pt-2 md:pt-0 md:pl-3">
          <div className="text-[10px] text-neutral-400 uppercase font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> 2. Third-Party (Raw)
          </div>
          <div className="font-bold text-amber-300 line-clamp-1">
            {evidence_classification?.third_party_pricing || "Raw snippets"}
          </div>
          <p className="text-[10px] text-neutral-500">Preserved verbatim frequency from web</p>
        </div>

        {/* 3. Normalized Annual Benchmark */}
        <div className="space-y-1 border-t md:border-t-0 md:border-l border-[#262626] pt-2 md:pt-0 md:pl-3">
          <div className="text-[10px] text-neutral-400 uppercase font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> 3. Normalized Annual
          </div>
          <div className="font-bold text-emerald-400">
            {market_price_range
              ? `$${market_price_range.min.toLocaleString("en-US")} – $${market_price_range.max.toLocaleString("en-US")} ${market_price_range.currency}/yr`
              : "Inconclusive"}
          </div>
          <p className="text-[10px] text-neutral-500">
            {market_price_range?.is_normalized ? "Mathematically normalized to annual" : "Stated as annual baseline"}
          </p>
        </div>

        {/* 4. AI Benchmark Interpretation */}
        <div className="space-y-1 border-t md:border-t-0 md:border-l border-[#262626] pt-2 md:pt-0 md:pl-3">
          <div className="text-[10px] text-neutral-400 uppercase font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> 4. AI Interpretation
          </div>
          <div className="font-bold text-yellow-300">
            {is_consistent === true
              ? "Within Search Range"
              : is_consistent === false
              ? "External Benchmark Divergence"
              : "Inconclusive Benchmark"}
          </div>
          <p className="text-[10px] text-neutral-500">Advisory signal (Non-authorizing)</p>
        </div>
      </div>

      {market_price_range?.normalization_basis && (
        <div className="p-2.5 rounded-lg bg-[#141414] border border-[#262626] text-[11px] text-neutral-300 flex items-center gap-2">
          <Calculator className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          <span><strong className="text-neutral-200">Frequency Normalization Ledger:</strong> {market_price_range.normalization_basis}</span>
        </div>
      )}

      <div className="p-3 rounded-lg bg-[#141414] border border-[#262626] text-[11px] text-neutral-300 leading-relaxed">
        {report.summary}
      </div>

      {/* Sources List */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          External Web Sources ({sources.length})
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {sources.map((src, i) => (
            <div key={i} className="p-3 rounded-lg border border-[#262626] bg-[#141414] space-y-2 flex flex-col justify-between hover:border-[#3a3a3a] transition-colors">
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-1">
                  <h5 className="text-xs font-semibold text-neutral-200 line-clamp-1">{src.title}</h5>
                  {src.link && src.link !== "#" && (
                    <a href={src.link} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-yellow-400 transition-colors">
                      <ExternalLink className="w-3 h-3 shrink-0 mt-0.5" />
                    </a>
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 line-clamp-2">{src.snippet}</p>
              </div>

              {src.raw_price_mentioned && (
                <div className="pt-2 border-t border-[#262626] space-y-1 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 uppercase font-semibold">Raw Found:</span>
                    <span className="font-bold text-yellow-300 bg-yellow-950/30 px-1.5 py-0.5 rounded border border-yellow-800/40">
                      {src.raw_price_mentioned}
                    </span>
                  </div>
                  {src.normalization_formula && (
                    <div className="text-[9px] text-emerald-400 font-mono">
                      ↳ {src.normalization_formula}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
