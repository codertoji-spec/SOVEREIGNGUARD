"use client";

import React, { useEffect, useState } from "react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { GuardPolicy } from "@/types/guard";
import { Sliders, Save, CheckCircle2, AlertTriangle, ShieldCheck, Plus, Trash2 } from "lucide-react";

export default function PoliciesPage() {
  const [policy, setPolicy] = useState<GuardPolicy | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/guard/policies")
      .then((res) => res.json())
      .then((data) => {
        if (data.policy) setPolicy(data.policy);
      });
  }, []);

  const handleSave = async () => {
    if (!policy) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/guard/policies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(policy),
      });
      const data = await res.json();
      if (data.policy) {
        setPolicy(data.policy);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060606] text-neutral-100 grid-background">
      <AppNavbar />

      <div className="flex-1 flex">
        <AppSidebar />

        <main className="flex-1 p-6 space-y-6 max-w-5xl mx-auto w-full font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262626] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-yellow-400" />
                <h1 className="text-xl font-bold text-neutral-100">Enterprise Invariant Policy Manager</h1>
                <span className="text-xs px-2 py-0.5 rounded bg-[#181818] text-yellow-400 border border-[#333333]">
                  v{policy?.version || "1.4.0"}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Configure deterministic authorization bounds governing all autonomous procurement agent actions.
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-lg text-xs font-bold bg-yellow-400 hover:bg-yellow-300 text-black shadow-lg shadow-yellow-500/20 transition-all flex items-center gap-2 self-start sm:self-auto hover:scale-105"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Updating Version..." : "Save & Bump Policy Version"}</span>
            </button>
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Policy rules updated and incremented to v{policy?.version}. Changes enforced immediately.</span>
            </div>
          )}

          {policy && (
            <div className="space-y-6">
              {/* Core Limits */}
              <div className="p-5 rounded-xl border border-[#262626] bg-[#0d0d0d] space-y-4">
                <h3 className="text-sm font-bold text-neutral-100 uppercase tracking-wider">
                  Numerical Risk Limits
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-neutral-400 mb-1">Maximum Contract Value (USD)</label>
                    <input
                      type="number"
                      value={policy.rules.max_contract_value}
                      onChange={(e) =>
                        setPolicy({
                          ...policy,
                          rules: { ...policy.rules, max_contract_value: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#2e2e2e] text-emerald-400 font-bold focus:border-yellow-500 outline-none"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">Default: $100,000 (Policy Ceiling)</span>
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">Maximum Aggregate Liability Cap (USD)</label>
                    <input
                      type="number"
                      value={policy.rules.max_liability}
                      onChange={(e) =>
                        setPolicy({
                          ...policy,
                          rules: { ...policy.rules, max_liability: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#2e2e2e] text-yellow-300 font-bold focus:border-yellow-500 outline-none"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">Default: $250,000 (Max Cap)</span>
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">Minimum Uptime SLA (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={policy.rules.min_sla}
                      onChange={(e) =>
                        setPolicy({
                          ...policy,
                          rules: { ...policy.rules, min_sla: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#2e2e2e] text-yellow-400 font-bold focus:border-yellow-500 outline-none"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">Default: 99.9%</span>
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">Maximum Term Duration (Months)</label>
                    <input
                      type="number"
                      value={policy.rules.max_term_months}
                      onChange={(e) =>
                        setPolicy({
                          ...policy,
                          rules: { ...policy.rules, max_term_months: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#2e2e2e] text-neutral-200 font-bold focus:border-yellow-500 outline-none"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">Default: 12 Months</span>
                  </div>
                </div>
              </div>

              {/* Human Approval Toggle */}
              <div className="p-5 rounded-xl border border-[#262626] bg-[#0d0d0d] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-neutral-100">Mandatory Human Authorization Gate</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Require executive e-signature before any Foxit envelope dispatch.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policy.rules.human_approval_required}
                    onChange={(e) =>
                      setPolicy({
                        ...policy,
                        rules: { ...policy.rules, human_approval_required: e.target.checked },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#262626] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
                </label>
              </div>

              {/* Allowed Vendors Whitelist */}
              <div className="p-5 rounded-xl border border-[#262626] bg-[#0d0d0d] space-y-3">
                <h4 className="text-sm font-bold text-neutral-100">Authorized Vendor Allowlist</h4>
                <div className="flex flex-wrap gap-2">
                  {policy.rules.allowed_vendors.map((vendor, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg text-xs bg-[#141414] border border-[#2e2e2e] text-neutral-200"
                    >
                      {vendor}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
