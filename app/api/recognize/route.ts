import { NextRequest } from "next/server";
import { recognizeScreenshot } from "@/lib/agnes";

export async function POST(req: NextRequest) {
  const { imageBase64 } = await req.json();
  if (!imageBase64) {
    return new Response("Missing imageBase64", { status: 400 });
  }

  const stream = await recognizeScreenshot(imageBase64);
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream" },
  });
}
