"use client";

import React, { useState } from "react";
import { UserCheck, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Lock } from "lucide-react";
import { ContractFact, PolicyEvaluation, DocumentIntegrity } from "@/types/guard";

interface ApprovalGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (data: { name: string; email: string; role: string; comments: string }) => void;
  onReject: (comments: string) => void;
  facts: Record<string, ContractFact>;
  policyEvaluation?: PolicyEvaluation;
  integrity?: DocumentIntegrity;
  isLoading?: boolean;
  error?: string | null;
}

export function ApprovalGateModal({
  isOpen,
  onClose,
  onApprove,
  onReject,
  facts,
  policyEvaluation,
  integrity,
  isLoading,
  error,
}: ApprovalGateModalProps) {
  const [reviewerName, setReviewerName] = useState("Sarah Jenkins");
  const [reviewerEmail, setReviewerEmail] = useState("s.jenkins@enterprise.corp");
  const [reviewerRole, setReviewerRole] = useState("Chief Procurement Officer");
  const [comments, setComments] = useState("Approved. All terms verified within budget and risk limits.");
  const [isRejecting, setIsRejecting] = useState(false);

  if (!isOpen) return null;

  const vendorName = String(facts["vendor_name"]?.formatted_value || "Acme Cloud");
  const price = String(facts["contract_value"]?.formatted_value || "$87,000.00 USD");
  const liability = String(facts["liability_cap"]?.formatted_value || "$200,000.00 USD");
  const sla = String(facts["sla_uptime"]?.formatted_value || "99.9% Uptime");

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f0f0f] border border-[#2e2e2e] rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-scale-up">
        <div className="flex items-center justify-between border-b border-[#262626] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-yellow-950/40 text-yellow-400 border border-yellow-600/40">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono text-base font-bold text-neutral-100">
                Human In-The-Loop Authorization Gate
              </h3>
              <p className="text-xs font-mono text-neutral-400">
                Mandatory human executive sign-off prior to irreversible Foxit eSign dispatch.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 font-mono text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Contract Verification Summary Card */}
        <div className="p-4 rounded-lg bg-[#141414] border border-[#262626] space-y-3 font-mono text-xs">
          <div className="text-[11px] text-neutral-400 uppercase font-semibold">Contract Review Summary</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-neutral-200">
            <div>
              <span className="text-[10px] text-neutral-500">Vendor</span>
              <div className="font-bold text-yellow-400 truncate">{vendorName}</div>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500">Contract Value</span>
              <div className="font-bold text-emerald-400">{price}</div>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500">Liability Cap</span>
              <div className="font-bold text-amber-300">{liability}</div>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500">SLA Guarantee</span>
              <div className="font-bold text-yellow-300">{sla}</div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#262626] flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Policy: COMPLIANT (Deterministic PASS)
            </span>
            <span className="flex items-center gap-1 text-yellow-400 truncate max-w-xs font-mono">
              <Lock className="w-3.5 h-3.5" /> Hash: {integrity?.sha256_hash.slice(0, 16)}...
            </span>
          </div>
        </div>

        {/* Reviewer Inputs */}
        <div className="space-y-3 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 mb-1">Reviewer Name</label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#2e2e2e] text-neutral-100 focus:border-yellow-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Reviewer Email</label>
              <input
                type="email"
                value={reviewerEmail}
                onChange={(e) => setReviewerEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#2e2e2e] text-neutral-100 focus:border-yellow-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 mb-1">Corporate Officer Role</label>
            <input
              type="text"
              value={reviewerRole}
              onChange={(e) => setReviewerRole(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#2e2e2e] text-neutral-100 focus:border-yellow-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-neutral-400 mb-1">Authorization Comments</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-[#2e2e2e] text-neutral-100 focus:border-yellow-500 outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-[#262626]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-mono bg-[#181818] hover:bg-[#222222] text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onReject(comments)}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 transition-all flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject Contract</span>
            </button>

            <button
              onClick={() =>
                onApprove({
                  name: reviewerName,
                  email: reviewerEmail,
                  role: reviewerRole,
                  comments,
                })
              }
              disabled={isLoading}
              className="px-5 py-2 rounded-lg text-xs font-mono font-bold bg-yellow-400 hover:bg-yellow-300 text-black shadow-lg shadow-yellow-500/20 transition-all flex items-center gap-2 hover:scale-[1.02]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isLoading ? "Signing..." : "Approve & Authorize eSign"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
