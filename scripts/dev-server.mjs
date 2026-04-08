import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const docsDir = path.join(rootDir, "docs");
const port = Number(process.env.PORT || 4190);
const payloads = [];

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

const readRequestBody = async (request) => {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8");
};

const sendJson = (response, statusCode, payload) => {
  const body = JSON.stringify(payload, null, 2);
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  response.end(body);
};

const sendFile = async (response, pathname) => {
  const normalizedPath =
    pathname === "/" ? path.join(docsDir, "index.html") : path.join(docsDir, pathname);

  try {
    const fileStat = await fs.stat(normalizedPath);
    const finalPath = fileStat.isDirectory() ? path.join(normalizedPath, "index.html") : normalizedPath;
    const fileBuffer = await fs.readFile(finalPath);
    const extension = path.extname(finalPath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[extension] || "application/octet-stream",
      "Content-Length": fileBuffer.length
    });
    response.end(fileBuffer);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
};

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

  if (url.pathname === "/api/frontend-errors" && request.method === "POST") {
    const body = await readRequestBody(request);

    try {
      const payload = JSON.parse(body);
      payloads.push({
        receivedAt: new Date().toISOString(),
        payload
      });
      if (payloads.length > 25) {
        payloads.splice(0, payloads.length - 25);
      }
      sendJson(response, 202, { ok: true });
      return;
    } catch {
      sendJson(response, 400, { ok: false, error: "Invalid JSON payload." });
      return;
    }
  }

  if (url.pathname === "/api/frontend-errors/logs" && request.method === "GET") {
    sendJson(response, 200, {
      count: payloads.length,
      items: payloads
    });
    return;
  }

  if (url.pathname === "/api/frontend-errors/logs" && request.method === "DELETE") {
    payloads.splice(0, payloads.length);
    sendJson(response, 200, { ok: true });
    return;
  }

  await sendFile(response, url.pathname);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Stackline client-errors docs server running at http://localhost:${port}/`);
});
