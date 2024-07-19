const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadCSV: (filePath) => ipcRenderer.invoke('load-csv', filePath),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  loadConfig: () => ipcRenderer.invoke('load-config'),
  startSweep: (data) => ipcRenderer.invoke('start-sweep', data),
  logMessage: (message) => ipcRenderer.invoke('log-message', message)
});
