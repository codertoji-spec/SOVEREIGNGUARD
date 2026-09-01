"use client";

import React, { useState } from "react";
import { DocumentIntegrity } from "@/types/guard";
import { ShieldCheck, Lock, FileCode, CheckCircle2, AlertOctagon, Copy, Check } from "lucide-react";

interface ContractViewerProps {
  document?: {
    title: string;
    content: string;
    html_rendered: string;
    version: number;
  };
  integrity?: DocumentIntegrity;
  onGenerateDoc?: () => void;
  isLoading?: boolean;
}

export function ContractViewer({
  document,
  integrity,
  onGenerateDoc,
  isLoading,
}: ContractViewerProps) {
  const [copied, setCopied] = useState(false);

  if (!document || !integrity) {
    return (
      <div className="p-6 rounded-xl border border-[#262626] bg-[#0d0d0d] text-center space-y-3 font-mono">
        <FileCode className="w-8 h-8 text-yellow-400 mx-auto animate-pulse" />
        <p className="text-xs text-neutral-400">
          Canonical contract generation pending.
        </p>
        {onGenerateDoc && (
          <button
            onClick={onGenerateDoc}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-xs bg-[#161616] hover:bg-[#202020] text-yellow-400 border border-yellow-500/40 transition-all font-semibold"
          >
            {isLoading ? "Compiling via Doctavian..." : "Generate Contract Document (Doctavian)"}
          </button>
        )}
      </div>
    );
  }

  const isTampered = integrity.is_tampered;

  const copyHash = () => {
    navigator.clipboard.writeText(integrity.sha256_hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 rounded-xl border border-[#262626] bg-[#0d0d0d] space-y-4 font-mono">
      {/* Integrity Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#262626] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-neutral-100">
              Canonical Contract & Cryptographic Seal
            </h3>
            <span className="text-[10px] px-2 py-0.2 rounded bg-[#181818] text-yellow-400 border border-[#333333]">
              {integrity.generator}
            </span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                integrity.integration_mode === "LIVE"
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                  : "bg-[#181818] text-neutral-400 border border-[#333333]"
              }`}
            >
              {integrity.integration_mode} MODE
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Document revision v{integrity.version}.0 deterministically compiled from approved facts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              isTampered
                ? "bg-rose-950/80 text-rose-300 border-rose-600 glow-red animate-pulse"
                : "bg-emerald-950/40 text-emerald-300 border-emerald-800/80 glow-emerald"
            }`}
          >
            {isTampered ? (
              <>
                <AlertOctagon className="w-3.5 h-3.5" /> ❌ INTEGRITY HASH MISMATCH
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" /> ✓ SHA-256 SEAL VERIFIED
              </>
            )}
          </span>
        </div>
      </div>

      {/* Cryptographic Hash Lock Box */}
      <div
        className={`p-3 rounded-lg border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
          isTampered
            ? "bg-rose-950/20 border-rose-800/60 text-rose-300"
            : "bg-[#141414] border-[#262626] text-neutral-300"
        }`}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <Lock className={`w-4 h-4 ${isTampered ? "text-rose-400 animate-bounce" : "text-yellow-400"}`} />
          <span className="text-neutral-400">SHA-256 Hash:</span>
          <span className={`font-bold tracking-wider ${isTampered ? "text-rose-400" : "text-yellow-300"}`}>
            {integrity.sha256_hash}
          </span>
          <button
            onClick={copyHash}
            className="p-1 rounded hover:bg-[#202020] text-neutral-400 hover:text-neutral-200 transition-colors"
            title="Copy Hash"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
        <span className="text-[10px] text-neutral-500">
          Generated: {new Date(integrity.generated_at).toLocaleTimeString()}
        </span>
      </div>

      {/* Rendered Document View */}
      <div
        className="rounded-lg overflow-hidden border border-[#262626] bg-[#111111]"
        dangerouslySetInnerHTML={{ __html: document.html_rendered }}
      />
    </div>
  );
}
