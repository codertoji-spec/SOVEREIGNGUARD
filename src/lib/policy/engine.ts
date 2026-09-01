import {
  GuardPolicy,
  ContractFact,
  PolicyEvaluation,
  PolicyCheckResult,
} from "@/types/guard";

/**
 * Deterministic Policy Engine for SovereignGuard.
 * This engine makes authorization decisions purely via verifiable code logic,
 * NEVER delegating critical authorization boundaries to non-deterministic LLM inference.
 */
export function evaluateContract(
  facts: Record<string, ContractFact>,
  policy: GuardPolicy
): PolicyEvaluation {
  const checks: PolicyCheckResult[] = [];
  const violations: PolicyCheckResult[] = [];
  const warnings: PolicyCheckResult[] = [];

  // Helper to extract typed values safely
  const getNumericFact = (key: string, defaultVal = 0): number => {
    const val = facts[key]?.value;
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      const parsed = parseFloat(val.replace(/[^0-9.-]+/g, ""));
      return isNaN(parsed) ? defaultVal : parsed;
    }
    return defaultVal;
  };

  const getStringFact = (key: string, defaultVal = ""): string => {
    const val = facts[key]?.value;
    return typeof val === "string" ? val : defaultVal;
  };

  // 1. Check: Maximum Contract Value
  const actualPrice = getNumericFact("contract_value", 0);
  const maxPrice = policy.rules.max_contract_value;
  const priceCheck: PolicyCheckResult = {
    rule_name: "Maximum Contract Value",
    field: "contract_value",
    actual_value: actualPrice,
    allowed_value: maxPrice,
    status: actualPrice <= maxPrice ? "PASS" : "FAIL",
    severity: "CRITICAL",
    message:
      actualPrice <= maxPrice
        ? `Contract price $${actualPrice.toLocaleString("en-US")} is within authorized ceiling of $${maxPrice.toLocaleString("en-US")}`
        : `Contract price $${actualPrice.toLocaleString("en-US")} exceeds authorized limit of $${maxPrice.toLocaleString("en-US")}`,
    evidence_ref: facts["contract_value"]?.evidence?.id,
  };
  checks.push(priceCheck);
  if (priceCheck.status === "FAIL") violations.push(priceCheck);

  // 2. Check: Maximum Liability Cap
  const actualLiability = getNumericFact("liability_cap", 0);
  const maxLiability = policy.rules.max_liability;
  const liabilityCheck: PolicyCheckResult = {
    rule_name: "Maximum Liability Exposure",
    field: "liability_cap",
    actual_value: actualLiability,
    allowed_value: maxLiability,
    status: actualLiability <= maxLiability ? "PASS" : "FAIL",
    severity: "CRITICAL",
    message:
      actualLiability <= maxLiability
        ? `Liability cap $${actualLiability.toLocaleString("en-US")} is compliant with max threshold of $${maxLiability.toLocaleString("en-US")}`
        : `CRITICAL RISK: Proposed liability $${actualLiability.toLocaleString("en-US")} exceeds authorized limit of $${maxLiability.toLocaleString("en-US")}`,
    evidence_ref: facts["liability_cap"]?.evidence?.id,
  };
  checks.push(liabilityCheck);
  if (liabilityCheck.status === "FAIL") violations.push(liabilityCheck);

  // 3. Check: Minimum Service Level Agreement (SLA)
  const actualSLA = getNumericFact("sla_uptime", 0);
  const minSLA = policy.rules.min_sla;
  const slaCheck: PolicyCheckResult = {
    rule_name: "Minimum Uptime SLA",
    field: "sla_uptime",
    actual_value: actualSLA,
    allowed_value: minSLA,
    status: actualSLA >= minSLA ? "PASS" : "FAIL",
    severity: "HIGH",
    message:
      actualSLA >= minSLA
        ? `SLA commitment of ${actualSLA}% satisfies minimum standard of ${minSLA}%`
        : `SLA commitment of ${actualSLA}% is below required threshold of ${minSLA}%`,
    evidence_ref: facts["sla_uptime"]?.evidence?.id,
  };
  checks.push(slaCheck);
  if (slaCheck.status === "FAIL") violations.push(slaCheck);

  // 4. Check: Maximum Term Duration (Months)
  const actualTerm = getNumericFact("term_months", 12);
  const maxTerm = policy.rules.max_term_months;
  const termCheck: PolicyCheckResult = {
    rule_name: "Maximum Commitment Duration",
    field: "term_months",
    actual_value: actualTerm,
    allowed_value: maxTerm,
    status: actualTerm <= maxTerm ? "PASS" : "FAIL",
    severity: "MEDIUM",
    message:
      actualTerm <= maxTerm
        ? `Contract duration ${actualTerm} months is within policy limit of ${maxTerm} months`
        : `Contract duration ${actualTerm} months exceeds policy limit of ${maxTerm} months`,
    evidence_ref: facts["term_months"]?.evidence?.id,
  };
  checks.push(termCheck);
  if (termCheck.status === "FAIL") violations.push(termCheck);

  // 5. Check: Allowed Vendors Whitelist
  const actualVendor = getStringFact("vendor_name", "");
  const allowedVendors = policy.rules.allowed_vendors || [];
  const isVendorAllowed =
    allowedVendors.length === 0 ||
    allowedVendors.some((v) => v.toLowerCase().trim() === actualVendor.toLowerCase().trim());
  const vendorCheck: PolicyCheckResult = {
    rule_name: "Vendor Whitelist Compliance",
    field: "vendor_name",
    actual_value: actualVendor,
    allowed_value: allowedVendors,
    status: isVendorAllowed ? "PASS" : "FAIL",
    severity: "HIGH",
    message: isVendorAllowed
      ? `Vendor "${actualVendor}" is approved under enterprise procurement guidelines`
      : `Vendor "${actualVendor}" is NOT in the authorized enterprise vendor whitelist`,
    evidence_ref: facts["vendor_name"]?.evidence?.id,
  };
  checks.push(vendorCheck);
  if (vendorCheck.status === "FAIL") violations.push(vendorCheck);

  // 6. Check: Blocked Prohibitive Clauses
  const blockedClauses = policy.rules.blocked_clauses || [];
  const rawTermsText = getStringFact("raw_terms_snippet", "").toLowerCase();
  for (const clause of blockedClauses) {
    if (clause && rawTermsText.includes(clause.toLowerCase())) {
      const clauseCheck: PolicyCheckResult = {
        rule_name: `Prohibited Clause: ${clause}`,
        field: "blocked_clauses",
        actual_value: `Contains "${clause}"`,
        allowed_value: `Must not contain "${clause}"`,
        status: "FAIL",
        severity: "CRITICAL",
        message: `Contract contains prohibited clause: "${clause}"`,
      };
      checks.push(clauseCheck);
      violations.push(clauseCheck);
    }
  }

  // 7. Check: Human Authorization Requirement Flag
  const humanReqCheck: PolicyCheckResult = {
    rule_name: "Human In-The-Loop Approval Gate",
    field: "human_approval_required",
    actual_value: policy.rules.human_approval_required ? "MANDATORY" : "OPTIONAL",
    allowed_value: policy.rules.human_approval_required ? "MANDATORY" : "OPTIONAL",
    status: "PASS",
    severity: "INFO",
    message: policy.rules.human_approval_required
      ? "Policy enforces mandatory human e-signature authorization before execution"
      : "Automated execution permitted under strict policy thresholds",
  };
  checks.push(humanReqCheck);

  const allowed = violations.length === 0;
  const overall_status = !allowed ? "FAIL" : warnings.length > 0 ? "WARNING" : "PASS";

  return {
    allowed,
    policy_id: policy.id,
    policy_version: policy.version,
    evaluated_at: new Date().toISOString(),
    checks,
    violations,
    warnings,
    overall_status,
  };
}
