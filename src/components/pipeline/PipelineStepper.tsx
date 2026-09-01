"use client";

import React from "react";
import { RunStatus } from "@/types/guard";
import {
  FileText,
  Search,
  Sliders,
  FileCode,
  ShieldCheck,
  UserCheck,
  PenTool,
  CheckCircle2,
  AlertOctagon,
  Clock,
  ArrowRight,
} from "lucide-react";

interface PipelineStepperProps {
  status: RunStatus;
  isTampered: boolean;
  activeStep: number;
  onSelectStep: (step: number) => void;
  run?: any;
}

export interface PipelineStage {
  id: number;
  label: string;
  sublabel: string;
  sponsorKey?: "nutrient" | "serpapi" | "doctavian" | "foxit";
  icon: React.ElementType;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  { id: 1, label: "Agent Request", sublabel: "Intent & Bounds", icon: Clock },
  { id: 2, label: "Extraction", sublabel: "Nutrient Engine", sponsorKey: "nutrient", icon: FileText },
  { id: 3, label: "Verification", sublabel: "SerpApi Grounding", sponsorKey: "serpapi", icon: Search },
  { id: 4, label: "Policy Engine", sublabel: "Deterministic", icon: Sliders },
  { id: 5, label: "Generation", sublabel: "Doctavian Engine", sponsorKey: "doctavian", icon: FileCode },
  { id: 6, label: "Integrity Seal", sublabel: "SHA-256 Hash", icon: ShieldCheck },
  { id: 7, label: "Human Gate", sublabel: "Authorization", icon: UserCheck },
  { id: 8, label: "Foxit eSign", sublabel: "Final Seal", sponsorKey: "foxit", icon: PenTool },
];

