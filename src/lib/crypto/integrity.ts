import crypto from "crypto";
import { ApprovalTokenPayload, AuditEvent } from "@/types/guard";

// Server-side secret for signing approval tokens (never exposed to browser)
const SERVER_SIGNING_SECRET =
  process.env.SOVEREIGNGUARD_SIGNING_SECRET ||
  "sg_production_signing_key_4f891a2e9b0c7d31f5a8e2b9c0d1e4f6";

/**
 * Computes a SHA-256 hash of a string or Buffer
 */
export function computeSha256(data: string | Buffer): string {
  return crypto.createHash("sha256").update(data).digest("hex").toUpperCase();
}

/**
 * Computes HMAC-SHA256 for message authentication
 */
export function computeHmacSha256(message: string, secret: string = SERVER_SIGNING_SECRET): string {
  return crypto.createHmac("sha256", secret).update(message).digest("hex").toUpperCase();
}

/**
 * Creates a deterministic, canonical JSON string from any object by recursively sorting keys.
 */
export function canonicalJsonStringify(obj: any): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return "[" + obj.map(canonicalJsonStringify).join(",") + "]";
  }

  const keys = Object.keys(obj).sort();
  const pairs = keys.map((key) => {
    return `${JSON.stringify(key)}:${canonicalJsonStringify(obj[key])}`;
  });

  return "{" + pairs.join(",") + "}";
}

/**
 * Computes a deterministic SHA-256 hash for structured contract facts
 */
export function computeFactsHash(facts: Record<string, any>): string {
  const canonical = canonicalJsonStringify(facts);
  return computeSha256(canonical);
}

/**
 * Verifies document integrity against an approved expected hash
 */
export function verifyDocumentIntegrity(
  currentDocumentContent: string,
  approvedHash: string
): { is_valid: boolean; current_hash: string; approved_hash: string } {
  const current_hash = computeSha256(currentDocumentContent);
  return {
    is_valid: current_hash === approvedHash,
    current_hash,
    approved_hash: approvedHash,
  };
}

/**
 * Generates an immutable state hash for audit events using tamper-evident chaining
 */
export function computeAuditEventHash(previousStateHash: string, eventPayload: any): string {
  const data = `${previousStateHash}:${canonicalJsonStringify(eventPayload)}`;
  return computeSha256(data);
}

/**
 * Verifies the integrity of a complete audit event chain
 */
export function verifyAuditChain(events: AuditEvent[]): {
  is_valid: boolean;
  broken_index?: number;
  reason?: string;
} {
  if (!events || events.length === 0) return { is_valid: true };

  // Traverse chronological order (events stored newest-first, so reverse for chain validation)
  const chronological = [...events].reverse();

  let prevHash = "GENESIS-00000000000000000000000000000000";

  for (let i = 0; i < chronological.length; i++) {
    const event = chronological[i];

    if (event.previous_hash !== prevHash) {
      return {
        is_valid: false,
        broken_index: i,
        reason: `Previous hash mismatch at event ${event.id}: expected ${prevHash}, got ${event.previous_hash}`,
      };
    }

    const payloadToHash = {
      run_id: event.run_id,
      event_type: event.event_type,
      actor: event.actor,
      severity: event.severity,
      title: event.title,
      description: event.description,
      metadata: event.metadata,
      timestamp: event.timestamp,
      id: event.id,
    };

    const calculatedHash = computeAuditEventHash(prevHash, payloadToHash);

    if (calculatedHash !== event.state_hash) {
      return {
        is_valid: false,
        broken_index: i,
        reason: `State hash mismatch at event ${event.id}: calculated ${calculatedHash}, recorded ${event.state_hash}`,
      };
    }

    prevHash = event.state_hash;
  }

  return { is_valid: true };
}

/**
 * Creates a cryptographically signed, verifiable Human Approval Token
 */
export function createSignedApprovalToken(
  payload: ApprovalTokenPayload,
  secret: string = SERVER_SIGNING_SECRET
): string {
  const canonicalPayload = canonicalJsonStringify(payload);
  const signature = computeHmacSha256(canonicalPayload, secret);
  const tokenData = {
    payload,
    sig: signature,
  };
  return Buffer.from(JSON.stringify(tokenData)).toString("base64url");
}

/**
 * Verifies a signed Human Approval Token independently server-side
 */
export function verifyApprovalToken(
  tokenString: string,
  secret: string = SERVER_SIGNING_SECRET
): {
  valid: boolean;
  error?: string;
  payload?: ApprovalTokenPayload;
} {
  try {
    const decodedStr = Buffer.from(tokenString, "base64url").toString("utf8");
    const parsed = JSON.parse(decodedStr);

    if (!parsed.payload || !parsed.sig) {
      return { valid: false, error: "MALFORMED_TOKEN_STRUCTURE" };
    }

    const { payload, sig } = parsed;

    // Check expiration
    const expiryTime = new Date(payload.expires_at).getTime();
    if (isNaN(expiryTime) || Date.now() > expiryTime) {
      return { valid: false, error: "APPROVAL_EXPIRED" };
    }

    // Verify HMAC signature
    const canonicalPayload = canonicalJsonStringify(payload);
    const expectedSig = computeHmacSha256(canonicalPayload, secret);

    if (sig !== expectedSig) {
      return { valid: false, error: "INVALID_APPROVAL_SIGNATURE" };
    }

    return { valid: true, payload };
  } catch (err: any) {
    return { valid: false, error: `TOKEN_PARSING_FAILED: ${err.message}` };
  }
}
