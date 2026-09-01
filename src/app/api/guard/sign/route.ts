import { NextResponse } from "next/server";
import { store } from "@/lib/db/store";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { runId, signatureToken } = body;

    if (!runId) {
      return NextResponse.json(
        {
          success: false,
          error: "runId is required",
          code: "MISSING_RUN_ID",
        },
        { status: 400 }
      );
    }

    // Server-side strict invariant gate execution
    const updatedRun = await store.executeSigning(runId, signatureToken);

    return NextResponse.json({
      success: true,
      run: updatedRun,
      envelope: updatedRun.foxit_envelope,
      status: "SIGNED_AND_SEALED",
    });
  } catch (error: any) {
    const errorMessage = error.message || "Unknown error";
    const code = errorMessage.split(":")[0]?.trim() || "SIGNING_BLOCKED";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        code,
        securityViolation: true,
        guardMessage: "SOVEREIGNGUARD FIREWALL BLOCKED THIS ACTION: Invariant verification failed.",
      },
      { status: 403 }
    );
  }
}
