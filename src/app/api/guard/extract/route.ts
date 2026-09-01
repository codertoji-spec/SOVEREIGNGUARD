import { NextResponse } from "next/server";
import { store } from "@/lib/db/store";
import { nutrientAdapter } from "@/lib/adapters/nutrient";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { runId, fileName, fileContent, fileBase64, mimeType, customFacts } = body;

    const run = store.getRun(runId);
    if (!run) {
      return NextResponse.json({ success: false, error: `Run ${runId} not found` }, { status: 404 });
    }

    let facts = customFacts;
    let rawText = "";
    let pageCount = 12;
    let extractor = "Nutrient (Demo - Acme Cloud Fixture)";
    let integrationMode: "LIVE" | "DEMO" = "DEMO";

    if (!facts) {
      const fileBuffer = fileBase64 ? Buffer.from(fileBase64, "base64") : undefined;
      const extraction = await nutrientAdapter.extractDocument({
        fileName,
        fileContent,
        fileBuffer,
        mimeType,
      });
      facts = extraction.facts;
      rawText = extraction.raw_text;
      pageCount = extraction.page_count;
      extractor = extraction.extractor;
      integrationMode = extraction.integration_mode;
    }

    const updated = store.updateRun(runId, {
      status: "EXTRACTED",
      extracted_facts: facts,
      raw_document_text: rawText,
      document_name: fileName || run.document_name,
      is_attack_simulated: false,
      blocked_reason: undefined,
      sponsor_modes: {
        ...run.sponsor_modes,
        nutrient: integrationMode,
      },
    });

    store.logAuditEvent({
      run_id: runId,
      event_type: "DOCUMENT_EXTRACTED",
      actor: "SOVEREIGNGUARD_FIREWALL",
      severity: "INFO",
      title: `Contract Facts Extracted via ${extractor}`,
      description: `${extractor} extracted ${Object.keys(facts).length} structured facts from ${fileName || run.document_name} (${pageCount} pages) with page evidence coordinates. Mode: ${integrationMode}.`,
      metadata: { extractor, pageCount, factsCount: Object.keys(facts).length, integrationMode },
    });

    return NextResponse.json({
      success: true,
      run: updated,
      facts,
      extractor,
      integrationMode,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
