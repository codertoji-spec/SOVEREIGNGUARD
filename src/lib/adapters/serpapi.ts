import {
  MarketEvidenceReport,
  MarketEvidenceSource,
  PriceFrequency,
  SponsorExecutionMetadata,
} from "@/types/guard";
import { DEMO_MARKET_EVIDENCE } from "@/lib/demo/fixtures";

export interface ParsedPriceEvidence {
  raw_price_mentioned: string;
  raw_min: number;
  raw_max: number;
  frequency: PriceFrequency;
  normalized_annual_min?: number;
  normalized_annual_max?: number;
  normalization_formula?: string;
}

export class SerpApiAdapter {
  private lastExecutionMetadata?: SponsorExecutionMetadata;

  private getApiKey(): string | undefined {
    return process.env.SERPAPI_API_KEY;
  }

  public isConfigured(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.trim().length > 5);
  }

  public getEndpoint(): string {
    return "https://serpapi.com/search.json";
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
   * Performs independent market grounding search via SerpApi Google Search engine.
   * Extracts raw pricing, detects explicit frequency (MONTHLY, ANNUAL, ONE_TIME),
   * and normalizes strictly via mathematically justified, documented formulas.
   */
  public async searchMarketEvidence(
    query: string = "Acme Cloud enterprise SaaS pricing benchmark 2026",
    vendorQuote: number = 87000
  ): Promise<MarketEvidenceReport> {
    const apiKey = this.getApiKey();
    const timestamp = new Date().toISOString();

    if (this.isConfigured() && apiKey) {
      console.log(`[SERPAPI] mode=LIVE request_started query="${query}"`);
      try {
        const url = new URL("https://serpapi.com/search.json");
        url.searchParams.set("engine", "google");
        url.searchParams.set("q", query);
        url.searchParams.set("api_key", apiKey);
        url.searchParams.set("num", "5");

        const response = await fetch(url.toString(), {
          signal: AbortSignal.timeout(8000), // 8s timeout
        });

        if (response.ok) {
          const data = await response.json();

          if (data.error) {
            console.warn(`[SERPAPI] mode=DEMO reason=live_request_failed error="${data.error}"`);
            return this.buildDemoFallback(vendorQuote, query, `SerpApi API Error: ${data.error}`);
          }

          const organicResults = data.organic_results || [];
          console.log(`[SERPAPI] mode=LIVE request_succeeded organic_results=${organicResults.length}`);

          const executionMetadata: SponsorExecutionMetadata = {
            provider: "SerpApi",
            mode: "LIVE",
            live_request_succeeded: true,
            used_demo_fallback: false,
            endpoint: this.getEndpoint(),
            request_id: data.search_metadata?.id || `SERP-${Date.now()}`,
            timestamp,
          };
          this.lastExecutionMetadata = executionMetadata;

          // Parse and normalize sources
          const sources: MarketEvidenceSource[] = organicResults.slice(0, 5).map((r: any) => {
            const domain = this.extractDomain(r.link || "");
            const parsed = this.parsePriceEvidence(r.snippet || "", r.title || "");

            return {
              title: r.title || "Search Result",
              link: r.link || "#",
              domain,
              snippet: r.snippet || "",
              price_mentioned: parsed?.raw_price_mentioned,
              raw_price_mentioned: parsed?.raw_price_mentioned,
              frequency: parsed?.frequency || "UNKNOWN",
              raw_min: parsed?.raw_min,
              raw_max: parsed?.raw_max,
              normalized_annual_min: parsed?.normalized_annual_min,
              normalized_annual_max: parsed?.normalized_annual_max,
              normalization_formula: parsed?.normalization_formula,
              source_type: domain.includes("acme")
                ? "DIRECT_VENDOR_PRICING"
                : parsed?.raw_price_mentioned
                ? "THIRD_PARTY_BENCHMARK"
                : "SEARCH_RESULT",
            };
          });

          // Filter sources that yielded valid mathematically normalized annual ranges
          const normalizedSources = sources.filter(
            (s) => s.normalized_annual_min !== undefined && s.normalized_annual_max !== undefined
          );

          if (normalizedSources.length >= 1) {
            const allMins = normalizedSources.map((s) => s.normalized_annual_min!);
            const allMaxs = normalizedSources.map((s) => s.normalized_annual_max!);
            const minAnnual = Math.min(...allMins);
            const maxAnnual = Math.max(...allMaxs);

            const hasMonthlyNormalization = normalizedSources.some((s) => s.frequency === "MONTHLY");
            const is_consistent = vendorQuote >= minAnnual * 0.85 && vendorQuote <= maxAnnual * 1.15;

            const rawPriceList = normalizedSources
              .map((s) => `${s.raw_price_mentioned} (${s.frequency})`)
              .join(", ");

            const formulasList = normalizedSources
              .filter((s) => s.normalization_formula)
              .map((s) => s.normalization_formula)
              .join("; ");

            return {
              query,
              searched_at: timestamp,
              engine: "SerpApi (Live Google Search)",
              integration_mode: "LIVE",
              status: is_consistent ? "VERIFIED" : "DEVIATION",
              market_price_range: {
                min: minAnnual,
                max: maxAnnual,
                currency: "USD",
                frequency: "Annual",
                is_normalized: hasMonthlyNormalization,
                normalization_basis: hasMonthlyNormalization
                  ? `Normalized to annual benchmark: ${formulasList}`
                  : "Stated as annual baseline (1:1 comparison)",
              },
              vendor_quote: vendorQuote,
              vendor_frequency: "Annual",
              is_consistent,
              summary: `Live SerpApi query analyzed ${sources.length} sources and established a normalized annual benchmark of $${minAnnual.toLocaleString("en-US")} – $${maxAnnual.toLocaleString("en-US")} USD/yr based on ${normalizedSources.length} external evidence points (${rawPriceList}). Vendor quote of $${vendorQuote.toLocaleString("en-US")}/yr is ${is_consistent ? "consistent with" : "deviates from"} the normalized market range.`,
              sources,
              evidence_classification: {
                direct_vendor_pricing: `Vendor Quote: $${vendorQuote.toLocaleString("en-US")}.00 USD / Annual`,
                third_party_pricing: rawPriceList,
                normalized_benchmark: `$${minAnnual.toLocaleString("en-US")} – $${maxAnnual.toLocaleString("en-US")} USD / Annual (${formulasList})`,
                inferred_market_range: `$${minAnnual.toLocaleString("en-US")} – $${maxAnnual.toLocaleString("en-US")} USD / Annual`,
                ai_interpretation: is_consistent
                  ? `Vendor's annual quote ($${vendorQuote.toLocaleString("en-US")}/yr) falls within the normalized third-party market range ($${minAnnual.toLocaleString("en-US")} – $${maxAnnual.toLocaleString("en-US")}/yr).`
                  : `Vendor's annual quote ($${vendorQuote.toLocaleString("en-US")}/yr) falls outside the normalized third-party market range ($${minAnnual.toLocaleString("en-US")} – $${maxAnnual.toLocaleString("en-US")}/yr).`,
              },
              execution_metadata: executionMetadata,
            };
          }

          // If no reliable pricing frequency data could be normalized
          return {
            query,
            searched_at: timestamp,
            engine: "SerpApi (Live Google Search)",
            integration_mode: "LIVE",
            status: "INSUFFICIENT_EXTERNAL_EVIDENCE",
            market_price_range: null,
            vendor_quote: vendorQuote,
            vendor_frequency: "Annual",
            is_consistent: null,
            summary: `Live SerpApi query returned ${sources.length} results, but insufficient comparable pricing frequency data was available to establish a normalized annual market benchmark.`,
            sources,
            evidence_classification: {
              direct_vendor_pricing: `Vendor Quote: $${vendorQuote.toLocaleString("en-US")}.00 USD / Annual`,
              third_party_pricing: "Insufficient frequency-tagged pricing in search snippets",
              normalized_benchmark: "No comparable annual benchmark could be mathematically normalized",
              inferred_market_range: "Inconclusive benchmark",
              ai_interpretation: "External web search results did not contain sufficient frequency-tagged pricing evidence.",
            },
            execution_metadata: executionMetadata,
          };
        } else {
          console.warn(`[SERPAPI] mode=DEMO reason=live_request_failed HTTP_${response.status}`);
          return this.buildDemoFallback(vendorQuote, query, `SerpApi returned HTTP ${response.status}`);
        }
      } catch (err: any) {
        console.warn(`[SERPAPI] mode=DEMO reason=live_request_failed error="${err.message}"`);
        return this.buildDemoFallback(vendorQuote, query, `Network/Timeout error: ${err.message}`);
      }
    }

    console.log("[SERPAPI] mode=DEMO reason=missing_credentials");
    return this.buildDemoFallback(vendorQuote, query, "SERPAPI_API_KEY not configured in environment");
  }

  private buildDemoFallback(vendorQuote: number, query: string, fallbackReason: string): MarketEvidenceReport {
    const timestamp = new Date().toISOString();
    const demo = JSON.parse(JSON.stringify(DEMO_MARKET_EVIDENCE)) as MarketEvidenceReport;
    demo.query = query;
    demo.vendor_quote = vendorQuote;
    demo.searched_at = timestamp;
    demo.engine = "SerpApi (Demo Cache)";
    demo.integration_mode = "DEMO";

    const executionMetadata: SponsorExecutionMetadata = {
      provider: "SerpApi",
      mode: "DEMO",
      live_request_succeeded: false,
      used_demo_fallback: true,
      fallback_reason: fallbackReason,
      endpoint: this.getEndpoint(),
      timestamp,
    };
    demo.execution_metadata = executionMetadata;
    this.lastExecutionMetadata = executionMetadata;

    return demo;
  }

  /**
   * Extracts raw price tokens and detects frequency (MONTHLY, ANNUAL, ONE_TIME, UNKNOWN).
   * Normalizes monthly -> annual via explicit calculation: $/mo * 12 = $/yr.
   */
  public parsePriceEvidence(snippet: string, title: string = ""): ParsedPriceEvidence | null {
    const text = `${title} ${snippet}`;
    if (!text || !text.includes("$")) return null;

    // Match patterns like:
    // $3,000 - $15,000/month, $1,500/mo, $85,000 - $90,000 per year, $82,000/yr, $5,000 setup fee
    const rangeRegex = /\$([0-9,]+)(?:\s*(?:-|to|–)\s*\$([0-9,]+))?(?:\s*(?:\/|per|a)\s*(month|mo|year|yr|annum|annual|user|seat))?/gi;
    
    let match: RegExpExecArray | null = null;
    let bestParsed: ParsedPriceEvidence | null = null;

    while ((match = rangeRegex.exec(text)) !== null) {
      const fullMatchStr = match[0].trim();
      const val1 = parseFloat(match[1].replace(/,/g, ""));
      const val2 = match[2] ? parseFloat(match[2].replace(/,/g, "")) : undefined;
      const explicitUnit = (match[3] || "").toLowerCase();

      if (isNaN(val1) || val1 < 100) continue; // Ignore trivial dollar figures like $5 or $10

      const rawMin = val1;
      const rawMax = val2 !== undefined && !isNaN(val2) ? Math.max(val1, val2) : val1;
      const minActual = Math.min(rawMin, rawMax);
      const maxActual = Math.max(rawMin, rawMax);

      // Context window surrounding the match (30 chars before and after)
      const startIdx = Math.max(0, match.index - 40);
      const endIdx = Math.min(text.length, match.index + fullMatchStr.length + 40);
      const context = text.slice(startIdx, endIdx).toLowerCase();

      // Determine frequency
      let frequency: PriceFrequency = "UNKNOWN";

      if (
        explicitUnit.includes("mo") ||
        explicitUnit.includes("month") ||
        context.includes("/mo") ||
        context.includes("/month") ||
        context.includes("per month") ||
        context.includes("a month") ||
        context.includes("monthly")
      ) {
        frequency = "MONTHLY";
      } else if (
        explicitUnit.includes("yr") ||
        explicitUnit.includes("year") ||
        explicitUnit.includes("annum") ||
        explicitUnit.includes("annual") ||
        context.includes("/yr") ||
        context.includes("/year") ||
        context.includes("per year") ||
        context.includes("annually") ||
        context.includes("annual") ||
        context.includes("yearly")
      ) {
        frequency = "ANNUAL";
      } else if (
        context.includes("setup fee") ||
        context.includes("one-time") ||
        context.includes("implementation") ||
        context.includes("flat fee")
      ) {
        frequency = "ONE_TIME";
      } else {
        // Fallback context heuristics if no unit attached
        if (minActual >= 20000) {
          frequency = "ANNUAL";
        } else if (maxActual <= 15000 && (context.includes("subscription") || context.includes("tier") || context.includes("plan"))) {
          frequency = "MONTHLY";
        }
      }

      // Compute mathematically justified normalization
      let normMin: number | undefined;
      let normMax: number | undefined;
      let formula: string | undefined;

      if (frequency === "MONTHLY") {
        normMin = minActual * 12;
        normMax = maxActual * 12;
        formula = minActual === maxActual
          ? `$${minActual.toLocaleString("en-US")}/mo × 12 = $${normMin.toLocaleString("en-US")}/yr`
          : `$${minActual.toLocaleString("en-US")}–$${maxActual.toLocaleString("en-US")}/mo × 12 = $${normMin.toLocaleString("en-US")}–$${normMax.toLocaleString("en-US")}/yr`;
      } else if (frequency === "ANNUAL") {
        normMin = minActual;
        normMax = maxActual;
        formula = minActual === maxActual
          ? `$${minActual.toLocaleString("en-US")}/yr (Annual 1:1)`
          : `$${minActual.toLocaleString("en-US")}–$${maxActual.toLocaleString("en-US")}/yr (Annual 1:1)`;
      } else {
        // ONE_TIME or UNKNOWN -> Do NOT convert to recurring annual rate without evidence
        normMin = undefined;
        normMax = undefined;
        formula = undefined;
      }

      const rawPriceMentioned = minActual === maxActual
        ? `$${minActual.toLocaleString("en-US")}${frequency === "MONTHLY" ? "/mo" : frequency === "ANNUAL" ? "/yr" : ""}`
        : `$${minActual.toLocaleString("en-US")} - $${maxActual.toLocaleString("en-US")}${frequency === "MONTHLY" ? "/mo" : frequency === "ANNUAL" ? "/yr" : ""}`;

      bestParsed = {
        raw_price_mentioned: rawPriceMentioned,
        raw_min: minActual,
        raw_max: maxActual,
        frequency,
        normalized_annual_min: normMin,
        normalized_annual_max: normMax,
        normalization_formula: formula,
      };

      // If we found a clear frequency-tagged range or value, stop iterating
      if (frequency !== "UNKNOWN") break;
    }

    return bestParsed;
  }

  private extractDomain(urlStr: string): string {
    try {
      const u = new URL(urlStr);
      return u.hostname.replace("www.", "");
    } catch {
      return "external-source.com";
    }
  }
}

export const serpApiAdapter = new SerpApiAdapter();
