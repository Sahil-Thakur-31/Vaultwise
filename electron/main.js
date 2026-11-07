const { app, BrowserWindow, shell, ipcMain, Menu, session, clipboard } = require("electron");
const path = require("path");

// Enforce single instance lock to prevent duplicate unmonitored processes
const singleInstanceLock = app.requestSingleInstanceLock();
if (!singleInstanceLock) {
  app.quit();
  process.exit(0);
}

let mainWindow = null;

function loadWithRetry(win, targetUrl, attemptsRemaining = 20) {
  win.loadURL(targetUrl).catch((err) => {
    if (attemptsRemaining > 0 && !win.isDestroyed()) {
      setTimeout(() => {
        if (!win.isDestroyed()) {
          loadWithRetry(win, targetUrl, attemptsRemaining - 1);
        }
      }, 500);
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1260,
    height: 840,
    minWidth: 980,
    minHeight: 640,
    title: "Vaultwise - Zero-Knowledge Secure Enclave",
    backgroundColor: "#090d16",
    autoHideMenuBar: true,
    show: false,
    frame: true, // Native secure OS window frame
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      devTools: false, // Disallow Chromium developer tools completely
      spellcheck: false,
      autoplayPolicy: "user-gesture-required",
    },
  });

  // Windows & macOS Security: Prevent screen recording, window capture, and snooping malware
  if (typeof mainWindow.setContentProtection === "function") {
    try {
      mainWindow.setContentProtection(true);
    } catch {
      // Gracefully continue if OS display driver restricts WDA
    }
  }

  // Remove default application menu bar completely
  Menu.setApplicationMenu(null);

  // Security: Immediately terminate DevTools if opened via any backdoor or shortcut
  mainWindow.webContents.on("devtools-opened", () => {
    mainWindow.webContents.closeDevTools();
  });

  // Security: Intercept keyboard accelerators for developer tools inside the webContents
  mainWindow.webContents.on("before-input-event", (event, input) => {
    const isDevTools =
      input.key === "F12" ||
      ((input.control || input.meta) &&
        input.shift &&
        (input.key.toLowerCase() === "i" ||
          input.key.toLowerCase() === "j" ||
          input.key.toLowerCase() === "c")) ||
      ((input.control || input.meta) && input.key.toLowerCase() === "u") ||
      ((input.control || input.meta) && input.key.toLowerCase() === "s");

    if (isDevTools) {
      event.preventDefault();
    }
  });

  // Security: Restrict in-window navigations to localhost only
  mainWindow.webContents.on("will-navigate", (event, navigationUrl) => {
    const parsed = new URL(navigationUrl);
    if (parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });

  // Security: Block all popup windows and auxiliary webContents; open external links in default OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:") || url.startsWith("http:")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  // Target local Next.js dev server or local build
  const startUrl = process.env.ELECTRON_START_URL || "http://localhost:3000";
  loadWithRetry(mainWindow, startUrl);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Window control IPC handlers
ipcMain.on("window:minimize", () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on("window:maximize", () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on("window:close", () => {
  if (mainWindow) mainWindow.close();
});

let clipboardClearTimer = null;

ipcMain.on("clipboard:write", (event, text) => {
  if (typeof text === "string") {
    clipboard.writeText(text);
  }
});

ipcMain.on("clipboard:clear", () => {
  if (clipboardClearTimer) {
    clearTimeout(clipboardClearTimer);
    clipboardClearTimer = null;
  }
  clipboard.clear();
});

ipcMain.on("clipboard:schedule-clear", (event, delayMs = 30000) => {
  if (clipboardClearTimer) {
    clearTimeout(clipboardClearTimer);
    clipboardClearTimer = null;
  }
  if (delayMs > 0) {
    clipboardClearTimer = setTimeout(() => {
      try {
        clipboard.clear();
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send("clipboard:cleared");
        }
      } catch {
        // Ignore background clear failure
      }
    }, delayMs);
  }
});

ipcMain.on("clipboard:cancel-clear", () => {
  if (clipboardClearTimer) {
    clearTimeout(clipboardClearTimer);
    clipboardClearTimer = null;
  }
});

ipcMain.on("vault:lock", () => {
  if (mainWindow) {
    mainWindow.webContents.send("vault:trigger-lock");
  }
});

// Second instance focus
app.on("second-instance", () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.whenReady().then(() => {
  // Session Security: Allow clipboard access while denying untrusted hardware sensors
  if (session && session.defaultSession) {
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
      if (permission === "clipboard-read" || permission === "clipboard-sanitized-write") {
        return callback(true);
      }
      callback(false);
    });

    session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
      if (permission === "clipboard-read" || permission === "clipboard-sanitized-write") {
        return true;
      }
      return false;
    });

    // Strip sensitive cache on startup
    session.defaultSession.clearCache().catch(() => {});
  }

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  // Clear in-memory session cache before exit
  if (session && session.defaultSession) {
    session.defaultSession.clearCache().catch(() => {});
  }
});
