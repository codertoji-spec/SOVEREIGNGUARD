"use client";

import React, { useEffect, useState } from "react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SponsorStatus } from "@/types/guard";
import { Layers, CheckCircle2, AlertTriangle, Key, ExternalLink, ShieldCheck, RefreshCw, HelpCircle } from "lucide-react";

export default function IntegrationsPage() {
  const [sponsors, setSponsors] = useState<SponsorStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchIntegrations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/guard/integrations");
      const data = await res.json();
      if (data.sponsors) setSponsors(data.sponsors);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#060606] text-neutral-100 grid-background">
      <AppNavbar />

      <div className="flex-1 flex">
        <AppSidebar />

        <main className="flex-1 p-6 space-y-6 max-w-5xl mx-auto w-full font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#262626] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-yellow-400" />
                <h1 className="text-xl font-bold text-neutral-100">Sponsor Integrations Center</h1>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Truthful verification ledger: Real external sponsor API execution vs deterministic demo fallbacks.
              </p>
            </div>

            <button
              onClick={fetchIntegrations}
              disabled={isLoading}
              className="px-3.5 py-1.5 rounded-lg text-xs bg-[#141414] hover:bg-[#1f1f1f] text-neutral-300 border border-[#2e2e2e] transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-yellow-400" : ""}`} />
              <span>Refresh Execution Status</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sponsors.map((s) => {
              const isLive = s.status === "LIVE";
              return (
                <div
                  key={s.name}
                  className={`p-5 rounded-xl border transition-all ${
                    isLive
                      ? "border-emerald-700/80 bg-[#0d0d0d] glow-emerald"
                      : "border-[#262626] bg-[#0d0d0d] hover:border-[#383838]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-neutral-100">{s.name}</h3>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isLive
                          ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                          : "bg-yellow-950/40 text-yellow-400 border border-yellow-600/40"
                      }`}
                    >
                      {isLive ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>LIVE VERIFIED</span>
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
                          <span>DEMO MODE</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase font-semibold">Architecture Role</span>
                      <div className="text-neutral-200 mt-0.5">{s.role}</div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#141414] border border-[#262626] text-[11px] text-neutral-400 leading-relaxed">
                      {s.details}
                    </div>

                    {s.fallback_reason && !isLive && (
                      <div className="p-2.5 rounded-lg bg-yellow-950/20 border border-yellow-700/40 text-[10px] text-yellow-300/90 flex items-start gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                        <span>Fallback Reason: {s.fallback_reason}</span>
                      </div>
                    )}

                    <div className="pt-2 text-[10px] text-neutral-500 flex items-center justify-between">
                      <span>Credentials: {s.configured ? "Present in .env" : "Not Provided"}</span>
                      <span className="text-neutral-400">
                        {isLive ? "External API Success" : "Deterministic Baseline"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-5 rounded-xl border border-[#262626] bg-[#0d0d0d] text-xs space-y-2">
            <h4 className="font-bold text-neutral-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-yellow-400" />
              <span>SovereignGuard Truthfulness Guarantee</span>
            </h4>
            <p className="text-neutral-400 leading-relaxed">
              SovereignGuard guarantees that an integration is reported as <code className="text-emerald-400 font-bold">LIVE</code> only when real external sponsor API calls are executed and successfully parsed. If credentials are missing, or if an external endpoint is unreachable or returns an error, the system transparently activates a deterministic demo fixture with clear labeling so evaluations remain 100% resilient.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
