const http = require("http");
const { spawn } = require("child_process");
const path = require("path");

const CANDIDATE_PORTS = [3000, 3001, 3002, 3003];
const CHECK_INTERVAL_MS = 400;
const MAX_ATTEMPTS = 75; // Up to 30 seconds wait for Next.js compilation

let attempts = 0;
let isLaunching = false;

function probePort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, { timeout: 350 }, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
        // Check early if content matches Vaultwise or Next.js
        if (data.includes("Vaultwise") || data.includes("__NEXT_DATA__") || data.includes("next/font")) {
          res.destroy();
          return resolve({ port, ok: true });
        }
      });
      res.on("end", () => {
        if (res.statusCode === 200 && (data.includes("Vaultwise") || data.includes("__NEXT_DATA__") || data.includes("next/font"))) {
          resolve({ port, ok: true });
        } else {
          resolve({ port, ok: false });
        }
      });
    });

    req.on("error", () => resolve({ port, ok: false }));
    req.on("timeout", () => {
      req.destroy();
      resolve({ port, ok: false });
    });
  });
}

async function checkServerReady() {
  if (isLaunching) return;
  attempts++;

  for (const port of CANDIDATE_PORTS) {
    const result = await probePort(port);
    if (result.ok) {
      isLaunching = true;
      const targetUrl = `http://localhost:${port}`;
      console.log(`[Vaultwise Desktop] Verified Next.js dev server ready at ${targetUrl}. Launching standalone desktop window...`);
      launchElectron(targetUrl);
      return;
    }
  }

  if (attempts < MAX_ATTEMPTS) {
    setTimeout(checkServerReady, CHECK_INTERVAL_MS);
  } else {
    // Fallback to default port if detection timed out
    isLaunching = true;
    const defaultUrl = "http://localhost:3000";
    console.warn(`[Vaultwise Desktop] Timeout waiting for verification. Launching desktop window on ${defaultUrl}...`);
    launchElectron(defaultUrl);
  }
}

function launchElectron(targetUrl) {
  const electronBin = require("electron");
  const mainScript = path.resolve(__dirname, "..", "electron", "main.js");

  const cleanEnv = { ...process.env };
  delete cleanEnv.ELECTRON_RUN_AS_NODE; // Ensure Electron runs in standalone GUI window mode

  const child = spawn(electronBin, [mainScript], {
    stdio: "inherit",
    env: {
      ...cleanEnv,
      ELECTRON_START_URL: targetUrl,
    },
  });

  child.on("close", (code) => {
    process.exit(code || 0);
  });
}

console.log("[Vaultwise Desktop] Initializing secure desktop enclave...");
checkServerReady();
