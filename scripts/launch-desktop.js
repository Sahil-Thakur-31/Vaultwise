const http = require("http");
const { spawn } = require("child_process");
const path = require("path");

const TARGET_URL = "http://localhost:3000";
const CHECK_INTERVAL_MS = 300;
const MAX_ATTEMPTS = 60; // Up to 18 seconds wait for Next.js compilation

let attempts = 0;

function checkServerReady() {
  attempts++;
  const req = http.get(TARGET_URL, (res) => {
    res.resume();
    // Next.js responds (200, 304, 404, etc.)
    console.log(`[Vaultwise Desktop] Next.js dev server ready at ${TARGET_URL}. Launching standalone desktop window...`);
    launchElectron();
  });

  req.on("error", () => {
    if (attempts < MAX_ATTEMPTS) {
      setTimeout(checkServerReady, CHECK_INTERVAL_MS);
    } else {
      console.warn("[Vaultwise Desktop] Server wait timeout reached. Launching desktop window anyway...");
      launchElectron();
    }
  });

  req.setTimeout(250, () => {
    req.destroy();
  });
}

function launchElectron() {
  const electronBin = require("electron");
  const mainScript = path.resolve(__dirname, "..", "electron", "main.js");

  const cleanEnv = { ...process.env };
  delete cleanEnv.ELECTRON_RUN_AS_NODE; // Ensure Electron runs in standalone GUI window mode

  const child = spawn(electronBin, [mainScript], {
    stdio: "inherit",
    env: {
      ...cleanEnv,
      ELECTRON_START_URL: TARGET_URL,
    },
  });

  child.on("close", (code) => {
    process.exit(code || 0);
  });
}

console.log("[Vaultwise Desktop] Initializing secure desktop enclave...");
checkServerReady();
