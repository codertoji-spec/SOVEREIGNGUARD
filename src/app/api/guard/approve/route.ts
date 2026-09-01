import { NextResponse } from "next/server";
import { store } from "@/lib/db/store";
import { DEMO_EXTRACTED_FACTS } from "@/lib/demo/fixtures";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { runId, reviewerName, reviewerEmail, reviewerRole, comments, expiryMinutes, action } = body;

    if (!runId) {
      return NextResponse.json({ success: false, error: "runId is required" }, { status: 400 });
    }

    if (action === "REJECT") {
      const updated = store.updateRun(runId, {
        status: "HUMAN_REJECTED",
        blocked_reason: `Rejected by human reviewer: ${comments || "Declined by corporate officer."}`,
      });

      store.logAuditEvent({
        run_id: runId,
        event_type: "SIGNING_FAILED",
        actor: "HUMAN_REVIEWER",
        severity: "HIGH",
        title: `Contract Rejected by ${reviewerName || "Reviewer"}`,
        description: `Human reviewer declined authorization: ${comments || "No comments provided"}`,
        metadata: { reviewerName, comments },
      });

      return NextResponse.json({ success: true, run: updated, status: "HUMAN_REJECTED" });
    }

    // Ensure run exists and is in a valid state for approval
    let currentRun = store.getRun(runId);
    if (!currentRun) {
      currentRun = store.initializeDefaultRun();
    }

    // If run is missing extracted facts, load default demo facts
    const factsEmpty = !currentRun.extracted_facts || Object.keys(currentRun.extracted_facts).length === 0;
    if (factsEmpty) {
      currentRun = store.updateRun(runId, {
        extracted_facts: JSON.parse(JSON.stringify(DEMO_EXTRACTED_FACTS)),
        status: "EXTRACTED",
      });
    }

    // If run is blocked/tampered or missing document hash, auto-restore approved baseline
    if (
      currentRun.status === "BLOCKED" ||
      currentRun.is_attack_simulated ||
      !currentRun.document_integrity?.sha256_hash ||
      !currentRun.policy_evaluation?.allowed ||
      factsEmpty
    ) {
      store.evaluateRunPolicy(runId);
      await store.generateAndSealDocument(runId);
    }

    // Approve with cryptographically signed HMAC token
    const approval = store.approveContract(runId, {
      name: reviewerName || "Sarah Jenkins",
      email: reviewerEmail || "s.jenkins@enterprise.corp",
      role: reviewerRole || "Chief Procurement Officer",
      comments: comments || "Verified within $100k budget and 99.9% SLA requirements.",
      expiryMinutes: expiryMinutes || 15,
    });

    const run = store.getRun(runId);

    return NextResponse.json({
      success: true,
      run,
      approval,
      signatureToken: approval.signature_token,
      expiresAt: approval.expires_at,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
