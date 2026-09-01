export type SourceType = "DOCUMENT" | "WEB" | "POLICY" | "AGENT";
export type IntegrationMode = "LIVE" | "DEMO";

export type VerificationStatus = "PASS" | "FAIL" | "WARNING" | "SKIPPED";
export type SeverityLevel = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type RunStatus =
  | "INITIALIZED"
  | "EXTRACTION_IN_PROGRESS"
  | "EXTRACTED"
  | "VERIFYING_MARKET"
  | "MARKET_VERIFIED"
  | "EVALUATING_POLICY"
  | "POLICY_PASSED"
  | "POLICY_FAILED"
  | "DOCUMENT_GENERATED"
  | "TAMPER_DETECTED"
  | "AWAITING_HUMAN_APPROVAL"
  | "HUMAN_APPROVED"
  | "HUMAN_REJECTED"
  | "FOXIT_ENVELOPE_CREATED"
  | "SIGNED_AND_SEALED"
  | "BLOCKED";

export interface SponsorExecutionMetadata {
  provider: "Nutrient" | "SerpApi" | "Doctavian" | "Foxit eSign";
  mode: IntegrationMode;
  live_request_succeeded: boolean;
  used_demo_fallback: boolean;
  endpoint?: string;
  request_id?: string;
  timestamp: string;
  fallback_reason?: string;
}

export interface EvidenceItem {
  id: string;
  source_type: SourceType;
  source: string;
  page?: number;
  snippet?: string;
  claim: string;
  confidence: number;
  timestamp: string;
  url?: string;
  query?: string;
  evidence_classification?: "DIRECT_VENDOR_CLAIM" | "THIRD_PARTY_BENCHMARK" | "POLICY_INVARIANT" | "AGENT_PROPOSAL";
}

export interface ContractFact {
  key: string;
  label: string;
  value: string | number | boolean;
  formatted_value: string;
  evidence: EvidenceItem;
  category: "commercial" | "legal" | "sla" | "compliance";
}

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  field: string;
  operator: "LTE" | "GTE" | "EQ" | "IN" | "NOT_IN" | "CONTAINS" | "NOT_CONTAINS";
  threshold: number | string | boolean | string[];
  severity: SeverityLevel;
  required: boolean;
}

