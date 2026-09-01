import { NextResponse } from "next/server";
import { store } from "@/lib/db/store";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const run = store.getRun(params.id);
    if (!run) {
      return NextResponse.json({ success: false, error: `Run ${params.id} not found` }, { status: 404 });
    }
    return NextResponse.json({ success: true, run });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = store.updateRun(params.id, body);
    return NextResponse.json({ success: true, run: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
