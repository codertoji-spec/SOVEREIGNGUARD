import React from "react";
import { SponsorStatus } from "@/types/guard";
import { CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";

interface SponsorPillProps {
  sponsor: SponsorStatus;
}

export function SponsorPill({ sponsor }: SponsorPillProps) {
  const isLive = sponsor.status === "LIVE";

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border transition-all ${
        isLive
          ? "bg-emerald-950/40 text-emerald-300 border-emerald-700/60 glow-emerald"
          : "bg-[#141414] text-neutral-400 border-[#2a2a2a]"
      }`}
      title={`${sponsor.name}: ${sponsor.details}`}
    >
      <span className="font-semibold text-neutral-200">{sponsor.name}</span>
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold ${
          isLive
            ? "bg-emerald-500/20 text-emerald-300"
            : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
        }`}
      >
        {isLive ? (
          <>
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
            <span>LIVE</span>
          </>
        ) : (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
            <span>DEMO</span>
          </>
        )}
      </span>
    </div>
  );
}
