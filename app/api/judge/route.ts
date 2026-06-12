import { NextRequest, NextResponse } from "next/server";
import { judgeAndClassify } from "@/lib/agnes";

export async function POST(req: NextRequest) {
  const { summary, judgment } = await req.json();
  if (!summary || !judgment) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const result = await judgeAndClassify(summary, judgment);
  return NextResponse.json(result);
}