export interface GuardPolicy {
  id: string;
  version: string;
  name: string;
  description: string;
  rules: {
    max_contract_value: number;
    max_liability: number;
    min_sla: number;
    max_term_months: number;
    human_approval_required: boolean;
    allowed_vendors: string[];
    blocked_clauses: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface PolicyCheckResult {
  rule_name: string;
  field: string;
  actual_value: string | number | boolean;
  allowed_value: string | number | boolean | string[];
  status: VerificationStatus;
  severity: SeverityLevel;
  message: string;
  evidence_ref?: string;
}

export interface PolicyEvaluation {
  allowed: boolean;
  policy_id: string;
  policy_version: string;
  evaluated_at: string;
  checks: PolicyCheckResult[];
  violations: PolicyCheckResult[];
  warnings: PolicyCheckResult[];
  overall_status: "PASS" | "FAIL" | "WARNING";
}

export interface DocumentVersionRecord {
  version: number;
  document_id: string;
  sha256_hash: string;
  title: string;
  content: string;
  html_rendered: string;
  generator: string;
  integration_mode: IntegrationMode;
  created_at: string;
  is_tampered?: boolean;
}

export interface DocumentIntegrity {
  document_id: string;
  version: number;
  sha256_hash: string;
  generated_at: string;
  generator: string;
  integration_mode: IntegrationMode;
  is_tampered: boolean;
  execution_metadata?: SponsorExecutionMetadata;
  tamper_details?: {
    original_hash: string;
    tampered_hash: string;
    original_version: number;
    tampered_version: number;
    modified_fields: Record<string, { from: any; to: any }>;
    detected_at: string;
  };
}

export interface ApprovalTokenPayload {
  approval_id: string;
  run_id: string;
  contract_id: string;
  contract_version: number;
  document_hash: string;
  policy_version: string;
  approved_by: {
    name: string;
    email: string;
    role: string;
  };
  approved_at: string;
  expires_at: string;
}

export interface HumanApprovalRecord {
  approval_id: string;
  approved: boolean;
  reviewer_name: string;
  reviewer_email: string;
  reviewer_role: string;
  reviewed_at: string;
  expires_at: string;
  comments?: string;
  signature_token: string;
  approved_document_hash: string;
  approved_document_version: number;
  approved_contract_id: string;
  approved_policy_version: string;
}

export interface FoxitSigningEnvelope {
  envelope_id: string;
  document_name: string;
  status: "CREATED" | "SENT" | "VIEWED" | "COMPLETED" | "DECLINED";
  created_at: string;
  expires_at: string;
  recipients: Array<{
    name: string;
    email: string;
    role: "SIGNER" | "APPROVER" | "CC";
    status: "PENDING" | "SIGNED" | "DECLINED";
    signed_at?: string;
  }>;
  document_hash: string;
  audit_certificate_id: string;
  provider: string;
  integration_mode: IntegrationMode;
  view_url?: string;
  execution_metadata?: SponsorExecutionMetadata;
}

export type AuditEventType =
  | "AGENT_REQUEST_RECEIVED"
  | "DOCUMENT_RECEIVED"
  | "DOCUMENT_EXTRACTED"
  | "EXTERNAL_VERIFICATION"
  | "POLICY_EVALUATED"
  | "CONTRACT_GENERATED"
  | "HASH_CREATED"
  | "TAMPER_ATTEMPTED"
  | "POLICY_VIOLATION"
  | "HASH_MISMATCH"
  | "SIGNING_BLOCKED"
  | "HUMAN_APPROVAL"
  | "SIGNING_REQUESTED"
  | "SIGNING_COMPLETED"
  | "SIGNING_FAILED"
  | "POLICY_UPDATED";

export interface AuditEvent {
  id: string;
  run_id: string;
  timestamp: string;
  event_type: AuditEventType;
  actor: "AI_AGENT" | "SOVEREIGNGUARD_FIREWALL" | "HUMAN_REVIEWER" | "SYSTEM";
  severity: SeverityLevel;
  title: string;
  description: string;
  metadata: Record<string, any>;
  previous_hash: string;
  state_hash: string;
}

export interface AgentIntent {
  vendor: string;
  contract_type: string;
  description: string;
  requested_price: number;
  requested_term_months: number;
  requested_liability: number;
  requested_sla: number;
  human_approval_flag: boolean;
  agent_id: string;
  agent_model: string;
}

export type PriceFrequency = "ANNUAL" | "MONTHLY" | "ONE_TIME" | "UNKNOWN";

export interface MarketEvidenceSource {
  title: string;
  link: string;
  domain: string;
  snippet: string;
  price_mentioned?: string;
  raw_price_mentioned?: string;
  frequency?: PriceFrequency;
  raw_min?: number;
  raw_max?: number;
  normalized_annual_min?: number;
  normalized_annual_max?: number;
  normalization_formula?: string;
  source_type: "DIRECT_VENDOR_PRICING" | "THIRD_PARTY_BENCHMARK" | "SEARCH_RESULT";
}

export interface MarketEvidenceReport {
  query: string;
  searched_at: string;
  engine: string;
  integration_mode: IntegrationMode;
  status: "VERIFIED" | "INSUFFICIENT_EXTERNAL_EVIDENCE" | "DEVIATION";
  market_price_range?: {
    min: number;
    max: number;
    currency: string;
    frequency: string;
    is_normalized?: boolean;
    normalization_basis?: string;
  } | null;
  vendor_quote: number;
  vendor_frequency?: string;
  is_consistent: boolean | null;
  summary: string;
  sources: MarketEvidenceSource[];
  evidence_classification: {
    direct_vendor_pricing?: string;
    third_party_pricing?: string;
    normalized_benchmark?: string;
    inferred_market_range?: string;
    ai_interpretation: string;
  };
  execution_metadata?: SponsorExecutionMetadata;
}

export interface AgentRun {
  id: string;
  created_at: string;
  updated_at: string;
  agent_intent: AgentIntent;
  status: RunStatus;
  is_attack_simulated: boolean;
  blocked_reason?: string;
  
  // Data extraction & Evidence (Nutrient)
  extracted_facts: Record<string, ContractFact>;
  raw_document_text?: string;
  document_name: string;
  
  // Market Grounding (SerpApi)
  market_evidence?: MarketEvidenceReport;
  
  // Policy Evaluation (Deterministic Engine)
  policy_id: string;
  policy_evaluation?: PolicyEvaluation;
  
  // Document Generation & Version History (Doctavian)
  generated_document?: {
    title: string;
    content: string;
    html_rendered: string;
    version: number;
  };
  document_integrity?: DocumentIntegrity;
  document_versions: DocumentVersionRecord[];
  
  // Human Gate
  human_approval?: HumanApprovalRecord;
  
  // Foxit eSign Envelope
  foxit_envelope?: FoxitSigningEnvelope;
  
  // Sponsor Modes & Execution Metadata
  sponsor_modes: {
    nutrient: IntegrationMode;
    serpapi: IntegrationMode;
    doctavian: IntegrationMode;
    foxit: IntegrationMode;
  };
  sponsor_metadata?: {
    nutrient?: SponsorExecutionMetadata;
    serpapi?: SponsorExecutionMetadata;
    doctavian?: SponsorExecutionMetadata;
    foxit?: SponsorExecutionMetadata;
  };
}

export interface SponsorStatus {
  name: "Nutrient" | "SerpApi" | "Doctavian" | "Foxit eSign";
  role: string;
  status: IntegrationMode;
  configured: boolean;
  live_request_succeeded?: boolean;
  used_demo_fallback?: boolean;
  fallback_reason?: string;
  details: string;
  endpoint: string;
}
