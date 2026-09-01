import { NextResponse } from "next/server";
import { store } from "@/lib/db/store";

export async function POST() {
  try {
    const initialRun = store.initDefaultState();
    return NextResponse.json({
      success: true,
      message: "SovereignGuard store reset to initial seed state.",
      run: initialRun,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
