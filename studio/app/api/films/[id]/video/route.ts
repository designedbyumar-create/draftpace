import { videoPath } from "~/lib/server/engine";
import { serveFile } from "~/lib/server/serve";

/** A rendered, mastered film (creative/out/films/<id>.mp4). ?download=1 saves it with its name. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const file = videoPath(id);
  if (!file) return new Response("Not rendered yet", { status: 404 });
  const res = serveFile(file, request);
  if (new URL(request.url).searchParams.get("download")) res.headers.set("Content-Disposition", `attachment; filename="${id}.mp4"`);
  return res;
}
