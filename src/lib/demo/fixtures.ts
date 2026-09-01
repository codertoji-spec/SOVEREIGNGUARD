import { GuardPolicy, AgentIntent, ContractFact, MarketEvidenceReport } from "@/types/guard";

export const DEFAULT_GUARD_POLICY: GuardPolicy = {
  id: "POL-SEC-2026-001",
  version: "1.4.0",
  name: "Enterprise SaaS Procurement Security Policy",
  description:
    "Strict authorization policy governing autonomous AI agent vendor negotiations, contractual liability limits, SLA baselines, and mandatory human sign-off gates.",
  rules: {
    max_contract_value: 100000, // $100,000 max
    max_liability: 250000,      // $250,000 max
    min_sla: 99.9,             // 99.9% min uptime
    max_term_months: 12,        // 12 months max
    human_approval_required: true,
    allowed_vendors: ["Acme Cloud", "Acme Corporation", "CloudFlare Enterprise", "Datadog Inc"],
    blocked_clauses: [
      "unlimited indemnity",
      "automatic perpetual renewal without 30-day notice",
      "waiver of jury trial in foreign jurisdiction",
    ],
  },
  created_at: "2026-01-15T08:00:00.000Z",
  updated_at: "2026-08-30T10:00:00.000Z",
};

export const DEMO_AGENT_INTENT: AgentIntent = {
  vendor: "Acme Cloud",
  contract_type: "Enterprise SaaS Subscription Agreement",
  description:
    "Negotiate 12-month cloud infrastructure platform subscription with Acme Cloud for engineering team compute & database workloads.",
  requested_price: 87000,
  requested_term_months: 12,
  requested_liability: 200000,
  requested_sla: 99.9,
  human_approval_flag: true,
  agent_id: "AGENT-PROCURE-09",
  agent_model: "Gemini-3.7-Pro (Autonomous Procurement Worker)",
};

export const DEMO_EXTRACTED_FACTS: Record<string, ContractFact> = {
  vendor_name: {
    key: "vendor_name",
    label: "Vendor Entity",
    value: "Acme Cloud",
    formatted_value: "Acme Cloud Services LLC",
    category: "commercial",
    evidence: {
      id: "EVID-DOC-01",
      source_type: "DOCUMENT",
      source: "Acme-Cloud-Enterprise-Proposal-2026.pdf",
      page: 1,
      snippet: 'This Enterprise SaaS Agreement is entered into by and between Acme Cloud Services LLC ("Vendor")...',
      claim: "Vendor entity is identified as Acme Cloud Services LLC",
      confidence: 0.99,
      timestamp: "2026-08-31T09:41:04.120Z",
    },
  },
  contract_value: {
    key: "contract_value",
    label: "Annual Contract Value",
    value: 87000,
    formatted_value: "$87,000.00 USD / Year",
    category: "commercial",
    evidence: {
      id: "EVID-DOC-02",
      source_type: "DOCUMENT",
      source: "Acme-Cloud-Enterprise-Proposal-2026.pdf",
      page: 3,
      snippet: "Section 4.1 Commercial Pricing: Total Annual Subscription Fee shall be payable as $87,000.00 net 30.",
      claim: "Total annual contract price is $87,000.00",
      confidence: 0.98,
      timestamp: "2026-08-31T09:41:04.890Z",
    },
  },
  term_months: {
    key: "term_months",
    label: "Subscription Term",
    value: 12,
    formatted_value: "12 Months (Fixed Term)",
    category: "commercial",
    evidence: {
      id: "EVID-DOC-03",
      source_type: "DOCUMENT",
      source: "Acme-Cloud-Enterprise-Proposal-2026.pdf",
      page: 4,
      snippet: "Section 5.1 Term: The initial subscription term shall commence on execution and continue for a period of twelve (12) months.",
      claim: "Term is fixed at 12 months duration",
      confidence: 0.97,
      timestamp: "2026-08-31T09:41:05.100Z",
    },
  },
  liability_cap: {
    key: "liability_cap",
    label: "Aggregate Liability Cap",
    value: 200000,
    formatted_value: "$200,000.00 USD",
    category: "legal",
    evidence: {
      id: "EVID-DOC-04",
      source_type: "DOCUMENT",
      source: "Acme-Cloud-Enterprise-Proposal-2026.pdf",
      page: 7,
      snippet: "Section 8.2 Limitation of Liability: In no event shall either party's aggregate aggregate cumulative liability exceed $200,000.00 USD.",
      claim: "Total liability cap is limited to $200,000.00",
      confidence: 0.96,
      timestamp: "2026-08-31T09:41:05.610Z",
    },
  },
  sla_uptime: {
    key: "sla_uptime",
    label: "Uptime SLA Guarantee",
    value: 99.9,
    formatted_value: "99.9% Monthly Uptime",
    category: "sla",
    evidence: {
      id: "EVID-DOC-05",
      source_type: "DOCUMENT",
      source: "Acme-Cloud-Enterprise-Proposal-2026.pdf",
      page: 11,
      snippet: "Exhibit B - Service Level Agreement: Vendor commits to 99.9% monthly availability with financial service credits for outages.",
      claim: "Uptime availability commitment is 99.9%",
      confidence: 0.99,
      timestamp: "2026-08-31T09:41:06.010Z",
    },
  },
  termination_notice: {
    key: "termination_notice",
    label: "Termination Notice Window",
    value: 30,
    formatted_value: "30 Days Written Notice",
    category: "legal",
    evidence: {
      id: "EVID-DOC-06",
      source_type: "DOCUMENT",
      source: "Acme-Cloud-Enterprise-Proposal-2026.pdf",
      page: 5,
      snippet: "Section 5.3 Termination for Convenience: Either party may terminate upon thirty (30) days prior written notice.",
      claim: "Termination for convenience window is 30 days",
      confidence: 0.95,
      timestamp: "2026-08-31T09:41:06.320Z",
    },
  },
};

