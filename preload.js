const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  enhancePrompt: (apiKey, prompt, language, provider, model, ollamaUrl) =>
    ipcRenderer.invoke('enhance-prompt', { apiKey, prompt, language, provider, model, ollamaUrl }),
  getModels: (provider, apiKey, ollamaUrl) =>
    ipcRenderer.invoke('get-models', { provider, apiKey, ollamaUrl }),
  testConnection: (ollamaUrl) =>
    ipcRenderer.invoke('test-connection', { ollamaUrl })
});
