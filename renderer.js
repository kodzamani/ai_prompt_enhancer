// DOM Elements - Main
const appWrapper = document.getElementById('appWrapper');
const inputPrompt = document.getElementById('inputPrompt');
const enhanceBtn = document.getElementById('enhanceBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const errorMessage = document.getElementById('errorMessage');

// DOM Elements - Sidebar (History)
const historyBtn = document.getElementById('historyBtn');
const historySidebar = document.getElementById('historySidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const closeSidebar = document.getElementById('closeSidebar');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// DOM Elements - History Detail Modal
const historyDetailModal = document.getElementById('historyDetailModal');
const closeHistoryDetail = document.getElementById('closeHistoryDetail');
const historyInputContent = document.getElementById('historyInputContent');
const historyOutputContent = document.getElementById('historyOutputContent');
const copyInputBtn = document.getElementById('copyInputBtn');
const copyOutputBtn = document.getElementById('copyOutputBtn');

// DOM Elements - Settings Modal
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const apiKeyInput = document.getElementById('apiKey');
const toggleVisibilityBtn = document.getElementById('toggleVisibility');
const outputLanguage = document.getElementById('outputLanguage');
const saveSettingsBtn = document.getElementById('saveSettings');
const saveStatus = document.getElementById('saveStatus');
const providerRadios = document.querySelectorAll('input[name="provider"]');
const openrouterSettings = document.getElementById('openrouterSettings');
const ollamaSettings = document.getElementById('ollamaSettings');
const ollamaUrlInput = document.getElementById('ollamaUrl');
const modelSelect = document.getElementById('modelSelect');
const loadModelsBtn = document.getElementById('loadModelsBtn');
const modelHint = document.getElementById('modelHint');

// DOM Elements - Output Modal
const outputModal = document.getElementById('outputModal');
const closeOutput = document.getElementById('closeOutput');
const outputContent = document.getElementById('outputContent');
const copyBtn = document.getElementById('copyBtn');
const copyFeedback = document.getElementById('copyFeedback');

// Eye icons for toggle visibility
const eyeIcon = toggleVisibilityBtn.querySelector('.eye-icon');
const eyeOffIcon = toggleVisibilityBtn.querySelector('.eye-off-icon');

// Settings state
let currentApiKey = '';
let currentLanguage = 'English';
let currentProvider = 'openrouter';
let currentOllamaUrl = 'http://localhost:11434';
let currentModel = '';
let availableModels = [];

// History state
let promptHistory = [];

// ==================== History Sidebar ====================

function openSidebar() {
  historySidebar.classList.add('open');
  sidebarOverlay.classList.add('visible');
  renderHistory();
}

function closeSidebarPanel() {
  historySidebar.classList.remove('open');
  sidebarOverlay.classList.remove('visible');
}

historyBtn.addEventListener('click', openSidebar);
closeSidebar.addEventListener('click', closeSidebarPanel);
sidebarOverlay.addEventListener('click', closeSidebarPanel);

// Load history from localStorage
function loadHistory() {
  try {
    const saved = localStorage.getItem('prompt_history');
    if (saved) {
      promptHistory = JSON.parse(saved);
    }
  } catch (e) {
    promptHistory = [];
  }
}

// Save history to localStorage
function saveHistory() {
  try {
    localStorage.setItem('prompt_history', JSON.stringify(promptHistory));
  } catch (e) {
    // Storage full or unavailable
  }
}

// Add new history item
function addToHistory(input, output) {
  const item = {
    id: Date.now(),
    input: input,
    output: output,
    date: new Date().toISOString()
  };
  promptHistory.unshift(item);
  // Keep only last 50 items
  if (promptHistory.length > 50) {
    promptHistory = promptHistory.slice(0, 50);
  }
  saveHistory();
}

// Delete history item
function deleteHistoryItem(id) {
  promptHistory = promptHistory.filter(item => item.id !== id);
  saveHistory();
  renderHistory();
}

// Clear all history
function clearAllHistory() {
  if (confirm('Are you sure you want to clear all history?')) {
    promptHistory = [];
    saveHistory();
    renderHistory();
  }
}

clearHistoryBtn.addEventListener('click', clearAllHistory);

// Render history list
function renderHistory() {
  if (promptHistory.length === 0) {
    historyList.innerHTML = `
      <div class="history-empty">
        <img src="icons/empty_box_line.svg" class="history-empty-icon" width="48" height="48" alt="">
        <p>No history yet</p>
        <p style="font-size: 12px; margin-top: 8px;">Your enhanced prompts will appear here</p>
      </div>
    `;
    return;
  }

  historyList.innerHTML = promptHistory.map(item => {
    const date = new Date(item.date);
    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return `
      <div class="history-item" data-id="${item.id}">
        <div class="history-item-header">
          <span class="history-item-date">${formattedDate}</span>
          <button class="history-item-delete" data-id="${item.id}" title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
        <div class="history-item-input">${escapeHtml(item.input)}</div>
        <div class="history-item-output">${escapeHtml(item.output)}</div>
      </div>
    `;
  }).join('');

  // Add click handlers
  historyList.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', (e) => {
      if (!e.target.closest('.history-item-delete')) {
        const id = parseInt(el.dataset.id);
        openHistoryDetail(id);
      }
    });
  });

  historyList.querySelectorAll('.history-item-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      deleteHistoryItem(id);
    });
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ==================== History Detail Modal ====================

