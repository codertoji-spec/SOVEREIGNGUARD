import { NextResponse } from "next/server";
import { store } from "@/lib/db/store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { runId } = body;

    if (!runId) {
      return NextResponse.json({ success: false, error: "runId is required" }, { status: 400 });
    }

    const evaluation = store.evaluateRunPolicy(runId);
    const run = store.getRun(runId);

    return NextResponse.json({
      success: true,
      run,
      evaluation,
      allowed: evaluation.allowed,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
