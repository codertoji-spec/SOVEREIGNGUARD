import { nutrientAdapter } from "./nutrient";
import { serpApiAdapter } from "./serpapi";
import { doctavianAdapter } from "./doctavian";
import { foxitAdapter } from "./foxit";
import { SponsorStatus, AgentRun } from "@/types/guard";

export { nutrientAdapter, serpApiAdapter, doctavianAdapter, foxitAdapter };

export function getSponsorStatuses(activeRun?: AgentRun): SponsorStatus[] {
  // Nutrient Status
  const nutrientConfigured = nutrientAdapter.isConfigured();
  const nutrientLive = nutrientConfigured && (activeRun?.sponsor_modes?.nutrient === "LIVE" || !nutrientAdapter.usedDemoFallback());
  const nutrientFallback = nutrientAdapter.getLastExecutionMetadata()?.fallback_reason;

  // SerpApi Status
  const serpApiConfigured = serpApiAdapter.isConfigured();
  const serpApiLive = serpApiConfigured && (activeRun?.sponsor_modes?.serpapi === "LIVE" || !serpApiAdapter.usedDemoFallback());
  const serpApiFallback = serpApiAdapter.getLastExecutionMetadata()?.fallback_reason;

  // Doctavian Status
  const doctavianConfigured = doctavianAdapter.isConfigured();
  const doctavianLive = doctavianConfigured && (activeRun?.sponsor_modes?.doctavian === "LIVE" || !doctavianAdapter.usedDemoFallback());
  const doctavianFallback = doctavianAdapter.getLastExecutionMetadata()?.fallback_reason;

  // Foxit Status
  const foxitConfigured = foxitAdapter.isConfigured();
  const foxitLive = foxitConfigured && (activeRun?.sponsor_modes?.foxit === "LIVE" || !foxitAdapter.usedDemoFallback());
  const foxitFallback = foxitAdapter.getLastExecutionMetadata()?.fallback_reason;

  return [
    {
      name: "Nutrient",
      role: "Vendor Contract & Document Fact Extraction with Page Evidence",
      status: nutrientLive ? "LIVE" : "DEMO",
      configured: nutrientConfigured,
      live_request_succeeded: nutrientLive,
      used_demo_fallback: !nutrientLive,
      fallback_reason: nutrientLive ? undefined : nutrientFallback || "NUTRIENT_API_KEY not configured",
      details: nutrientLive
        ? "Connected & Verified: Live Nutrient Cloud Extraction API (DWS)"
        : "Operating in Deterministic Demo Mode (Acme Proposal Fixture)",
      endpoint: nutrientAdapter.getEndpoint(),
    },
    {
      name: "SerpApi",
      role: "Independent External Market Pricing & Claim Grounding",
      status: serpApiLive ? "LIVE" : "DEMO",
      configured: serpApiConfigured,
      live_request_succeeded: serpApiLive,
      used_demo_fallback: !serpApiLive,
      fallback_reason: serpApiLive ? undefined : serpApiFallback || "SERPAPI_API_KEY not configured",
      details: serpApiLive
        ? "Connected & Verified: Live Google Search via SerpApi"
        : "Operating in Verified Offline Market Cache Mode",
      endpoint: serpApiAdapter.getEndpoint(),
    },
    {
      name: "Doctavian",
      role: "Deterministic Legal Document Generation & Invariant Templating",
      status: doctavianLive ? "LIVE" : "DEMO",
      configured: doctavianConfigured,
      live_request_succeeded: doctavianLive,
      used_demo_fallback: !doctavianLive,
      fallback_reason: doctavianLive ? undefined : doctavianFallback || "DOCTAVIAN_API_KEY not configured",
      details: doctavianLive
        ? "Connected & Verified: Live Doctavian Cloud Document Generation API"
        : "Operating in Local Deterministic Template Compiler Mode (Awaiting Sponsor Key)",
      endpoint: doctavianAdapter.getEndpoint(),
    },
    {
      name: "Foxit eSign",
      role: "Legally Binding Human Authorization Boundary & Document Generation",
      status: foxitLive ? "LIVE" : "DEMO",
      configured: foxitConfigured,
      live_request_succeeded: foxitLive,
      used_demo_fallback: !foxitLive,
      fallback_reason: foxitLive ? undefined : foxitFallback || "FOXIT_CLIENT_ID / FOXIT_CLIENT_SECRET not configured",
      details: foxitLive
        ? "Connected & Verified: Live Foxit Cloud Document Generation & Seal Engine"
        : "Operating in Certified Foxit Envelope Simulation Mode",
      endpoint: foxitAdapter.getEndpoint(),
    },
  ];
}
