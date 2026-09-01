import { NextResponse } from "next/server";
import { getSponsorStatuses } from "@/lib/adapters";
import { store } from "@/lib/db/store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const runId = searchParams.get("runId");

    const activeRun = runId ? store.getRun(runId) : store.getAllRuns()[0];
    const sponsors = getSponsorStatuses(activeRun);

    return NextResponse.json({
      success: true,
      sponsors,
      runId: activeRun?.id,
      sponsor_modes: activeRun?.sponsor_modes,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
