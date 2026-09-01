"use client";

import React, { useEffect, useState } from "react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { PipelineStepper } from "@/components/pipeline/PipelineStepper";
import { FactCard } from "@/components/extraction/FactCard";
import { EvidenceDrawer } from "@/components/extraction/EvidenceDrawer";
import { MarketGroundingCard } from "@/components/market/MarketGroundingCard";
import { PolicyCheckTable } from "@/components/policy/PolicyCheckTable";
import { ContractViewer } from "@/components/document/ContractViewer";
import { TamperBreachBanner } from "@/components/tamper/TamperBreachBanner";
import { ApprovalGateModal } from "@/components/approval/ApprovalGateModal";
import { FoxitEnvelopeCard } from "@/components/signing/FoxitEnvelopeCard";
import { AuditTimeline } from "@/components/audit/AuditTimeline";
import { AgentRun, ContractFact, AuditEvent } from "@/types/guard";
import {
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertOctagon,
  FileText,
  UserCheck,
  Lock,
  ArrowRight,
  Terminal,
} from "lucide-react";

export default function ConsolePage() {
  const [run, setRun] = useState<AgentRun | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedFact, setSelectedFact] = useState<ContractFact | null>(null);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);

  const fetchRun = async (runId?: string) => {
    try {
      const res = await fetch("/api/guard/runs");
      const data = await res.json();
      if (data.runs && data.runs.length > 0) {
        const currentRun = runId
          ? data.runs.find((r: AgentRun) => r.id === runId) || data.runs[0]
          : data.runs[0];
        setRun(currentRun);
        fetchAudit(currentRun.id);
      }
    } catch (err) {
      console.error("Failed to fetch runs:", err);
    }
  };

  const fetchAudit = async (runId?: string) => {
    try {
      const res = await fetch(`/api/guard/audit?runId=${runId || ""}`);
      const data = await res.json();
      if (data.events) {
        setAuditEvents(data.events);
      }
    } catch (err) {
      console.error("Failed to fetch audit events:", err);
    }
  };

  useEffect(() => {
    fetchRun();
  }, []);

  // Step 2: Nutrient Extraction
  const handleExtract = async () => {
    if (!run) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/guard/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: run.id }),
      });
      const data = await res.json();
      if (data.run) {
        setRun(data.run);
        setActiveStep(2);
        fetchAudit(run.id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: SerpApi Grounding
  const handleVerifyMarket = async () => {
    if (!run) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/guard/verify-market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: run.id }),
      });
      const data = await res.json();
      if (data.run) {
        setRun(data.run);
        setActiveStep(3);
        fetchAudit(run.id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: Policy Evaluation
  const handleEvaluatePolicy = async () => {
    if (!run) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/guard/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: run.id }),
      });
      const data = await res.json();
      if (data.run) {
        setRun(data.run);
        setActiveStep(4);
        fetchAudit(run.id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 5: Doctavian Document Generation
  const handleGenerateDoc = async () => {
    if (!run) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/guard/generate-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: run.id }),
      });
      const data = await res.json();
      if (data.run) {
        setRun(data.run);
        setActiveStep(5);
        fetchAudit(run.id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 6: THE ATTACK / TAMPER SIMULATION
  const handleTamperAttack = async () => {
    if (!run) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/guard/tamper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: run.id }),
      });
      const data = await res.json();
      if (data.run) {
        setRun(data.run);
        setActiveStep(6);
        fetchAudit(run.id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Restore Baseline
  const handleRestoreBaseline = async () => {
    if (!run) return;
    setIsLoading(true);
    try {
      // Re-run extraction, evaluation, generation
      await handleExtract();
      await handleEvaluatePolicy();
      await handleGenerateDoc();
      setActiveStep(6);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 7: Human Authorization Gate
  const handleHumanApprove = async (reviewerData: {
    name: string;
    email: string;
    role: string;
    comments: string;
  }) => {
    if (!run) return;
    setIsLoading(true);
    setApprovalError(null);
    try {
      const res = await fetch("/api/guard/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runId: run.id,
          reviewerName: reviewerData.name,
          reviewerEmail: reviewerData.email,
          reviewerRole: reviewerData.role,
          comments: reviewerData.comments,
          action: "APPROVE",
        }),
      });
      const data = await res.json();
      if (data.success && data.run) {
        setRun(data.run);
        setIsApprovalOpen(false);
        setApprovalError(null);
        setActiveStep(7);
        fetchAudit(run.id);
        // Automatically dispatch Foxit eSign envelope
        if (data.signatureToken) {
          handleExecuteSign(data.signatureToken);
        }
      } else {
        setApprovalError(data.error || "Approval failed. Please ensure policy check passed.");
      }
    } catch (err: any) {
      setApprovalError(err.message || "Network request failed while authorizing");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHumanReject = async (comments: string) => {
    if (!run) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/guard/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runId: run.id,
          comments,
          action: "REJECT",
        }),
      });
      const data = await res.json();
      if (data.run) {
        setRun(data.run);
        setIsApprovalOpen(false);
        fetchAudit(run.id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 8: Foxit eSign Envelope Dispatch
  const handleExecuteSign = async (token?: string) => {
    if (!run) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/guard/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runId: run.id,
          signatureToken: token || run.human_approval?.signature_token,
        }),
      });
      const data = await res.json();
      if (data.run) {
        setRun(data.run);
        setActiveStep(8);
        fetchAudit(run.id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reset demo
  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      const res = await fetch("/api/guard/reset", { method: "POST" });
      const data = await res.json();
      if (data.run) {
        setRun(data.run);
        setActiveStep(1);
        fetchAudit(data.run.id);
      }
    } finally {
      setIsResetting(false);
    }
  };

  // Quick 1-Click Interactive Demo Autoplay
  const handleAutoplayDemo = async () => {
    if (isAutoPlaying) return;
    setIsAutoPlaying(true);
    try {
      await handleResetDemo();
      await new Promise((r) => setTimeout(r, 600));
      await handleExtract();
      await new Promise((r) => setTimeout(r, 700));
      await handleVerifyMarket();
      await new Promise((r) => setTimeout(r, 700));
      await handleEvaluatePolicy();
      await new Promise((r) => setTimeout(r, 700));
      await handleGenerateDoc();
      setActiveStep(6);
    } finally {
      setIsAutoPlaying(false);
    }
  };

  const isTampered = Boolean(run?.is_attack_simulated);

  return (
    <div className="min-h-screen flex flex-col bg-[#060606] text-neutral-100 grid-background">
      <AppNavbar
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
        activeRun={run}
        sponsorModes={run?.sponsor_modes}
      />

      <div className="flex-1 flex">
        <AppSidebar />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full font-mono">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Protected Agents */}
            <div className="p-4 rounded-xl border border-[#262626] bg-[#0d0d0d] shadow-md hover:border-[#3a3a3a] transition-colors">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-semibold uppercase tracking-wider">PROTECTED AGENTS</span>
                <Cpu className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="text-xl font-bold text-neutral-100 mt-1">1 Active Fleet</div>
              <p className="text-[11px] text-neutral-500 mt-0.5">Procurement Worker #09</p>
            </div>

            {/* Card 2: Incursions Neutralized */}
            <div className={`p-4 rounded-xl border bg-[#0d0d0d] shadow-md transition-colors ${
              isTampered ? "border-rose-600/80 glow-red" : "border-[#262626] hover:border-[#3a3a3a]"
            }`}>
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-semibold uppercase tracking-wider">INCURSIONS NEUTRALIZED</span>
                <ShieldAlert className={`w-4 h-4 ${isTampered ? "text-rose-400 animate-pulse" : "text-neutral-500"}`} />
              </div>
              <div className={`text-xl font-bold mt-1 ${isTampered ? "text-rose-400" : "text-neutral-200"}`}>
                {isTampered ? "1 BREACH BLOCKED" : "0 Breaches"}
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">Fail-Closed Boundary Active</p>
            </div>

            {/* Card 3: Policy Compliance */}
            <div className={`p-4 rounded-xl border bg-[#0d0d0d] shadow-md transition-colors ${
              run?.policy_evaluation?.allowed
                ? "border-emerald-800/80 glow-emerald"
                : isTampered
                ? "border-rose-600/80 glow-red"
                : "border-[#262626]"
            }`}>
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-semibold uppercase tracking-wider">POLICY COMPLIANCE</span>
                <ShieldCheck className={`w-4 h-4 ${
                  run?.policy_evaluation?.allowed
                    ? "text-emerald-400"
                    : isTampered
                    ? "text-rose-400"
                    : "text-yellow-400"
                }`} />
              </div>
              <div className={`text-xl font-bold mt-1 ${
                run?.policy_evaluation?.allowed
                  ? "text-emerald-400"
                  : isTampered
                  ? "text-rose-400"
                  : "text-neutral-200"
              }`}>
                {run?.policy_evaluation?.allowed ? "100% INVARIANT BOUND" : isTampered ? "POLICY VIOLATION" : "READY"}
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">Deterministic Engine v1.4</p>
            </div>

            {/* Card 4: Cryptographic Seal */}
            <div className={`p-4 rounded-xl border bg-[#0d0d0d] shadow-md transition-colors ${
              isTampered
                ? "border-rose-600/80 glow-red"
                : run?.document_integrity?.sha256_hash
                ? "border-emerald-800/80 glow-emerald"
                : "border-[#262626]"
            }`}>
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-semibold uppercase tracking-wider">CRYPTOGRAPHIC SEAL</span>
                {isTampered ? (
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                ) : run?.document_integrity?.sha256_hash ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Lock className="w-4 h-4 text-neutral-500" />
                )}
              </div>
              <div
                className={`text-xl font-bold mt-1 ${
                  isTampered
                    ? "text-rose-400"
                    : run?.document_integrity?.sha256_hash
                    ? "text-emerald-400"
                    : "text-neutral-400"
                }`}
              >
                {isTampered
                  ? "TAMPERED / INVALID"
                  : run?.document_integrity?.sha256_hash
                  ? "SEALED / VERIFIED"
                  : "UNSEALED"}
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5 truncate">
                {isTampered
                  ? "Hash Mismatch Detected"
                  : run?.document_integrity?.sha256_hash
                  ? `${run.document_integrity.sha256_hash.slice(0, 14)}... (Verified)`
                  : "Awaiting Generation"}
              </p>
            </div>
          </div>

          {/* Quick Autoplay Banner */}
          <div className="p-3.5 rounded-xl border border-yellow-600/40 bg-[#0d0d0d] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
              <div>
                <span className="text-xs font-bold text-neutral-200">
                  Live Hackathon Demonstration Engine:
                </span>
                <span className="text-xs text-yellow-400 ml-1.5 font-semibold">
                  &quot;Negotiate 12-month Acme Cloud SaaS contract ($87k price, $200k liability, 99.9% SLA)&quot;
                </span>
              </div>
            </div>

            <button
              onClick={handleAutoplayDemo}
              disabled={isAutoPlaying || isLoading}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-yellow-400 hover:bg-yellow-300 text-black shadow-md shadow-yellow-500/20 transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50 hover:scale-[1.02]"
            >
              <Play className={`w-3.5 h-3.5 fill-black ${isAutoPlaying ? "animate-spin" : ""}`} />
              <span>{isAutoPlaying ? "Running Demo Sequence..." : "1-Click Walkthrough"}</span>
            </button>
          </div>

          {/* 8-Stage Pipeline Visualizer */}
          <PipelineStepper
            status={run?.status || "INITIALIZED"}
            isTampered={isTampered}
            activeStep={activeStep}
            onSelectStep={(s) => {
              setActiveStep(s);
              if (s === 7) {
                setApprovalError(null);
                setIsApprovalOpen(true);
              }
            }}
            run={run}
          />

          {/* Killer Tamper Attack Banner (Always Accessible) */}
          <TamperBreachBanner
            isTampered={isTampered}
            onSimulateTamper={handleTamperAttack}
            onRestoreBaseline={handleRestoreBaseline}
            isLoading={isLoading}
            documentIntegrity={run?.document_integrity}
            policyEvaluation={run?.policy_evaluation}
            blockedReason={run?.blocked_reason}
          />

          {/* Step 1: Agent Request / Intent */}
          <div className="p-5 rounded-xl border border-[#262626] bg-[#0d0d0d] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#262626] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-yellow-950/40 text-yellow-400 border border-yellow-600/40">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                    <span>Step 1 — Autonomous Agent Request & Intent</span>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-[#181818] text-yellow-400 border border-[#333333]">
                      {run?.agent_intent?.agent_id || "AGENT-09"}
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Model: {run?.agent_intent?.agent_model}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExtract}
                  disabled={isLoading}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#141414] hover:bg-[#1f1f1f] text-yellow-400 border border-yellow-500/40 transition-all flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Extract Facts (Nutrient)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#141414] border border-[#262626]">
                <span className="text-[10px] text-neutral-500 uppercase font-semibold">Vendor Target</span>
                <div className="font-bold text-neutral-200">{run?.agent_intent?.vendor}</div>
              </div>
              <div className="p-3 rounded-lg bg-[#141414] border border-[#262626]">
                <span className="text-[10px] text-neutral-500 uppercase font-semibold">Contract Type</span>
                <div className="font-bold text-neutral-200">Enterprise SaaS</div>
              </div>
              <div className="p-3 rounded-lg bg-[#141414] border border-[#262626]">
                <span className="text-[10px] text-neutral-500 uppercase font-semibold">Requested Value</span>
                <div className="font-bold text-emerald-400">
                  ${run?.agent_intent?.requested_price?.toLocaleString("en-US")} / year
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#141414] border border-[#262626]">
                <span className="text-[10px] text-neutral-500 uppercase font-semibold">Human Approval</span>
                <div className="font-bold text-yellow-400">MANDATORY</div>
              </div>
            </div>
          </div>

          {/* Step 2: Nutrient Extraction & Facts */}
          {run && Object.keys(run.extracted_facts).length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                  <h3 className="text-sm font-bold text-neutral-100">
                    Step 2 — Structured Document Extraction (Nutrient Engine)
                  </h3>
                  <span className="text-[10px] px-2 py-0.2 rounded bg-[#181818] text-yellow-400 border border-[#333333]">
                    {run.document_name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleVerifyMarket}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#141414] hover:bg-[#1f1f1f] text-yellow-400 border border-yellow-500/40 transition-all flex items-center gap-1"
                  >
                    <span>Run Market Search (SerpApi)</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.values(run.extracted_facts).map((fact) => (
                  <FactCard
                    key={fact.key}
                    fact={fact}
                    onInspectEvidence={(f) => setSelectedFact(f)}
                    isTampered={isTampered && fact.key === "liability_cap"}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 3: SerpApi Market Grounding */}
          {run?.market_evidence && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                  <h3 className="text-sm font-bold text-neutral-100">
                    Step 3 — Independent Market Pricing Verification (SerpApi)
                  </h3>
                </div>

                <button
                  onClick={handleEvaluatePolicy}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#141414] hover:bg-[#1f1f1f] text-yellow-400 border border-yellow-500/40 transition-all flex items-center gap-1"
                >
                  <span>Evaluate Invariant Policy</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <MarketGroundingCard
                report={run.market_evidence}
                vendorQuote={Number(run.extracted_facts["contract_value"]?.value || 87000)}
                onRefreshSearch={handleVerifyMarket}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* Step 4: Deterministic Policy Engine */}
          {run?.policy_evaluation && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                  <h3 className="text-sm font-bold text-neutral-100">
                    Step 4 — Deterministic Authorization Engine
                  </h3>
                </div>

                {run.policy_evaluation.allowed && (
                  <button
                    onClick={handleGenerateDoc}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#141414] hover:bg-[#1f1f1f] text-yellow-400 border border-yellow-500/40 transition-all flex items-center gap-1"
                  >
                    <span>Compile Final Contract (Doctavian)</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              <PolicyCheckTable
                evaluation={run.policy_evaluation}
                onReEvaluate={handleEvaluatePolicy}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* Step 5 & 6: Doctavian Document & SHA-256 Integrity */}
          {run?.generated_document && run.document_integrity && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                  <h3 className="text-sm font-bold text-neutral-100">
                    Step 5 & 6 — Deterministic Document & SHA-256 Seal
                  </h3>
                </div>

                {!isTampered && run.status === "AWAITING_HUMAN_APPROVAL" && (
                  <button
                    onClick={() => setIsApprovalOpen(true)}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-yellow-400 hover:bg-yellow-300 text-black shadow-lg shadow-yellow-500/20 transition-all flex items-center gap-2 hover:scale-[1.02]"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Open Human Authorization Gate</span>
                  </button>
                )}
              </div>

              <ContractViewer
                document={run.generated_document}
                integrity={run.document_integrity}
                onGenerateDoc={handleGenerateDoc}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* Step 7: Human In-The-Loop Authorization Gate */}
          {run?.generated_document && (
            <div className="p-5 rounded-xl border border-[#262626] bg-[#0d0d0d] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#262626] pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-yellow-950/40 text-yellow-400 border border-yellow-600/40">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                      <span>Step 7 — Human In-The-Loop Authorization Gate</span>
                      {run.human_approval?.approved ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                          AUTHORIZED & SIGNED
                        </span>
                      ) : isTampered ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 font-bold">
                          TAMPER DETECTED
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-950 text-yellow-400 border border-yellow-800 font-bold">
                          AWAITING AUTHORIZATION
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Mandatory cryptographic executive sign-off prior to irreversible Foxit eSign dispatch.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {run.human_approval?.approved ? (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approved by {run.human_approval.reviewer_name}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setApprovalError(null);
                        setIsApprovalOpen(true);
                      }}
                      disabled={isLoading}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-yellow-400 hover:bg-yellow-300 text-black shadow-lg shadow-yellow-500/20 transition-all flex items-center gap-2 hover:scale-[1.02]"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Authorize & Sign Contract</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#141414] border border-[#262626]">
                  <span className="text-[10px] text-neutral-500 uppercase font-semibold">Reviewer Authority</span>
                  <div className="font-bold text-neutral-200">{run.human_approval?.reviewer_name || "Sarah Jenkins"}</div>
                  <div className="text-[10px] text-neutral-500">{run.human_approval?.reviewer_role || "Chief Procurement Officer"}</div>
                </div>
                <div className="p-3 rounded-lg bg-[#141414] border border-[#262626]">
                  <span className="text-[10px] text-neutral-500 uppercase font-semibold">Cryptographic HMAC Token</span>
                  <div className="font-mono text-yellow-400 truncate text-[11px]">
                    {run.human_approval?.signature_token ? `${run.human_approval.signature_token.slice(0, 24)}...` : "Awaiting Authorization"}
                  </div>
                  <div className="text-[10px] text-neutral-500">Binds run, hash & active policy version</div>
                </div>
                <div className="p-3 rounded-lg bg-[#141414] border border-[#262626]">
                  <span className="text-[10px] text-neutral-500 uppercase font-semibold">Policy Seal Verification</span>
                  <div className="font-bold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Deterministic Policy: PASS</span>
                  </div>
                  <div className="text-[10px] text-neutral-500">Ceiling: $100k | Liability: $250k max</div>
                </div>
              </div>
            </div>
          )}

          {/* Step 8: Foxit eSign Envelope Tracking */}
          {run?.foxit_envelope && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <h3 className="text-sm font-bold text-neutral-100">
                  Step 8 — Foxit eSign Legally Binding Execution
                </h3>
              </div>
              <FoxitEnvelopeCard envelope={run.foxit_envelope} />
            </div>
          )}

          {/* Step 9: Immutable Audit Trail */}
          <AuditTimeline events={auditEvents} onRefresh={() => fetchAudit(run?.id)} isLoading={isLoading} />
        </main>
      </div>

      {/* Evidence Drawer Modal */}
      <EvidenceDrawer fact={selectedFact} onClose={() => setSelectedFact(null)} />

      {/* Human Approval Gate Modal */}
      <ApprovalGateModal
        isOpen={isApprovalOpen}
        onClose={() => {
          setIsApprovalOpen(false);
          setApprovalError(null);
        }}
        onApprove={handleHumanApprove}
        onReject={handleHumanReject}
        facts={run?.extracted_facts || {}}
        policyEvaluation={run?.policy_evaluation}
        integrity={run?.document_integrity}
        isLoading={isLoading}
        error={approvalError}
      />
    </div>
  );
}
