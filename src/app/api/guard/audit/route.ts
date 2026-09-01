import { NextResponse } from "next/server";
import { store } from "@/lib/db/store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const runId = searchParams.get("runId") || undefined;
    const events = store.getAuditEvents(runId);
    return NextResponse.json({ success: true, count: events.length, events });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
