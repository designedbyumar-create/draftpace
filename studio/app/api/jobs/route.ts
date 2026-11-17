import { NextResponse } from "next/server";
import { jobStatus } from "~/lib/server/jobs";
import { renderedFile } from "~/lib/server/engine";

export const dynamic = "force-dynamic";

/** Render progress, polled by the film page while a render runs. */
export async function GET(request: Request) {
  const film = new URL(request.url).searchParams.get("film") ?? undefined;
  return NextResponse.json({ ...jobStatus(film), rendered: film ? renderedFile(film) : null });
}
