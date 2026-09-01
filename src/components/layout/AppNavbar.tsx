"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, RotateCcw, Cpu } from "lucide-react";
import { SponsorStatus, IntegrationMode, AgentRun } from "@/types/guard";
import { SponsorPill } from "./SponsorPill";

interface AppNavbarProps {
  onResetDemo?: () => void;
  isResetting?: boolean;
  activeRun?: AgentRun | null;
  sponsorModes?: {
    nutrient?: IntegrationMode;
    serpapi?: IntegrationMode;
    doctavian?: IntegrationMode;
    foxit?: IntegrationMode;
  };
}

export function AppNavbar({ onResetDemo, isResetting, activeRun, sponsorModes }: AppNavbarProps) {
  const [sponsors, setSponsors] = useState<SponsorStatus[]>([]);

  const fetchIntegrations = () => {
    const url = activeRun?.id ? `/api/guard/integrations?runId=${activeRun.id}` : "/api/guard/integrations";
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.sponsors) setSponsors(data.sponsors);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchIntegrations();
  }, [activeRun?.id, activeRun?.status, sponsorModes]);

  // Dynamically overlay active run sponsor modes if available
  const displaySponsors = sponsors.map((s) => {
    if (s.name === "Nutrient" && sponsorModes?.nutrient) {
      return { ...s, status: sponsorModes.nutrient };
    }
    if (s.name === "SerpApi" && sponsorModes?.serpapi) {
      return { ...s, status: sponsorModes.serpapi };
    }
    if (s.name === "Doctavian" && sponsorModes?.doctavian) {
      return { ...s, status: sponsorModes.doctavian };
    }
    if (s.name === "Foxit eSign" && sponsorModes?.foxit) {
      return { ...s, status: sponsorModes.foxit };
    }
    return s;
  });

  return (
    <header className="h-16 border-b border-[#262626] bg-[#0a0a0a]/95 backdrop-blur sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/console" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-[#181818] border border-yellow-500/40 p-0.5 shadow-md shadow-yellow-500/10 group-hover:border-yellow-400 transition-all">
            <div className="w-full h-full bg-[#0d0d0d] rounded-[6px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-neutral-100">
                SOVEREIGN<span className="text-yellow-400">GUARD</span>
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-yellow-950/40 text-yellow-400 border border-yellow-600/40">
                FIREWALL V1.4
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono tracking-tight -mt-0.5">
              The Authorization Firewall for AI Agents
            </p>
          </div>
        </Link>
      </div>

      <div className="hidden lg:flex items-center gap-2">
        <span className="text-[11px] text-neutral-500 font-mono uppercase mr-1">Sponsor Gateways:</span>
        {displaySponsors.map((s) => (
          <SponsorPill key={s.name} sponsor={s} />
        ))}
      </div>

      <div className="flex items-center gap-3">
        {onResetDemo && (
          <button
            onClick={onResetDemo}
            disabled={isResetting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono bg-[#141414] hover:bg-[#1f1f1f] text-neutral-300 border border-[#2a2a2a] hover:border-yellow-500/40 transition-all disabled:opacity-50"
            title="Reset to clean Acme Cloud demo state"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin text-yellow-400" : "text-neutral-400"}`} />
            <span>{isResetting ? "Resetting..." : "Reset Demo"}</span>
          </button>
        )}

        <Link
          href="/"
          className="px-3 py-1.5 rounded-md text-xs font-mono bg-[#141414] hover:bg-[#1a1a1a] text-yellow-400 border border-yellow-500/30 hover:border-yellow-400/60 transition-all flex items-center gap-1.5"
        >
          <Cpu className="w-3.5 h-3.5 text-yellow-400" />
          <span>Story / Manifesto</span>
        </Link>
      </div>
    </header>
  );
}