export function PipelineStepper({ status, isTampered, activeStep, onSelectStep, run }: PipelineStepperProps) {
  // Helper to determine stage completion / state
  const getStageState = (stageId: number): "COMPLETED" | "COMPLETED_DEMO" | "ACTIVE" | "BREACH" | "FAIL" | "BLOCKED" | "PENDING" => {
    // 1. Agent Request
    if (stageId === 1) {
      return "COMPLETED";
    }

    // 2. Nutrient Extraction
    if (stageId === 2) {
      const hasFacts = Boolean(run && run.extracted_facts && Object.keys(run.extracted_facts).length > 0);
      if (hasFacts) {
        return run.sponsor_modes?.nutrient === "LIVE" ? "COMPLETED" : "COMPLETED_DEMO";
      }
      if (status === "EXTRACTION_IN_PROGRESS" || activeStep === 2) {
        return "ACTIVE";
      }
      return "PENDING";
    }

    // 3. SerpApi Market Grounding
    if (stageId === 3) {
      const hasMarket = Boolean(run?.market_evidence);
      if (hasMarket) {
        return run.sponsor_modes?.serpapi === "LIVE" ? "COMPLETED" : "COMPLETED_DEMO";
      }
      if (status === "VERIFYING_MARKET" || activeStep === 3) {
        return "ACTIVE";
      }
      return "PENDING";
    }

    // 4. Policy Engine
    if (stageId === 4) {
      if (isTampered || status === "BLOCKED" || status === "TAMPER_DETECTED") {
        return "FAIL";
      }
      if (run?.policy_evaluation) {
        return run.policy_evaluation.allowed ? "COMPLETED" : "FAIL";
      }
      if (status === "EVALUATING_POLICY" || activeStep === 4) {
        return "ACTIVE";
      }
      return "PENDING";
    }

    // 5. Doctavian Document Generation
    if (stageId === 5) {
      if (isTampered) {
        return run?.generated_document ? "BREACH" : "BLOCKED";
      }
      if (run?.generated_document) {
        return run.sponsor_modes?.doctavian === "LIVE" ? "COMPLETED" : "COMPLETED_DEMO";
      }
      if (status === "DOCUMENT_GENERATED" || activeStep === 5) {
        return "ACTIVE";
      }
      return "PENDING";
    }

    // 6. Cryptographic Integrity Seal
    if (stageId === 6) {
      if (isTampered || run?.document_integrity?.is_tampered) {
        return "BREACH";
      }
      if (run?.document_integrity?.sha256_hash) {
        return "COMPLETED";
      }
      if (activeStep === 6 && run?.generated_document) {
        return "ACTIVE";
      }
      return "PENDING";
    }

    // 7. Human Authorization Gate
    if (stageId === 7) {
      if (isTampered || status === "BLOCKED" || status === "TAMPER_DETECTED") {
        return "BLOCKED";
      }
      if (run?.human_approval?.action === "APPROVE" || status === "HUMAN_APPROVED" || status === "FOXIT_ENVELOPE_CREATED" || status === "SIGNED_AND_SEALED") {
        return "COMPLETED";
      }
      if (run?.human_approval?.action === "REJECT" || status === "HUMAN_REJECTED") {
        return "FAIL";
      }
      if (status === "AWAITING_HUMAN_APPROVAL" || activeStep === 7) {
        return "ACTIVE";
      }
      return "PENDING";
    }

    // 8. Foxit eSign Envelope & Signature
    if (stageId === 8) {
      if (isTampered || status === "BLOCKED" || status === "TAMPER_DETECTED") {
        return "BLOCKED";
      }
      if (status === "SIGNED_AND_SEALED" || run?.foxit_envelope) {
        return run.sponsor_modes?.foxit === "LIVE" ? "COMPLETED" : "COMPLETED_DEMO";
      }
      if (status === "HUMAN_APPROVED" || activeStep === 8) {
        return "ACTIVE";
      }
      return "PENDING";
    }

    return "PENDING";
  };

  const getSublabel = (stage: PipelineStage, state: string): string => {
    if (!stage.sponsorKey) return stage.sublabel;
    const mode = run?.sponsor_modes?.[stage.sponsorKey];
    if (state === "COMPLETED") return `${stage.sublabel} (LIVE)`;
    if (state === "COMPLETED_DEMO") return `${stage.sublabel} (DEMO)`;
    return stage.sublabel;
  };

  return (
    <div className="w-full bg-[#0c0c0c] border border-[#262626] rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
            Authorization Pipeline
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161616] text-yellow-400 border border-[#2f2f2f]">
            8 Sequential Checkpoints
          </span>
        </div>
        {isTampered && (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800 animate-pulse">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>PIPELINE BLOCKED: INTEGRITY BREACH</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {PIPELINE_STAGES.map((stage) => {
          const state = getStageState(stage.id);
          const Icon = stage.icon;
          const isCurrent = activeStep === stage.id;
          const sublabel = getSublabel(stage, state);

          let badgeStyles = "bg-[#121212] text-neutral-500 border-[#222222] hover:border-[#333333]";
          let iconStyles = "text-neutral-500";

          if (state === "COMPLETED") {
            badgeStyles = "bg-emerald-950/30 text-emerald-300 border-emerald-800/70 hover:bg-emerald-950/50";
            iconStyles = "text-emerald-400";
          } else if (state === "COMPLETED_DEMO") {
            badgeStyles = "bg-[#141414] text-neutral-300 border-yellow-800/60 hover:bg-[#181818]";
            iconStyles = "text-yellow-400";
          } else if (state === "ACTIVE") {
            badgeStyles = "bg-yellow-950/40 text-yellow-200 border-yellow-500/80 glow-yellow ring-1 ring-yellow-500/50";
            iconStyles = "text-yellow-400";
          } else if (state === "BREACH" || state === "FAIL") {
            badgeStyles = "bg-rose-950/70 text-rose-200 border-rose-600 glow-red ring-1 ring-rose-500/50";
            iconStyles = "text-rose-400 animate-bounce";
          } else if (state === "BLOCKED") {
            badgeStyles = "bg-[#0a0a0a] text-neutral-600 border-[#1f1f1f] opacity-60";
            iconStyles = "text-neutral-600";
          }

          return (
            <button
              key={stage.id}
              onClick={() => onSelectStep(stage.id)}
              className={`relative flex flex-col items-start p-2.5 rounded-lg border text-left transition-all ${badgeStyles} ${
                isCurrent ? "ring-2 ring-yellow-400 scale-[1.02]" : ""
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-neutral-400">0{stage.id}</span>
                  <Icon className={`w-3.5 h-3.5 ${iconStyles}`} />
                </div>
                {state === "COMPLETED" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                {state === "COMPLETED_DEMO" && (
                  <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-yellow-950/60 text-yellow-300 border border-yellow-800/80">
                    DEMO
                  </span>
                )}
                {state === "ACTIVE" && <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />}
                {(state === "BREACH" || state === "FAIL") && <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />}
              </div>

              <span className="text-xs font-semibold leading-tight text-neutral-100">{stage.label}</span>
              <span className="text-[10px] font-mono text-neutral-400 truncate w-full mt-0.5">
                {sublabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
