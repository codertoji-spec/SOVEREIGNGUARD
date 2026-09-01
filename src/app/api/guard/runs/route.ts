import { NextResponse } from "next/server";
import { store } from "@/lib/db/store";

export async function GET() {
  try {
    const runs = store.getAllRuns();
    return NextResponse.json({ success: true, runs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const run = store.createRun(body.intent);
    return NextResponse.json({ success: true, run });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
