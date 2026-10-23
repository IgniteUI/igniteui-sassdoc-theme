import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import handler from "serve-handler";
import { log } from "./logger.js";

const BASE = "/products/ignite-ui-angular/docs/sass/latest";
const PORT = Number(process.env.PORT) || 8080;
const root = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "site");

const server = http.createServer((req, res) => {
  const url = req.url ?? "/";

  if (!url.startsWith(`${BASE}/`)) {
    res.writeHead(302, { Location: `${BASE}/` });
    res.end();
    return;
  }

  req.url = url.slice(BASE.length);
  return handler(req, res, { public: root });
});

server.listen(PORT, () => {
  log("serve", `http://localhost:${PORT}${BASE}/`);
});