export const DEMO_MARKET_EVIDENCE: MarketEvidenceReport = {
  query: "Acme Cloud enterprise SaaS pricing benchmark 2026",
  searched_at: "2026-08-31T09:41:08.200Z",
  engine: "SerpApi (Demo Cache)",
  integration_mode: "DEMO",
  status: "VERIFIED",
  market_price_range: {
    min: 82000,
    max: 92000,
    currency: "USD",
    frequency: "Annual",
  },
  vendor_quote: 87000,
  is_consistent: true,
  summary:
    "Vendor quote of $87,000/yr falls solidly within the verified market median ($82,000 – $92,000) for Tier-2 enterprise cloud compute contracts of equivalent seat tiers.",
  evidence_classification: {
    direct_vendor_pricing: "Proposal Quote: $87,000/yr",
    third_party_pricing: "Extracted Range: $82,000 – $92,000",
    inferred_market_range: "$82,000 – $92,000 USD",
    ai_interpretation: "Vendor quote falls squarely within independent market pricing data.",
  },
  sources: [
    {
      title: "Acme Cloud Enterprise Tier Pricing Guide (2026)",
      link: "https://cloudbenchmarks.io/vendor/acme-cloud/pricing-2026",
      domain: "cloudbenchmarks.io",
      source_type: "THIRD_PARTY_BENCHMARK",
      snippet: "Standard enterprise tier for 50-100 seats averages $85,000-$90,000 per year with dedicated SLA guarantees.",
      price_mentioned: "$85,000 - $90,000/yr",
    },
    {
      title: "Gartner Peer Insights: Cloud Infrastructure Procurement Index",
      link: "https://gartner.com/reviews/market/cloud-procurement/acme-cloud",
      domain: "gartner.com",
      source_type: "THIRD_PARTY_BENCHMARK",
      snippet: "Median contract value reported by enterprise buyers was $88,400 with 99.9% uptime SLA.",
      price_mentioned: "$88,400 median",
    },
    {
      title: "TechTarget Enterprise SaaS Pricing Breakdown",
      link: "https://techtarget.com/enterprise-cloud/acme-pricing-analysis",
      domain: "techtarget.com",
      source_type: "THIRD_PARTY_BENCHMARK",
      snippet: "Negotiated rates typically settle between $82,000 and $92,000 for standard 12-month commitments.",
      price_mentioned: "$82,000 - $92,000",
    },
  ],
};

export const DEMO_ATTACK_PAYLOAD = {
  liability_cap: 5000000, // $5 Million (Violates $250k ceiling by 20x!)
  contract_value: 87000,
  sla_uptime: 99.9,
  term_months: 12,
  vendor_name: "Acme Cloud",
  attack_vector: "Prompt Injection / Rogue Drift",
  attack_description:
    "Agent attempted to substitute an altered contract payload modifying Section 8.2 (Limitation of Liability) from $200,000 to $5,000,000 immediately prior to e-signature dispatch.",
};
