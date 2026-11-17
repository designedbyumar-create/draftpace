import path from "node:path";
import { CREATIVE_DIR } from "@engine/director/write";
import { safeJoin, serveFile } from "~/lib/server/serve";

/** The engine's public/ (real screen captures, sound, fonts, voice-over recordings), which films load with staticFile(). */
export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  const file = safeJoin(path.join(CREATIVE_DIR, "public"), parts);
  return file ? serveFile(file, request) : new Response("Not found", { status: 404 });
}
