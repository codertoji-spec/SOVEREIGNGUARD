import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { nutrientAdapter } from "@/lib/adapters/nutrient";
import { serpApiAdapter } from "@/lib/adapters/serpapi";
import { doctavianAdapter } from "@/lib/adapters/doctavian";
import { foxitAdapter } from "@/lib/adapters/foxit";
import { getSponsorStatuses } from "@/lib/adapters";
import { DEMO_EXTRACTED_FACTS } from "@/lib/demo/fixtures";
import { store } from "@/lib/db/store";

describe("Sponsor Adapters: Truthful LIVE vs DEMO Execution & Fallbacks", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    store.initDefaultState();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  // --- Requirement 1: Missing Credentials -> DEMO ---
  it("1. Missing credentials produce DEMO mode with used_demo_fallback=true", async () => {
    delete process.env.NUTRIENT_API_KEY;
    delete process.env.FOXIT_CLIENT_ID;
    delete process.env.FOXIT_CLIENT_SECRET;
    delete process.env.SERPAPI_API_KEY;
    delete process.env.DOCTAVIAN_API_KEY;

    const nutrientRes = await nutrientAdapter.extractDocument({ fileName: "test.pdf" });
    expect(nutrientRes.integration_mode).toBe("DEMO");
    expect(nutrientRes.execution_metadata.live_request_succeeded).toBe(false);
    expect(nutrientRes.execution_metadata.used_demo_fallback).toBe(true);

    const foxitRes = await foxitAdapter.createSigningEnvelope({
      documentName: "Test Doc",
      documentHash: "A91F28B47E102938CBA7712E49021882D",
      signerName: "Signer",
      signerEmail: "signer@corp.com",
    });
    expect(foxitRes.integration_mode).toBe("DEMO");
    expect(foxitRes.execution_metadata?.live_request_succeeded).toBe(false);
    expect(foxitRes.execution_metadata?.used_demo_fallback).toBe(true);

    const doctavianRes = await doctavianAdapter.generateContractDocument(DEMO_EXTRACTED_FACTS);
    expect(doctavianRes.integration_mode).toBe("DEMO");
    expect(doctavianRes.generator).toBe("Local Deterministic Template (Demo Mode)");
    expect(doctavianRes.execution_metadata.live_request_succeeded).toBe(false);
    expect(doctavianRes.execution_metadata.used_demo_fallback).toBe(true);
  });

  // --- Requirement 2: Invalid Credentials -> DEMO ---
  it("2. Invalid credentials produce DEMO with recorded failure reason", async () => {
    process.env.FOXIT_CLIENT_ID = "invalid_id";
    process.env.FOXIT_CLIENT_SECRET = "invalid_secret";

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("Invalid client credentials", { status: 401 })
    );

    const foxitRes = await foxitAdapter.createSigningEnvelope({
      documentName: "Test Doc",
      documentHash: "A91F28B47E102938CBA7712E49021882D",
      signerName: "Signer",
      signerEmail: "signer@corp.com",
    });

    expect(foxitRes.integration_mode).toBe("DEMO");
    expect(foxitRes.execution_metadata?.live_request_succeeded).toBe(false);
    expect(foxitRes.execution_metadata?.used_demo_fallback).toBe(true);
    expect(foxitRes.execution_metadata?.fallback_reason).toContain("HTTP 401");
  });

  // --- Requirement 3: Mock Successful Nutrient -> LIVE ---
  it("3. Mock successful Nutrient Data Extraction response produces LIVE mode", async () => {
    process.env.NUTRIENT_API_KEY = "valid_nutrient_key";

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          status: 200,
          requestId: "NUT-REQ-12345",
          metrics: { pagesProcessed: 12, processingTimeMs: 450 },
          output: { elements: [] },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const result = await nutrientAdapter.extractDocument({ fileName: "Acme-Proposal.pdf" });
    expect(result.integration_mode).toBe("LIVE");
    expect(result.extractor).toBe("Nutrient (Live API)");
    expect(result.execution_metadata.live_request_succeeded).toBe(true);
    expect(result.execution_metadata.used_demo_fallback).toBe(false);
    expect(result.execution_metadata.request_id).toBe("NUT-REQ-12345");
  });

  // --- Requirement 4: Mock Successful Foxit -> LIVE ---
  it("4. Mock successful Foxit Document Generation API response produces LIVE mode", async () => {
    process.env.FOXIT_CLIENT_ID = "valid_id";
    process.env.FOXIT_CLIENT_SECRET = "valid_secret";

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          message: "PDF Document Generated Successfully",
          fileExtension: "pdf",
          base64FileString: "JVBERi0xLjQK...",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const result = await foxitAdapter.createSigningEnvelope({
      documentName: "Master Agreement",
      documentHash: "A91F28B47E102938CBA7712E49021882D",
      signerName: "Sarah Jenkins",
      signerEmail: "s.jenkins@enterprise.corp",
    });

    expect(result.integration_mode).toBe("LIVE");
    expect(result.provider).toBe("Foxit eSign (Live API)");
    expect(result.envelope_id).toContain("FXT-LIVE-");
    expect(result.execution_metadata?.live_request_succeeded).toBe(true);
    expect(result.execution_metadata?.used_demo_fallback).toBe(false);
  });

  // --- Requirement 5: Mock Successful Doctavian -> LIVE ---
  it("5. Mock successful Doctavian Document Generate API response produces LIVE mode", async () => {
    process.env.DOCTAVIAN_API_KEY = "valid_doctavian_key";

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          result: {
            statusCode: "201",
            message: "Document created",
            data: {
              document: {
                urn: "urn:doctavian:doc:real-12345",
                name: "Master_Agreement",
                fileFormat: "pdf",
                deliveryMethod: "Storage",
              },
            },
          },
          operationId: "op_live_9988",
        }),
        { status: 201, headers: { "Content-Type": "application/json" } }
      )
    );

    const result = await doctavianAdapter.generateContractDocument(DEMO_EXTRACTED_FACTS);
    expect(result.integration_mode).toBe("LIVE");
    expect(result.generator).toBe("Doctavian (Live API)");
    expect(result.document_id).toBe("urn:doctavian:doc:real-12345");
    expect(result.execution_metadata.live_request_succeeded).toBe(true);
    expect(result.execution_metadata.used_demo_fallback).toBe(false);
  });

  // --- Requirement 6: External Failure -> DEMO + Explicit Reason ---
  it("6. External HTTP failure produces DEMO and logs explicit failure reason", async () => {
    process.env.NUTRIENT_API_KEY = "key_that_fails";

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("Service Unavailable", { status: 503 })
    );

    const result = await nutrientAdapter.extractDocument({ fileName: "proposal.pdf" });
    expect(result.integration_mode).toBe("DEMO");
    expect(result.execution_metadata.live_request_succeeded).toBe(false);
    expect(result.execution_metadata.used_demo_fallback).toBe(true);
    expect(result.execution_metadata.fallback_reason).toContain("HTTP 503");
  });

  // --- Requirement 7: Demo Fallback Cannot Be Labeled LIVE ---
  it("7. Demo fallback cannot be mislabeled LIVE under any circumstances", async () => {
    delete process.env.NUTRIENT_API_KEY;
    delete process.env.FOXIT_CLIENT_ID;
    delete process.env.DOCTAVIAN_API_KEY;

    const nutrientRes = await nutrientAdapter.extractDocument({ fileName: "test.pdf" });
    expect(nutrientRes.integration_mode).not.toBe("LIVE");
    expect(nutrientRes.integration_mode).toBe("DEMO");

    const foxitRes = await foxitAdapter.createSigningEnvelope({
      documentName: "Test",
      documentHash: "A91F28B47E102938CBA7712E49021882D",
      signerName: "Signer",
      signerEmail: "s@c.com",
    });
    expect(foxitRes.integration_mode).not.toBe("LIVE");
    expect(foxitRes.integration_mode).toBe("DEMO");

    const doctavianRes = await doctavianAdapter.generateContractDocument(DEMO_EXTRACTED_FACTS);
    expect(doctavianRes.integration_mode).not.toBe("LIVE");
    expect(doctavianRes.integration_mode).toBe("DEMO");
  });

  // --- Requirement 8: Local API 200 cannot by itself prove sponsor LIVE ---
  it("8. Local API execution resulting in simulation maintains DEMO status in store", async () => {
    delete process.env.FOXIT_CLIENT_ID;
    const run = store.createRun();

    // Populate extracted facts, evaluate policy, and seal document
    store.updateRun(run.id, { extracted_facts: DEMO_EXTRACTED_FACTS });
    store.evaluateRunPolicy(run.id);
    await store.generateAndSealDocument(run.id);

    // Even if local approval occurs, Foxit mode remains DEMO
    const updated = store.approveContract(run.id, {
      name: "Reviewer",
      email: "rev@corp.com",
      role: "Officer",
    });
    expect(updated.signature_token).toBeDefined();

    const signedRun = await store.executeSigning(run.id, updated.signature_token);
    expect(signedRun.status).toBe("SIGNED_AND_SEALED");
    expect(signedRun.sponsor_modes.foxit).toBe("DEMO");
    expect(signedRun.foxit_envelope?.integration_mode).toBe("DEMO");
  });

  // --- Market Pricing Normalization Tests ---
  it("9. Correctly parses and normalizes monthly source ($3,000 - $15,000/month)", () => {
    const parsed = serpApiAdapter.parsePriceEvidence(
      "Standard cloud tier ranges between $3,000 - $15,000/month with dedicated support.",
      "Acme Cloud Pricing"
    );
    expect(parsed).not.toBeNull();
    expect(parsed?.frequency).toBe("MONTHLY");
    expect(parsed?.raw_min).toBe(3000);
    expect(parsed?.raw_max).toBe(15000);
    expect(parsed?.normalized_annual_min).toBe(36000);
    expect(parsed?.normalized_annual_max).toBe(180000);
  });

  it("10. Correctly normalizes mixed monthly and annual sources into unified annual range", async () => {
    process.env.SERPAPI_API_KEY = "valid_key";

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          organic_results: [
            { title: "S1", link: "https://ex1.com", snippet: "$1,500/month" },
            { title: "S2", link: "https://ex2.com", snippet: "$85,000/year" },
          ],
        }),
        { status: 200 }
      )
    );

    const report = await serpApiAdapter.searchMarketEvidence("Acme Cloud", 87000);
    expect(report.integration_mode).toBe("LIVE");
    expect(report.market_price_range?.is_normalized).toBe(true);
    expect(report.market_price_range?.min).toBe(18000);
    expect(report.market_price_range?.max).toBe(85000);
    expect(report.status).toBe("VERIFIED");
  });

  it("11. Does not normalize one-time fees and returns INSUFFICIENT_EXTERNAL_EVIDENCE when no pricing found", async () => {
    const parsed = serpApiAdapter.parsePriceEvidence("Setup is $5,000 one-time fee.", "Fees");
    expect(parsed?.frequency).toBe("ONE_TIME");
    expect(parsed?.normalized_annual_min).toBeUndefined();

    process.env.SERPAPI_API_KEY = "valid_key";
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          organic_results: [{ title: "Docs", link: "https://ex.com", snippet: "Documentation only" }],
        }),
        { status: 200 }
      )
    );

    const report = await serpApiAdapter.searchMarketEvidence("Acme Cloud", 87000);
    expect(report.status).toBe("INSUFFICIENT_EXTERNAL_EVIDENCE");
    expect(report.market_price_range).toBeNull();
  });

  // --- Doctavian US Currency Formatting & Error Categorization Tests ---
  it("12. Generates contract with standard US currency formatting ($200,000.00 and $87,000.00)", async () => {
    const result = await doctavianAdapter.generateContractDocument(DEMO_EXTRACTED_FACTS);
    expect(result.content).toContain("$200,000.00 USD");
    expect(result.content).toContain("$87,000.00 USD");
    expect(result.content).not.toContain("$2,00,000.00");
    expect(result.html_rendered).toContain("$200,000.00 USD");
  });

  it("13. Doctavian properly categorizes 401, 404, and timeout errors in execution metadata", async () => {
    process.env.DOCTAVIAN_API_KEY = "test_key";

    // 401 -> invalid_credentials
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("Unauthorized", { status: 401, statusText: "Unauthorized" })
    );
    const res401 = await doctavianAdapter.generateContractDocument(DEMO_EXTRACTED_FACTS);
    expect(res401.integration_mode).toBe("DEMO");
    expect(res401.execution_metadata.fallback_reason).toContain("HTTP 401 Unauthorized");

    // 404 -> wrong_endpoint
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("Not Found", { status: 404, statusText: "Not Found" })
    );
    const res404 = await doctavianAdapter.generateContractDocument(DEMO_EXTRACTED_FACTS);
    expect(res404.integration_mode).toBe("DEMO");
    expect(res404.execution_metadata.fallback_reason).toContain("HTTP 404 Endpoint Not Found");

    // Timeout
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new DOMException("The operation was aborted due to timeout", "TimeoutError")
    );
    const resTimeout = await doctavianAdapter.generateContractDocument(DEMO_EXTRACTED_FACTS);
    expect(resTimeout.integration_mode).toBe("DEMO");
    expect(resTimeout.execution_metadata.fallback_reason).toContain("timed out");
  });

  it("14. Passes Bearer token in Authorization header when DOCTAVIAN_BEARER_TOKEN is configured", async () => {
    process.env.DOCTAVIAN_API_KEY = "test_key";
    process.env.DOCTAVIAN_BEARER_TOKEN = "jwt_bearer_token_xyz";

    let capturedHeaders: HeadersInit | undefined;
    vi.spyOn(globalThis, "fetch").mockImplementationOnce(async (input, init) => {
      capturedHeaders = init?.headers;
      return new Response(
        JSON.stringify({
          result: { statusCode: "201", message: "Created", data: { document: { urn: "urn:doc:jwt" } } },
        }),
        { status: 201 }
      );
    });

    const res = await doctavianAdapter.generateContractDocument(DEMO_EXTRACTED_FACTS);
    expect(res.integration_mode).toBe("LIVE");
    expect((capturedHeaders as Record<string, string>)["Authorization"]).toBe("Bearer jwt_bearer_token_xyz");
    expect((capturedHeaders as Record<string, string>)["X-Api-Key"]).toBe("test_key");

    delete process.env.DOCTAVIAN_BEARER_TOKEN;
  });
});