function openHistoryDetail(id) {
  const item = promptHistory.find(h => h.id === id);
  if (!item) return;

  historyInputContent.textContent = item.input;
  historyOutputContent.textContent = item.output;
  historyDetailModal.classList.add('visible');
  closeSidebarPanel();
}

function closeHistoryDetailModal() {
  historyDetailModal.classList.remove('visible');
}

closeHistoryDetail.addEventListener('click', closeHistoryDetailModal);

historyDetailModal.addEventListener('click', (e) => {
  if (e.target === historyDetailModal) {
    closeHistoryDetailModal();
  }
});

// Copy buttons in history detail
copyInputBtn.addEventListener('click', () => {
  copyToClipboard(historyInputContent.textContent);
});

copyOutputBtn.addEventListener('click', () => {
  copyToClipboard(historyOutputContent.textContent);
});

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

// ==================== Loading Overlay ====================

function showLoading() {
  appWrapper.classList.add('blurred');
  loadingOverlay.classList.add('visible');
}

function hideLoading() {
  appWrapper.classList.remove('blurred');
  loadingOverlay.classList.remove('visible');
}

// ==================== Provider & Model Management ====================

function handleProviderChange() {
  const selectedProvider = document.querySelector('input[name="provider"]:checked').value;
  currentProvider = selectedProvider;
  
  // Update UI visibility
  if (selectedProvider === 'openrouter') {
    openrouterSettings.style.display = 'block';
    ollamaSettings.style.display = 'none';
    modelHint.textContent = 'Enter your API key and load available models';
  } else {
    openrouterSettings.style.display = 'none';
    ollamaSettings.style.display = 'block';
    modelHint.textContent = 'Enter your Ollama URL and load available models';
  }
  
  // Clear model selection when provider changes
  currentModel = '';
  availableModels = [];
  modelSelect.innerHTML = '<option value="">Select a model...</option>';
  modelSelect.disabled = true;
}

