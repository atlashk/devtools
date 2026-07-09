// Launch `next dev` on the preferred port (9090). If that port is already in
// use, fall back to a random free port chosen by the OS.
import net from "node:net";
import { spawn } from "node:child_process";

const PREFERRED_PORT = 9090;

/** Resolve to `port` if it is free, otherwise resolve to a random free port. */
function resolvePort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        // Preferred port taken -> ask the OS for any free port (port 0).
        const fallback = net.createServer();
        fallback.once("error", () => resolve(0)); // let next pick as last resort
        fallback.listen(0, () => {
          const { port: freePort } = fallback.address();
          fallback.close(() => resolve(freePort));
        });
      } else {
        resolve(port);
      }
    });

    server.once("listening", () => {
      server.close(() => resolve(port));
    });

    server.listen(port);
  });
}

const port = await resolvePort(PREFERRED_PORT);

if (port !== PREFERRED_PORT) {
  console.log(
    `⚠  Port ${PREFERRED_PORT} is in use, starting dev server on port ${port} instead.`,
  );
}

const child = spawn(
  "next",
  ["dev", "--turbopack", "--port", String(port)],
  { stdio: "inherit", shell: true },
);

child.on("exit", (code) => process.exit(code ?? 0));
