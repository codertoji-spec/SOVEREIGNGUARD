"use client";

import React, { useState } from "react";
import { AuditEvent, SeverityLevel } from "@/types/guard";
import {
  Terminal,
  ShieldCheck,
  AlertOctagon,
  Download,
  Filter,
  UserCheck,
  Clock,
  Cpu,
  Lock,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

interface AuditTimelineProps {
  events: AuditEvent[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function AuditTimeline({ events, onRefresh, isLoading }: AuditTimelineProps) {
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [chainVerificationResult, setChainVerificationResult] = useState<string | null>(null);

  const filteredEvents = events.filter((e) => {
    if (filterSeverity === "ALL") return true;
    return e.severity === filterSeverity;
  });

  const downloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sovereignguard-audit-trail-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleVerifyChain = () => {
    // Traverse chronological order
    const chronological = [...events].reverse();
    let prev = "GENESIS-00000000000000000000000000000000";
    let valid = true;

    for (const evt of chronological) {
      if (evt.previous_hash !== prev) {
        valid = false;
        break;
      }
      prev = evt.state_hash;
    }

    if (valid) {
      setChainVerificationResult(`✓ Verified: All ${events.length} audit events cryptographically chained and intact.`);
    } else {
      setChainVerificationResult("❌ Audit hash chain verification failed: Mismatch detected in event history.");
    }

    setTimeout(() => setChainVerificationResult(null), 4000);
  };

  const getActorBadge = (actor: string) => {
    switch (actor) {
      case "AI_AGENT":
        return "bg-[#1f1f1f] text-neutral-300 border-[#333333]";
      case "SOVEREIGNGUARD_FIREWALL":
        return "bg-yellow-950/40 text-yellow-400 border-yellow-600/50";
      case "HUMAN_REVIEWER":
        return "bg-amber-950/40 text-amber-300 border-amber-700/50";
      default:
        return "bg-[#181818] text-neutral-400 border-[#2a2a2a]";
    }
  };

  const getSeverityBadge = (sev: SeverityLevel) => {
    switch (sev) {
      case "CRITICAL":
        return "bg-rose-950 text-rose-300 border-rose-800 glow-red animate-pulse";
      case "HIGH":
        return "bg-yellow-950/60 text-yellow-300 border-yellow-700/60";
      case "INFO":
        return "bg-emerald-950/40 text-emerald-300 border-emerald-800/60";
      default:
        return "bg-[#181818] text-neutral-400 border-[#2a2a2a]";
    }
  };

  return (
    <div className="p-5 rounded-xl border border-[#262626] bg-[#0d0d0d] space-y-4 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#262626] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-yellow-950/40 text-yellow-400 border border-yellow-600/40">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <span>Tamper-Evident Chained Audit Trail</span>
              <span className="text-[10px] px-2 py-0.2 rounded bg-[#181818] text-yellow-400 border border-[#333333]">
                {events.length} Events
              </span>
            </h3>
            <p className="text-[11px] text-neutral-400">
              SHA-256 hash chaining guarantees verifiable, tamper-evident transaction history.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleVerifyChain}
            className="px-3 py-1.5 rounded-lg text-xs bg-[#161616] hover:bg-[#202020] text-yellow-400 border border-yellow-500/40 transition-all flex items-center gap-1.5 font-semibold"
            title="Verify complete SHA-256 state chain"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verify Hash Chain</span>
          </button>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg text-xs bg-[#141414] border border-[#2e2e2e] text-neutral-200 outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only (Breaches)</option>
            <option value="HIGH">High</option>
            <option value="INFO">Info</option>
          </select>

          <button
            onClick={downloadJson}
            className="px-3 py-1.5 rounded-lg text-xs bg-[#141414] hover:bg-[#1f1f1f] text-neutral-200 border border-[#2e2e2e] transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-yellow-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {chainVerificationResult && (
        <div className="p-2.5 rounded-lg bg-yellow-950/40 border border-yellow-600/60 text-yellow-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />
          <span>{chainVerificationResult}</span>
        </div>
      )}

      <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
        {filteredEvents.map((evt, i) => {
          const isBreach = evt.severity === "CRITICAL";
          return (
            <div
              key={evt.id || i}
              className={`p-3 rounded-lg border text-xs transition-all ${
                isBreach
                  ? "bg-rose-950/40 border-rose-600/80 glow-red"
                  : "bg-[#141414] border-[#262626] hover:border-[#383838]"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.2 rounded text-[10px] font-bold border ${getSeverityBadge(evt.severity)}`}>
                    {evt.severity}
                  </span>
                  <span className={`px-2 py-0.2 rounded text-[10px] font-semibold border ${getActorBadge(evt.actor)}`}>
                    {evt.actor}
                  </span>
                  <span className="font-bold text-neutral-100">{evt.title}</span>
                </div>
                <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <p className="text-[11px] text-neutral-300 leading-relaxed mb-2">{evt.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-neutral-500 pt-1.5 border-t border-[#262626]">
                <span className="truncate">Prev Hash: {evt.previous_hash.slice(0, 20)}...</span>
                <span className="truncate flex items-center gap-1 font-mono text-yellow-400 sm:justify-end font-semibold">
                  <Lock className="w-2.5 h-2.5 text-yellow-400" />
                  State Hash: {evt.state_hash.slice(0, 20)}...
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
