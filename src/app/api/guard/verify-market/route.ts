import { NextResponse } from "next/server";
import { store } from "@/lib/db/store";
import { serpApiAdapter } from "@/lib/adapters/serpapi";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { runId, query, quote } = body;

    const run = store.getRun(runId);
    if (!run) {
      return NextResponse.json({ success: false, error: `Run ${runId} not found` }, { status: 404 });
    }

    const searchQuery = query || `${run.agent_intent.vendor} enterprise SaaS pricing benchmark 2026`;
    const vendorQuote = quote || Number(run.extracted_facts["contract_value"]?.value || run.agent_intent.requested_price);

    const marketReport = await serpApiAdapter.searchMarketEvidence(searchQuery, vendorQuote);

    const updated = store.updateRun(runId, {
      status: "MARKET_VERIFIED",
      market_evidence: marketReport,
      sponsor_modes: {
        ...run.sponsor_modes,
        serpapi: marketReport.integration_mode,
      },
    });

    const rangeStr = marketReport.market_price_range
      ? `$${marketReport.market_price_range.min.toLocaleString("en-US")} – $${marketReport.market_price_range.max.toLocaleString("en-US")}`
      : "Inconclusive benchmark";

    store.logAuditEvent({
      run_id: runId,
      event_type: "EXTERNAL_VERIFICATION",
      actor: "SOVEREIGNGUARD_FIREWALL",
      severity: "INFO",
      title: `External Market Grounding via ${marketReport.engine}`,
      description: `${marketReport.engine} search completed. Status: ${marketReport.status}. Benchmark range: ${rangeStr}. Sources: ${marketReport.sources.length}. Mode: ${marketReport.integration_mode}.`,
      metadata: { marketReport },
    });

    return NextResponse.json({
      success: true,
      run: updated,
      marketReport,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