async function loadModels() {
  const apiKey = currentProvider === 'openrouter' ? apiKeyInput.value.trim() : null;
  const ollamaUrl = ollamaUrlInput.value.trim() || 'http://localhost:11434';
  
  // Validation
  if (currentProvider === 'openrouter' && !apiKey) {
    showSettingsError('Please enter your OpenRouter API key first.');
    return;
  }
  
  if (currentProvider === 'ollama' && !ollamaUrl) {
    showSettingsError('Please enter your Ollama server URL.');
    return;
  }
  
  // Show loading state
  loadModelsBtn.disabled = true;
  loadModelsBtn.innerHTML = `
    <svg class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
    </svg>
    Loading...
  `;
  
  try {
    const result = await window.__TAURI__.core.invoke('get_models', {
      provider: currentProvider,
      apiKey,
      ollamaUrl
    });
    
    if (result.success) {
      availableModels = result.models;
      populateModels(availableModels);
      modelHint.textContent = `Loaded ${availableModels.length} models. Select one to continue.`;
    } else {
      showSettingsError(result.error || 'Failed to load models.');
    }
  } catch (error) {
    showSettingsError('Failed to connect to the API. Please check your settings.');
  } finally {
    loadModelsBtn.disabled = false;
    loadModelsBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
        <path d="M3 3v5h5"></path>
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
        <path d="M16 21h5v-5"></path>
      </svg>
      Load Models
    `;
  }
}

function populateModels(models) {
  modelSelect.innerHTML = '<option value="">Select a model...</option>';
  
  models.forEach(model => {
    const option = document.createElement('option');
    option.value = model.id;
    option.textContent = model.name || model.id;
    modelSelect.appendChild(option);
  });
  
  modelSelect.disabled = false;
  
  // Select previously saved model if it exists in the list
  if (currentModel && models.find(m => m.id === currentModel)) {
    modelSelect.value = currentModel;
  }
}

// Event listeners for provider and model management
providerRadios.forEach(radio => {
  radio.addEventListener('change', handleProviderChange);
});

loadModelsBtn.addEventListener('click', loadModels);

modelSelect.addEventListener('change', () => {
  currentModel = modelSelect.value;
});

// ==================== Settings Modal ====================

function openSettings() {
  settingsModal.classList.add('visible');
  apiKeyInput.value = currentApiKey;
  outputLanguage.value = currentLanguage;
  ollamaUrlInput.value = currentOllamaUrl;
  apiKeyInput.type = 'password';
  eyeIcon.style.display = 'block';
  eyeOffIcon.style.display = 'none';
  saveStatus.classList.remove('visible');
  
  // Set provider radio
  document.querySelector(`input[name="provider"][value="${currentProvider}"]`).checked = true;
  
  // Update UI based on provider
  handleProviderChange();
  
  // Auto-load models when settings is opened
  if (currentProvider === 'openrouter' && currentApiKey) {
    loadModels();
  } else if (currentProvider === 'ollama' && currentOllamaUrl) {
    loadModels();
  } else {
    // Load models if they were previously loaded
    if (availableModels.length > 0) {
      populateModels(availableModels);
      modelHint.textContent = `Loaded ${availableModels.length} models. Select one to continue.`;
    } else if (currentModel) {
      // If we have a saved model but no loaded models, show hint
      modelHint.textContent = 'Click "Load Models" to refresh the model list.';
    }
  }
}

function closeSettingsModal() {
  settingsModal.classList.remove('visible');
}

settingsBtn.addEventListener('click', openSettings);
closeSettings.addEventListener('click', closeSettingsModal);

settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) {
    closeSettingsModal();
  }
});

// Toggle password visibility
toggleVisibilityBtn.addEventListener('click', () => {
  const isPassword = apiKeyInput.type === 'password';
  apiKeyInput.type = isPassword ? 'text' : 'password';
  eyeIcon.style.display = isPassword ? 'none' : 'block';
  eyeOffIcon.style.display = isPassword ? 'block' : 'none';
});

// Save settings
saveSettingsBtn.addEventListener('click', () => {
  const apiKey = apiKeyInput.value.trim();
  const language = outputLanguage.value;
  const provider = document.querySelector('input[name="provider"]:checked').value;
  const ollamaUrl = ollamaUrlInput.value.trim() || 'http://localhost:11434';
  const model = modelSelect.value;
  
  // Validation
  if (provider === 'openrouter' && apiKey && !apiKey.startsWith('sk-')) {
    showSettingsError('Invalid API key format. Key should start with "sk-"');
    return;
  }
  
  if (provider === 'openrouter' && !apiKey) {
    showSettingsError('Please enter your OpenRouter API key.');
    return;
  }
  
  if (!model) {
    showSettingsError('Please select a model.');
    return;
  }
  
  try {
    // Save provider
    localStorage.setItem('ai_provider', provider);
    currentProvider = provider;
    
    // Save API key (only for OpenRouter)
    if (provider === 'openrouter') {
      localStorage.setItem('openrouter_api_key', apiKey);
      currentApiKey = apiKey;
    } else {
      localStorage.removeItem('openrouter_api_key');
      currentApiKey = '';
    }
    
    // Save Ollama URL
    localStorage.setItem('ollama_url', ollamaUrl);
    currentOllamaUrl = ollamaUrl;
    
    // Save language
    localStorage.setItem('selectedLanguage', language);
    currentLanguage = language;
    
    // Save model
    localStorage.setItem('selected_model', model);
    currentModel = model;
    
    // Show success
    saveStatus.textContent = 'Settings saved successfully!';
    saveStatus.style.color = 'var(--success-color, #10b981)';
    saveStatus.classList.add('visible');
    
    updateEnhanceButton();
    setTimeout(() => {
      closeSettingsModal();
    }, 500);
    
  } catch (e) {
    showSettingsError('Failed to save settings. Please try again.');
  }
});

function showSettingsError(message) {
  saveStatus.textContent = message;
  saveStatus.style.color = 'var(--error-color, #ef4444)';
  saveStatus.classList.add('visible');
  setTimeout(() => {
    saveStatus.classList.remove('visible');
    saveStatus.style.color = '';
    saveStatus.textContent = '';
  }, 3000);
}

// ==================== Output Modal ====================

function openOutputModal(content) {
  outputContent.textContent = content;
  outputModal.classList.add('visible');
}

function closeOutputModal() {
  outputModal.classList.remove('visible');
}

closeOutput.addEventListener('click', closeOutputModal);

outputModal.addEventListener('click', (e) => {
  if (e.target === outputModal) {
    closeOutputModal();
  }
});

// ==================== Keyboard Shortcuts ====================

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (historyDetailModal.classList.contains('visible')) {
      closeHistoryDetailModal();
    } else if (outputModal.classList.contains('visible')) {
      closeOutputModal();
    } else if (settingsModal.classList.contains('visible')) {
      closeSettingsModal();
    } else if (historySidebar.classList.contains('open')) {
      closeSidebarPanel();
    }
  }
});

// ==================== Load Saved Settings ====================

function loadSettings() {
  try {
    const savedKey = localStorage.getItem('openrouter_api_key');
    const savedLanguage = localStorage.getItem('selectedLanguage');
    const savedProvider = localStorage.getItem('ai_provider');
    const savedOllamaUrl = localStorage.getItem('ollama_url');
    const savedModel = localStorage.getItem('selected_model');
    
    if (savedKey) {
      currentApiKey = savedKey;
    }
    
    if (savedLanguage) {
      currentLanguage = savedLanguage;
    }
    
    if (savedProvider) {
      currentProvider = savedProvider;
    }
    
    if (savedOllamaUrl) {
      currentOllamaUrl = savedOllamaUrl;
    }
    
    if (savedModel) {
      currentModel = savedModel;
    }
    
    updateEnhanceButton();
  } catch (e) {
    // localStorage unavailable
  }
}

// ==================== Main Functionality ====================

function updateEnhanceButton() {
  const hasPrompt = inputPrompt.value.trim().length > 0;
  const hasModel = currentModel.length > 0;
  const hasApiKey = currentProvider === 'openrouter' ? currentApiKey.length > 0 : true;
  
  enhanceBtn.disabled = !hasApiKey || !hasPrompt || !hasModel;
}

inputPrompt.addEventListener('input', updateEnhanceButton);

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add('visible');
}

function hideError() {
  errorMessage.classList.remove('visible');
}

// Enhance prompt
async function enhancePrompt() {
  if (!currentModel) {
    showError('Please select a model in Settings first.');
    openSettings();
    return;
  }
  
  if (currentProvider === 'openrouter' && !currentApiKey) {
    showError('Please set your API key in Settings first.');
    openSettings();
    return;
  }
  
  const prompt = inputPrompt.value.trim();
  if (!prompt) return;

  hideError();
  showLoading();
  enhanceBtn.disabled = true;

  try {
    const result = await window.__TAURI__.core.invoke('enhance_prompt', {
      apiKey: currentApiKey,
      prompt,
      language: currentLanguage,
      provider: currentProvider,
      model: currentModel,
      ollamaUrl: currentOllamaUrl
    });

    hideLoading();
    
    if (result.success) {
      // Save to history
      addToHistory(prompt, result.enhancedPrompt);
      openOutputModal(result.enhancedPrompt);
    } else {
      showError(result.error || 'An error occurred while enhancing the prompt.');
    }
  } catch (error) {
    hideLoading();
    showError('Failed to connect to the API. Please check your settings.');
  } finally {
    updateEnhanceButton();
  }
}

enhanceBtn.addEventListener('click', enhancePrompt);

// Copy to clipboard
copyBtn.addEventListener('click', async () => {
  const text = outputContent.textContent;
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    copyFeedback.classList.add('show');
    setTimeout(() => {
      copyFeedback.classList.remove('show');
    }, 2000);
  } catch (err) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    copyFeedback.classList.add('show');
    setTimeout(() => {
      copyFeedback.classList.remove('show');
    }, 2000);
  }
});

// Ctrl+Enter to enhance
inputPrompt.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter' && !enhanceBtn.disabled) {
    enhancePrompt();
  }
});

// ==================== Initialize ====================
loadSettings();
loadHistory();

if (!currentModel || (currentProvider === 'openrouter' && !currentApiKey)) {
  setTimeout(openSettings, 500);
}
