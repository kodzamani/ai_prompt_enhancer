const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  enhancePrompt: (apiKey, prompt, language) => ipcRenderer.invoke('enhance-prompt', { apiKey, prompt, language })
});
