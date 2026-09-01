import { NextResponse } from "next/server";
import { store } from "@/lib/db/store";

export async function GET() {
  try {
    const policy = store.getActivePolicy();
    const allPolicies = store.getAllPolicies();
    return NextResponse.json({ success: true, policy, allPolicies });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const updated = store.updateActivePolicy(body);
    return NextResponse.json({ success: true, policy: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
