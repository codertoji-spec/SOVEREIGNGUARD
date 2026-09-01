import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Cpu,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Search,
  PenTool,
  Sliders,
  Terminal,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#060606] text-neutral-100 grid-background flex flex-col font-mono">
      {/* Top Header */}
      <header className="h-20 border-b border-[#262626] px-8 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#141414] border border-yellow-500/40 p-0.5 shadow-lg shadow-yellow-500/10">
            <div className="w-full h-full bg-[#0d0d0d] rounded-[8px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <div>
            <div className="font-bold text-xl tracking-tight text-neutral-100">
              SOVEREIGN<span className="text-yellow-400">GUARD</span>
            </div>
            <p className="text-xs text-neutral-400">The Authorization Firewall for AI Agents</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/console"
            className="px-5 py-2.5 rounded-lg text-xs font-bold bg-yellow-400 hover:bg-yellow-300 text-black shadow-lg shadow-yellow-500/20 transition-all flex items-center gap-2 hover:scale-105"
          >
            <span>Launch Security Console</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-16 space-y-24">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-yellow-950/40 text-yellow-300 border border-yellow-600/40 shadow-md">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
            <span>ENTERPRISE AGENTIC SECURITY & INVARIANT FIREWALL</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-neutral-100">
            AI Can Move at Machine Speed.
            <br />
            <span className="text-yellow-400">
              Authorization Remains Invariant.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Autonomous AI agents are negotiating enterprise contracts, issuing financial commitments, and taking real-world actions.
            SovereignGuard sits between agent autonomy and irreversible execution.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 text-xs">
            <Link
              href="/console"
              className="px-8 py-4 rounded-xl font-bold text-sm bg-yellow-400 hover:bg-yellow-300 text-black shadow-xl shadow-yellow-500/20 transition-all flex items-center gap-2.5 hover:scale-105"
            >
              <span>Launch Live Hackathon Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/policies"
              className="px-6 py-4 rounded-xl font-bold text-neutral-300 bg-[#141414] hover:bg-[#1f1f1f] border border-[#2e2e2e] transition-all"
            >
              View Invariant Policies
            </Link>
          </div>
        </div>

        {/* The Core Invariant Callout */}
        <div className="p-8 rounded-2xl border border-yellow-500/30 bg-[#0d0d0d] shadow-2xl space-y-6 text-center">
          <div className="text-xs font-bold uppercase tracking-widest text-yellow-400">
            The Fundamental Security Axiom
          </div>
          <div className="text-2xl sm:text-3xl font-black text-neutral-100 space-y-1">
            <div>AI CAN PROPOSE.</div>
            <div>AI CAN ANALYZE.</div>
            <div>AI CAN PREPARE.</div>
            <div className="text-yellow-400 pt-2 text-3xl sm:text-4xl">
              AI CANNOT BYPASS THE AUTHORIZATION BOUNDARY.
            </div>
          </div>
          <p className="text-xs text-neutral-400 max-w-2xl mx-auto">
            Zero LLM discretion at the execution gate. Deterministic code verification, real SHA-256 cryptographic seals, and mandatory human sign-off.
          </p>
        </div>

        {/* Problem vs Solution Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl border border-rose-900/60 bg-rose-950/20 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-400 text-sm font-bold">
              <ShieldAlert className="w-5 h-5" />
              <span>THE THREAT MODEL</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-100">
              Rogue Prompts & Last-Second Agent Hallucinations
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              When an AI agent is given autonomy to sign vendor agreements, an adversarial prompt injection, memory drift, or hallucination can silently alter liability clauses from $200k to $5,000,000 immediately before dispatch.
            </p>
            <div className="p-3 rounded-lg bg-[#0e0e0e] border border-rose-800 text-[11px] text-rose-300">
              ❌ Generic RAG & Chatbots fail because they rely on LLMs to make the authorization decision.
            </div>
          </div>

          <div className="p-8 rounded-2xl border border-emerald-900/60 bg-emerald-950/20 space-y-4">
            <div className="flex items-center gap-2.5 text-emerald-400 text-sm font-bold">
              <ShieldCheck className="w-5 h-5" />
              <span>THE SOVEREIGNGUARD SOLUTION</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-100">
              Deterministic Invariants & Cryptographic Hashing
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              SovereignGuard extracts verifiable facts, grounds claims with live market evidence, evaluates hard code limits, compiles canonical templates, and locks documents with bit-exact SHA-256 hashes.
            </p>
            <div className="p-3 rounded-lg bg-[#0e0e0e] border border-emerald-800 text-[11px] text-emerald-300">
              ✓ Any post-approval alteration causes an instant hash mismatch and server-side hard lock.
            </div>
          </div>
        </div>

        {/* Sponsor Technologies Role Matrix */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-yellow-400">
              Deep Sponsor Integrations
            </div>
            <h2 className="text-2xl font-bold text-neutral-100">Every Technology Serves a Mission-Critical Role</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl border border-[#262626] bg-[#0d0d0d] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-neutral-100">Nutrient</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-950/40 text-yellow-400 border border-yellow-600/40">
                  Extraction
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Extracts structured facts from multi-page vendor proposal PDFs with exact page coordinates and snippets.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[#262626] bg-[#0d0d0d] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-neutral-100">SerpApi</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-950/40 text-yellow-400 border border-yellow-600/40">
                  Grounding
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Independently queries Google Search to ground vendor pricing against market medians.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[#262626] bg-[#0d0d0d] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-neutral-100">Doctavian</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-950/40 text-yellow-400 border border-yellow-600/40">
                  Generation
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Deterministically compiles approved parameters into canonical legal contracts and calculates SHA-256 seals.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[#262626] bg-[#0d0d0d] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-neutral-100">Foxit eSign</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Sign Boundary
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Enforces the final legally binding human signature gate with certified audit envelopes.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="p-10 rounded-2xl border border-[#262626] bg-[#0d0d0d] text-center space-y-6">
          <h3 className="text-2xl sm:text-3xl font-bold text-neutral-100">
            Experience the 60-Second Adversarial Demo
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto">
            Witness an autonomous agent propose a $87k contract, verify it, simulate a $5,000,000 liability injection attack, watch SovereignGuard lock down the pipeline, and complete clean Foxit signing.
          </p>
          <Link
            href="/console"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm bg-yellow-400 hover:bg-yellow-300 text-black shadow-xl shadow-yellow-500/20 transition-all hover:scale-105"
          >
            <span>Enter Defense Console</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#262626] py-6 px-8 text-center text-xs text-neutral-500 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>SovereignGuard © 2026 — The Authorization Firewall for AI Agents</span>
        <span>Built for Hackathon Excellence</span>
      </footer>
    </div>
  );
}
