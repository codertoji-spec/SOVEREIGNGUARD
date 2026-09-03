import { ContractFact, IntegrationMode, SponsorExecutionMetadata } from "@/types/guard";
import { computeSha256 } from "@/lib/crypto/integrity";

export interface DoctavianGenerationResult {
  document_id: string;
  title: string;
  content: string;
  html_rendered: string;
  sha256_hash: string;
  generator: string;
  integration_mode: IntegrationMode;
  template_id?: string;
  version: number;
  generated_at: string;
  metadata?: Record<string, any>;
  execution_metadata: SponsorExecutionMetadata;
}

export class DoctavianAdapter {
  private lastExecutionMetadata?: SponsorExecutionMetadata;

  private getApiKey(): string | undefined {
    return process.env.DOCTAVIAN_API_KEY;
  }

  private getBearerToken(): string | undefined {
    return (
      process.env.DOCTAVIAN_BEARER_TOKEN ||
      process.env.DOCTAVIAN_TOKEN ||
      process.env.DOCTAVIAN_JWT
    );
  }

  public async refreshAccessToken(): Promise<string | null> {
    const refreshToken = process.env.DOCTAVIAN_REFRESH_TOKEN;
    const clientId = process.env.DOCTAVIAN_CLIENT_ID || "11e71170-3499-43f3-b878-7df343f43d37";
    const refreshUrl = "https://demo.api.doctavian.com/public/v1/auth/microsoft/token";

    if (!refreshToken) return null;

    try {
      console.log("[DOCTAVIAN] Attempting automatic token refresh via Microsoft OAuth...");
      const params = new URLSearchParams();
      params.append("grant_type", "refresh_token");
      params.append("client_id", clientId);
      params.append("refresh_token", refreshToken);

      const res = await fetch(refreshUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.access_token) {
          process.env.DOCTAVIAN_BEARER_TOKEN = data.access_token;
          if (data.refresh_token) {
            process.env.DOCTAVIAN_REFRESH_TOKEN = data.refresh_token;
          }
          console.log("[DOCTAVIAN] Token refreshed successfully!");
          return data.access_token;
        }
      }
    } catch (err: any) {
      console.warn("[DOCTAVIAN] Automatic token refresh failed:", err.message);
    }
    return null;
  }

  public isConfigured(): boolean {
    const key = this.getApiKey();
    const token = this.getBearerToken();
    return Boolean((key && key.trim().length > 3) || (token && token.trim().length > 3));
  }

  public getBaseUrl(): string {
    const ep = process.env.DOCTAVIAN_ENDPOINT || "https://demo.api.doctavian.com";
    return ep
      .replace(/\/v1\/documents\/document\/create\/?$/, "")
      .replace(/\/v1\/documents\/document\/generate\/?$/, "")
      .replace(/\/documents\/document\/create\/?$/, "")
      .replace(/\/documents\/document\/generate\/?$/, "")
      .replace(/\/+$/, "");
  }

  public getEndpoint(): string {
    const raw = process.env.DOCTAVIAN_ENDPOINT || "https://demo.api.doctavian.com";
    const cleaned = raw.replace(/\/+$/, "");
    if (cleaned.endsWith("/documents/document/create") || cleaned.endsWith("/documents/document/generate")) {
      return cleaned;
    }
    return `${cleaned}/v1/documents/document/create`;
  }

  public getLastExecutionMetadata(): SponsorExecutionMetadata | undefined {
    return this.lastExecutionMetadata;
  }

  public hasLiveSucceeded(): boolean {
    return Boolean(this.lastExecutionMetadata?.live_request_succeeded);
  }

  public usedDemoFallback(): boolean {
    return Boolean(this.lastExecutionMetadata?.used_demo_fallback);
  }

  /**
   * Generates a deterministic, policy-bound contract document.
   * LIVE MODE: only when credentials are configured and the official Doctavian API call succeeds.
   * DEMO MODE: fallback to local deterministic template compiler if API call fails or key is missing.
   */
  public async generateContractDocument(
    facts: Record<string, ContractFact>,
    policyVersion: string = "1.4.0",
    version: number = 1
  ): Promise<DoctavianGenerationResult> {
    const vendorName = String(facts["vendor_name"]?.value || "Acme Cloud Services LLC");
    const contractValue = Number(facts["contract_value"]?.value || 87000);
    const liabilityCap = Number(facts["liability_cap"]?.value || 200000);
    const slaUptime = Number(facts["sla_uptime"]?.value || 99.9);
    const termMonths = Number(facts["term_months"]?.value || 12);
    const generatedAt = new Date().toISOString();
    const apiKey = this.getApiKey();
    const bearerToken = this.getBearerToken();
    const endpoint = this.getEndpoint();

    const title = `MASTER ENTERPRISE SERVICES AGREEMENT: ${vendorName.toUpperCase()}`;
    const docId = `DOC-SG-${Date.now().toString().slice(-6)}`;

    // LIVE MODE ATTEMPT: If API Key or Bearer Token is present in environment
    if (this.isConfigured()) {
      console.log(`[DOCTAVIAN] mode=LIVE request_started endpoint=${endpoint}`);
      try {
        const payload = {
          title,
          name: title.replace(/[^a-zA-Z0-9_-]/g, "_"),
          description: `SovereignGuard Cryptographically Bound Enterprise Contract for ${vendorName}`,
          fileFormat: "pdf",
          deliveryMethod: "Storage",
          variables: [
            { name: "vendor_name", value: vendorName, type: "global" },
            { name: "contract_value", value: String(contractValue), type: "global" },
            { name: "liability_cap", value: String(liabilityCap), type: "global" },
            { name: "sla_uptime", value: String(slaUptime), type: "global" },
            { name: "term_months", value: String(termMonths), type: "global" },
            { name: "policy_version", value: policyVersion, type: "global" },
            { name: "effective_date", value: generatedAt.split("T")[0], type: "global" },
          ],
        };

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-Doctavian-Client": "SovereignGuard/1.4",
        };

        if (apiKey) {
          headers["X-Api-Key"] = apiKey;
          headers["x-api-key"] = apiKey;
        }

        let tokenToUse = bearerToken;
        if (tokenToUse) {
          try {
            const parts = tokenToUse.split(".");
            if (parts.length === 3) {
              const jwtPayload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
              if (jwtPayload.exp && Date.now() >= (jwtPayload.exp - 60) * 1000) {
                const refreshed = await this.refreshAccessToken();
                if (refreshed) tokenToUse = refreshed;
              }
            }
          } catch (_) {}
        }

        if (tokenToUse) {
          headers["Authorization"] = `Bearer ${tokenToUse}`;
        }

        let response = await fetch(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(8000), // 8s timeout
        });

        // If 401 and refresh token is configured, auto-refresh token and retry once
        if (response.status === 401 && process.env.DOCTAVIAN_REFRESH_TOKEN) {
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            headers["Authorization"] = `Bearer ${refreshed}`;
            response = await fetch(endpoint, {
              method: "POST",
              headers,
              body: JSON.stringify(payload),
              signal: AbortSignal.timeout(8000),
            });
          }
        }

        if (response.ok) {
          const liveData = await response.json().catch(() => ({}));
          const realDocUrn =
            liveData.result?.data?.document?.documentGuid ||
            liveData.result?.data?.document?.urn ||
            liveData.document_id ||
            liveData.result?.data?.id ||
            docId;
          console.log(`[DOCTAVIAN] mode=LIVE request_succeeded docId=${realDocUrn}`);

          const canonicalContent = this.buildCanonicalContent(
            title,
            vendorName,
            termMonths,
            contractValue,
            liabilityCap,
            slaUptime,
            policyVersion,
            version,
            generatedAt,
            realDocUrn
          );
          const htmlContent = this.buildHtmlPreview(
            title,
            vendorName,
            termMonths,
            contractValue,
            liabilityCap,
            slaUptime,
            policyVersion,
            version,
            generatedAt,
            "Doctavian (Live API)"
          );
          const sha256_hash = computeSha256(canonicalContent);

          const executionMetadata: SponsorExecutionMetadata = {
            provider: "Doctavian",
            mode: "LIVE",
            live_request_succeeded: true,
            used_demo_fallback: false,
            endpoint,
            request_id: realDocUrn,
            timestamp: generatedAt,
          };
          this.lastExecutionMetadata = executionMetadata;

          return {
            document_id: realDocUrn,
            title,
            content: canonicalContent,
            html_rendered: htmlContent,
            sha256_hash,
            generator: "Doctavian (Live API)",
            integration_mode: "LIVE",
            template_id: "urn:doctavian:template:enterprise-saas-v1",
            version,
            generated_at: generatedAt,
            metadata: {
              engine: "Doctavian Cloud Document Generator",
              operationId: liveData.operationId || `op_${Date.now()}`,
              documentGuid: liveData.result?.data?.document?.documentGuid,
              subscriptionGuid: liveData.result?.data?.document?.subscriptionGuid,
              status: "200_OK",
            },
            execution_metadata: executionMetadata,
          };
        } else {
          const errBody = await response.text().catch(() => "");
          let failureCategory = "http_error";
          let failureDetail = `HTTP ${response.status}: ${response.statusText || errBody.slice(0, 80)}`;

          if (response.status === 401 || response.status === 403) {
            failureCategory = "invalid_credentials";
            failureDetail = `HTTP ${response.status} Unauthorized / Invalid credentials or unactivated API key`;
          } else if (response.status === 404) {
            failureCategory = "wrong_endpoint";
            failureDetail = `HTTP 404 Endpoint Not Found (${endpoint})`;
          }

          console.warn(`[DOCTAVIAN] mode=DEMO reason=${failureCategory} details="${failureDetail}"`);
          return this.buildDemoFallback(
            title,
            vendorName,
            termMonths,
            contractValue,
            liabilityCap,
            slaUptime,
            policyVersion,
            version,
            generatedAt,
            docId,
            `Doctavian API returned ${failureDetail}`
          );
        }
      } catch (err: any) {
        const isTimeout = err.name === "TimeoutError" || err.name === "AbortError" || /timeout/i.test(err.message);
        const reasonCategory = isTimeout ? "timeout_error" : "network_error";
        const reasonDetail = isTimeout ? "Request timed out after 8000ms" : `Network connection error: ${err.message}`;

        console.warn(`[DOCTAVIAN] mode=DEMO reason=${reasonCategory} details="${reasonDetail}"`);
        return this.buildDemoFallback(
          title,
          vendorName,
          termMonths,
          contractValue,
          liabilityCap,
          slaUptime,
          policyVersion,
          version,
          generatedAt,
          docId,
          `Doctavian connection failed: ${reasonDetail}`
        );
      }
    }

    // DEMO MODE: Missing credentials
    console.warn("[DOCTAVIAN] mode=DEMO reason=missing_credentials details=\"DOCTAVIAN_API_KEY / DOCTAVIAN_BEARER_TOKEN is not configured\"");
    return this.buildDemoFallback(
      title,
      vendorName,
      termMonths,
      contractValue,
      liabilityCap,
      slaUptime,
      policyVersion,
      version,
      generatedAt,
      docId,
      "DOCTAVIAN_API_KEY / DOCTAVIAN_BEARER_TOKEN not configured in environment"
    );
  }

  private buildDemoFallback(
    title: string,
    vendorName: string,
    termMonths: number,
    contractValue: number,
    liabilityCap: number,
    slaUptime: number,
    policyVersion: string,
    version: number,
    generatedAt: string,
    docId: string,
    fallbackReason: string
  ): DoctavianGenerationResult {
    const content = this.buildCanonicalContent(
      title,
      vendorName,
      termMonths,
      contractValue,
      liabilityCap,
      slaUptime,
      policyVersion,
      version,
      generatedAt,
      docId
    );
    const html_rendered = this.buildHtmlPreview(
      title,
      vendorName,
      termMonths,
      contractValue,
      liabilityCap,
      slaUptime,
      policyVersion,
      version,
      generatedAt,
      "Local Deterministic Template (Demo Mode)"
    );
    const sha256_hash = computeSha256(content);

    const executionMetadata: SponsorExecutionMetadata = {
      provider: "Doctavian",
      mode: "DEMO",
      live_request_succeeded: false,
      used_demo_fallback: true,
      fallback_reason: fallbackReason,
      endpoint: this.getEndpoint(),
      timestamp: generatedAt,
    };
    this.lastExecutionMetadata = executionMetadata;

    return {
      document_id: docId,
      title,
      content,
      html_rendered,
      sha256_hash,
      generator: "Local Deterministic Template (Demo Mode)",
      integration_mode: "DEMO",
      version,
      generated_at: generatedAt,
      metadata: { compiler: "SovereignGuard Invariant Engine", mode: "Deterministic Local Baseline" },
      execution_metadata: executionMetadata,
    };
  }

  private buildCanonicalContent(
    title: string,
    vendorName: string,
    termMonths: number,
    contractValue: number,
    liabilityCap: number,
    slaUptime: number,
    policyVersion: string,
    version: number,
    generatedAt: string,
    docId: string
  ): string {
    return `# ${title}
**Document Reference**: ${docId}
**Policy Security Version**: v${policyVersion}
**Document Revision**: v${version}.0
**Effective Date**: ${generatedAt.split("T")[0]}

---

### RECITALS
This Master Enterprise Services Agreement ("Agreement") is executed between **Customer Enterprise Corp** ("Customer") and **${vendorName}** ("Vendor").

### SECTION 1: SUBSCRIPTION TERM
The initial subscription term shall be **${termMonths} months** commencing on the Effective Date.

### SECTION 2: COMMERCIAL CONSIDERATION
Total annual contract consideration is fixed at **$${contractValue.toLocaleString("en-US")}.00 USD** payable under standard enterprise Net-30 payment terms.

### SECTION 3: LIMITATION OF LIABILITY
IN NO EVENT SHALL EITHER PARTY'S TOTAL AGGREGATE CUMULATIVE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT EXCEED **$${liabilityCap.toLocaleString("en-US")}.00 USD**.

### SECTION 4: SERVICE LEVEL AGREEMENT (SLA)
Vendor provides a guaranteed monthly system uptime commitment of **${slaUptime}%**, backed by pro-rata financial service level credits.

### SECTION 5: GOVERNANCE & SOVEREIGNGUARD FIREWALL SEAL
This document is deterministically generated and cryptographically sealed under SovereignGuard Invariant Policy Rules. Any modification to terms invalidates the digital integrity signature.

---
**CUSTOMER AUTHORIZED SIGNATORY**: ___________________________
**VENDOR AUTHORIZED SIGNATORY**: ___________________________
`;
  }

  private buildHtmlPreview(
    title: string,
    vendorName: string,
    termMonths: number,
    contractValue: number,
    liabilityCap: number,
    slaUptime: number,
    policyVersion: string,
    version: number,
    generatedAt: string,
    generatorLabel: string
  ): string {
    return `
      <div class="p-6 bg-slate-950 text-slate-100 rounded-lg font-mono text-sm leading-relaxed border border-slate-800 space-y-4">
        <div class="border-b border-cyan-500/30 pb-3 flex justify-between items-center">
          <span class="text-cyan-400 font-bold tracking-wider">${title}</span>
          <span class="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">${generatorLabel} (v${version}.0)</span>
        </div>
        <p class="text-xs text-slate-400">Effective Date: ${generatedAt.split("T")[0]} | Policy Seal: v${policyVersion}</p>
        <div class="space-y-3 pt-2">
          <p><strong>1. Subscription Term:</strong> Fixed ${termMonths} Months commitment.</p>
          <p><strong>2. Annual Contract Value:</strong> <span class="text-emerald-400 font-bold">$${contractValue.toLocaleString("en-US")}.00 USD</span> (Net-30)</p>
          <p><strong>3. Aggregate Liability Cap:</strong> <span class="text-indigo-400 font-bold">$${liabilityCap.toLocaleString("en-US")}.00 USD</span></p>
          <p><strong>4. Availability SLA:</strong> <span class="text-cyan-400 font-bold">${slaUptime}% Uptime</span> guarantee.</p>
        </div>
        <div class="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-500 flex justify-between">
          <span>Engine: ${generatorLabel}</span>
          <span class="text-slate-400">Cryptographic Invariant Bound</span>
        </div>
      </div>
    `;
  }
}

export const doctavianAdapter = new DoctavianAdapter();
