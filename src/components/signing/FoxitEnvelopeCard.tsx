"use client";

import React from "react";
import { FoxitSigningEnvelope } from "@/types/guard";
import { PenTool, CheckCircle2, ExternalLink, Lock, FileCheck2, ShieldCheck } from "lucide-react";

interface FoxitEnvelopeCardProps {
  envelope?: FoxitSigningEnvelope;
  onExecuteSign?: () => void;
  isLoading?: boolean;
}

export function FoxitEnvelopeCard({ envelope, onExecuteSign, isLoading }: FoxitEnvelopeCardProps) {
  if (!envelope) {
    return (
      <div className="p-6 rounded-xl border border-[#262626] bg-[#0d0d0d] text-center space-y-3 font-mono">
        <PenTool className="w-8 h-8 text-yellow-400 mx-auto animate-pulse" />
        <p className="text-xs text-neutral-400">
          Foxit eSign envelope creation pending human authorization.
        </p>
        {onExecuteSign && (
          <button
            onClick={onExecuteSign}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-xs bg-[#161616] hover:bg-[#202020] text-yellow-400 border border-yellow-500/40 transition-all font-semibold"
          >
            {isLoading ? "Dispatching..." : "Authorize Foxit Envelope"}
          </button>
        )}
      </div>
    );
  }

  const isLive = envelope.integration_mode === "LIVE";

  return (
    <div className="p-5 rounded-xl border border-emerald-800/80 bg-[#0d0d0d] glow-emerald space-y-4 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-900/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <span>Foxit eSign Envelope</span>
              <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                {envelope.provider}
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                  isLive
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    : "bg-[#181818] text-neutral-400 border border-[#333333]"
                }`}
              >
                {envelope.integration_mode} MODE
              </span>
            </h3>
            <p className="text-[11px] text-neutral-400">
              Envelope ID: {envelope.envelope_id} | Cryptographically Sealed
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
            isLive
              ? "bg-emerald-950/80 text-emerald-300 border-emerald-700"
              : "bg-yellow-950/40 text-yellow-300 border-yellow-700/60"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          {isLive ? "LIVE FOXIT ESIGN ENVELOPE CREATED" : "FOXIT ENVELOPE (DEMO SIMULATION)"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-[#141414] border border-[#262626] space-y-1.5">
          <div className="text-[10px] text-neutral-500 uppercase font-semibold">Authorized Signatory</div>
          {envelope.recipients.map((r, i) => (
            <div key={i} className="space-y-0.5">
              <div className="font-bold text-neutral-200">{r.name}</div>
              <div className="text-[11px] text-neutral-400">{r.email}</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3 h-3" /> Signed at: {new Date(envelope.created_at).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-lg bg-[#141414] border border-[#262626] space-y-1.5">
          <div className="text-[10px] text-neutral-500 uppercase font-semibold">Digital Audit Certificate</div>
          <div className="font-bold text-yellow-400 truncate">{envelope.audit_certificate_id}</div>
          <div className="text-[11px] text-neutral-400">
            Document Hash: <span className="font-bold text-neutral-300">{envelope.document_hash.slice(0, 16)}...</span>
          </div>
          <div className="text-[10px] text-neutral-500 pt-1">
            Certified timestamp anchored to SovereignGuard state chain.
          </div>
        </div>
      </div>

      {envelope.view_url && (
        <div className="pt-1 flex justify-end">
          <a
            href={envelope.view_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1.5 underline underline-offset-4"
          >
            <span>{isLive ? "Open Live Foxit eSign Portal" : "Inspect Simulated Envelope"}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
