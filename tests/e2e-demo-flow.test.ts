import { describe, it, expect, beforeEach } from "vitest";
import { store } from "@/lib/db/store";
import { nutrientAdapter } from "@/lib/adapters/nutrient";
import { serpApiAdapter } from "@/lib/adapters/serpapi";
import { doctavianAdapter } from "@/lib/adapters/doctavian";
import { foxitAdapter } from "@/lib/adapters/foxit";

describe("SovereignGuard Complete End-to-End Killer Demo Flow", () => {
  beforeEach(() => {
    store.initDefaultState();
  });

  it("Executes the exact 12-step killer demo walkthrough from Agent Request to Signed Contract", async () => {
    // 1. Agent intent initiated
    const run = store.createRun();
    expect(run.status).toBe("INITIALIZED");
    expect(run.agent_intent.vendor).toBe("Acme Cloud");
    expect(run.agent_intent.requested_price).toBe(87000);

    // 2. Document extraction via Nutrient adapter
    const extraction = await nutrientAdapter.extractDocument({ fileName: run.document_name });
    expect(extraction.facts["contract_value"].value).toBe(87000);
    expect(extraction.facts["liability_cap"].value).toBe(200000);
    expect(extraction.facts["sla_uptime"].value).toBe(99.9);
    expect(extraction.facts["liability_cap"].evidence.page).toBe(7);

    store.updateRun(run.id, {
      status: "EXTRACTED",
      extracted_facts: extraction.facts,
      raw_document_text: extraction.raw_text,
    });

    // 3. Independent market grounding via SerpApi adapter
    const market = await serpApiAdapter.searchMarketEvidence(
      "Acme Cloud enterprise SaaS pricing benchmark 2026",
      87000
    );
    expect(market.is_consistent).toBe(true);
    expect(market.market_price_range.min).toBeLessThanOrEqual(87000);
    expect(market.market_price_range.max).toBeGreaterThanOrEqual(87000);

    store.updateRun(run.id, {
      status: "MARKET_VERIFIED",
      market_evidence: market,
    });

    // 4. Deterministic policy evaluation (Zero LLM discretion)
    const policyEvaluation = store.evaluateRunPolicy(run.id);
    expect(policyEvaluation.allowed).toBe(true);
    expect(policyEvaluation.overall_status).toBe("PASS");
    expect(policyEvaluation.checks.length).toBeGreaterThanOrEqual(5);

    // 5. Deterministic contract generation via Doctavian & SHA-256 seal
    const integrity = await store.generateAndSealDocument(run.id);
    expect(integrity.sha256_hash).toBeDefined();
    expect(integrity.sha256_hash.length).toBe(64);
    expect(integrity.is_tampered).toBe(false);

    const originalHash = integrity.sha256_hash;

    // 6. THE KILLER DEMO: Adversarial Tamper Attack Simulation ($5,000,000 liability)
    const attack = store.simulateTamperAttack(run.id);
    expect(attack.success).toBe(true);
    expect(attack.policyViolation.allowed).toBe(false);
    expect(attack.policyViolation.violations.some((v) => v.field === "liability_cap")).toBe(true);
    expect(attack.hashMismatch.tampered_hash).not.toBe(originalHash);

    const tamperedRun = store.getRun(run.id)!;
    expect(tamperedRun.status).toBe("BLOCKED");
    expect(tamperedRun.is_attack_simulated).toBe(true);

    // 7. Verify Server-Side Fail-Closed Boundary rejects tampered execution
    await expect(store.executeSigning(run.id)).rejects.toThrow();

    // 8. Restore approved baseline
    store.updateRun(run.id, {
      is_attack_simulated: false,
      extracted_facts: extraction.facts,
      status: "AWAITING_HUMAN_APPROVAL",
    });
    store.evaluateRunPolicy(run.id);
    const restoredIntegrity = await store.generateAndSealDocument(run.id);

    // 9. Human Authorization Gate (Chief Procurement Officer)
    const approval = store.approveContract(run.id, {
      name: "Sarah Jenkins",
      email: "s.jenkins@enterprise.corp",
      role: "Chief Procurement Officer",
      comments: "Approved under verified enterprise procurement policy.",
    });
    expect(approval.approved).toBe(true);
    expect(approval.approved_document_hash).toBe(restoredIntegrity.sha256_hash);

    // 10. Final Foxit eSign Envelope Dispatch (Server Invariant Verified)
    const finalRun = await store.executeSigning(run.id, approval.signature_token);
    expect(finalRun.status).toBe("SIGNED_AND_SEALED");
    expect(finalRun.foxit_envelope).toBeDefined();
    expect(finalRun.foxit_envelope?.envelope_id).toContain("FXT-ENV-");
    expect(finalRun.foxit_envelope?.status).toBe("SENT");

    // 11. Inspect Immutable Audit Trail
    const audit = store.getAuditEvents(run.id);
    expect(audit.length).toBeGreaterThanOrEqual(8);
    expect(audit.some((e) => e.event_type === "TAMPER_ATTEMPTED")).toBe(true);
    expect(audit.some((e) => e.event_type === "POLICY_VIOLATION")).toBe(true);
    expect(audit.some((e) => e.event_type === "HASH_MISMATCH")).toBe(true);
    expect(audit.some((e) => e.event_type === "SIGNING_BLOCKED")).toBe(true);
    expect(audit.some((e) => e.event_type === "HUMAN_APPROVAL")).toBe(true);
    expect(audit.some((e) => e.event_type === "SIGNING_COMPLETED")).toBe(true);
  });
});
