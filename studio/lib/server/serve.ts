import fs from "node:fs";
import path from "node:path";

const TYPES: Record<string, string> = {
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg", ".wav": "audio/wav", ".m4a": "audio/mp4", ".aac": "audio/aac", ".mp4": "video/mp4",
  ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".json": "application/json",
};

/** A file under `root`, or null if the path tries to leave it. */
export function safeJoin(root: string, parts: string[]): string | null {
  const p = path.resolve(root, ...parts);
  return p.startsWith(path.resolve(root) + path.sep) ? p : null;
}

/** Serve a file with byte-range support, so video and audio can seek. */
export function serveFile(file: string, request: Request): Response {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return new Response("Not found", { status: 404 });
  const size = fs.statSync(file).size;
  const type = TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream";
  const range = request.headers.get("range")?.match(/bytes=(\d*)-(\d*)/);
  const headers: Record<string, string> = { "Content-Type": type, "Accept-Ranges": "bytes", "Cache-Control": "no-cache" };
  if (range) {
    const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
    const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start >= size || start > end) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    const stream = fs.createReadStream(file, { start, end });
    return new Response(stream as unknown as ReadableStream, { status: 206, headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) } });
  }
  return new Response(fs.createReadStream(file) as unknown as ReadableStream, { headers: { ...headers, "Content-Length": String(size) } });
}
