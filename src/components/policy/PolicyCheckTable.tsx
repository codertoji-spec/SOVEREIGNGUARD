"use client";

import React from "react";
import { PolicyEvaluation, PolicyCheckResult } from "@/types/guard";
import { CheckCircle2, AlertOctagon, AlertTriangle, ShieldCheck, FileCode, Sliders } from "lucide-react";

interface PolicyCheckTableProps {
  evaluation?: PolicyEvaluation;
  onReEvaluate?: () => void;
  isLoading?: boolean;
}

export function PolicyCheckTable({ evaluation, onReEvaluate, isLoading }: PolicyCheckTableProps) {
  if (!evaluation) {
    return (
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-950/60 text-center space-y-3">
        <Sliders className="w-8 h-8 text-cyan-400 mx-auto animate-pulse" />
        <p className="text-xs font-mono text-slate-400">
          Deterministic policy evaluation pending.
        </p>
        {onReEvaluate && (
          <button
            onClick={onReEvaluate}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-xs font-mono bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 transition-all"
          >
            {isLoading ? "Evaluating..." : "Run Policy Evaluation"}
          </button>
        )}
      </div>
    );
  }

  const { allowed, checks, violations, policy_version, evaluated_at } = evaluation;

  return (
    <div className="p-5 rounded-xl border border-[#262626] bg-[#0d0d0d] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#262626] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-sm font-bold text-neutral-100">
              Deterministic Policy Engine Evaluation
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-[#181818] text-yellow-400 border border-[#333333]">
              Policy v{policy_version}
            </span>
          </div>
          <p className="text-[11px] font-mono text-neutral-400">
            Authorization decided purely via code logic. Zero non-deterministic LLM discretion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              allowed
                ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/80 glow-emerald"
                : "bg-rose-950/80 text-rose-300 border-rose-600 glow-red animate-pulse"
            }`}
          >
            {allowed ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> POLICY COMPLIANT (PASS)
              </>
            ) : (
              <>
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" /> 🚨 POLICY VIOLATION DETECTED
              </>
            )}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-[#262626] text-neutral-400 uppercase text-[10px]">
              <th className="py-2 px-3">Invariant Rule</th>
              <th className="py-2 px-3">Requested / Actual</th>
              <th className="py-2 px-3">Policy Ceiling / Limit</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Evaluation Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262626]">
            {checks.map((c, i) => {
              const isFail = c.status === "FAIL";
              return (
                <tr
                  key={i}
                  className={`transition-colors ${
                    isFail ? "bg-rose-950/30 text-rose-200" : "hover:bg-[#141414] text-neutral-200"
                  }`}
                >
                  <td className="py-2.5 px-3 font-semibold text-neutral-100 flex items-center gap-1.5">
                    {isFail ? (
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                    <span>{c.rule_name}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`font-bold ${isFail ? "text-rose-400" : "text-yellow-300"}`}>
                      {c.field === "contract_value" && typeof c.actual_value === "number"
                        ? `$${c.actual_value.toLocaleString("en-US")} / year`
                        : c.field === "liability_cap" && typeof c.actual_value === "number"
                        ? `$${c.actual_value.toLocaleString("en-US")}`
                        : typeof c.actual_value === "number"
                        ? c.actual_value.toLocaleString("en-US")
                        : String(c.actual_value)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-neutral-300 font-semibold">
                    {c.field === "contract_value" && typeof c.allowed_value === "number"
                      ? `$${c.allowed_value.toLocaleString("en-US")} / year (Policy Ceiling)`
                      : c.field === "liability_cap" && typeof c.allowed_value === "number"
                      ? `$${c.allowed_value.toLocaleString("en-US")} (Max Cap)`
                      : Array.isArray(c.allowed_value)
                      ? c.allowed_value.join(", ")
                      : typeof c.allowed_value === "number"
                      ? c.allowed_value.toLocaleString("en-US")
                      : String(c.allowed_value)}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isFail
                          ? "bg-rose-950 text-rose-300 border border-rose-800"
                          : "bg-emerald-950/60 text-emerald-300 border border-emerald-800/60"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-neutral-400 text-[11px] leading-tight">
                    {c.message}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
