const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("vaultDesktop", {
  isDesktop: true,
  platform: process.platform,
  version: "2.4.0",
  lockApp: () => ipcRenderer.send("vault:lock"),
  minimize: () => ipcRenderer.send("window:minimize"),
  maximize: () => ipcRenderer.send("window:maximize"),
  close: () => ipcRenderer.send("window:close"),
  writeClipboard: (text) => ipcRenderer.send("clipboard:write", text),
  clearClipboard: () => ipcRenderer.send("clipboard:clear"),
  scheduleClearClipboard: (delayMs) => ipcRenderer.send("clipboard:schedule-clear", delayMs),
  cancelClearClipboard: () => ipcRenderer.send("clipboard:cancel-clear"),
  onClipboardCleared: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("clipboard:cleared", handler);
    return () => ipcRenderer.removeListener("clipboard:cleared", handler);
  },
});
