const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1200,
    maximizable: false,
    resizable: false,
    minHeight: 800,
    icon: path.join(__dirname, 'build', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    backgroundColor: '#ffffff',
    show: false
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Remove menu bar for cleaner look
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle API call from renderer
ipcMain.handle('enhance-prompt', async (event, { apiKey, prompt, language, provider, model, ollamaUrl }) => {
  try {
    const outputLanguage = language || 'English';
    const selectedProvider = provider || 'openrouter';
    const selectedModel = model || 'z-ai/glm-4.5-air:free';

    let url, headers, body;

    if (selectedProvider === 'ollama') {
      // Ollama API
      url = `${ollamaUrl || 'http://localhost:11434'}/api/chat`;
      headers = {
        'Content-Type': 'application/json'
      };
      body = {
        model: selectedModel,
        messages: [
          {
            role: 'system',
            content: `You are an expert prompt engineer specializing in optimizing prompts for AI coding assistants like Cursor, Windsurf, Antigravity, and similar tools.

Your task is to transform user prompts into highly effective, structured prompts that AI coding assistants can understand and execute perfectly.

RULES:
1. Output MUST be in ${outputLanguage} regardless of input language
2. Convert all tasks into a numbered TODO list format
3. Be specific and actionable
4. Include technical details and requirements
5. Structure the prompt clearly with sections if needed
6. Keep it concise but comprehensive
7. Add context that helps AI understand the goal better

OUTPUT FORMAT:
- Start with a clear objective statement
- List all tasks as numbered items (1 - ..., 2 - ..., etc.)
- Include any important constraints or requirements
- End with expected outcome if applicable

Transform the user's prompt into an optimized version following these guidelines. Remember: The output MUST be written in ${outputLanguage}.`
          },
          {
            role: 'user',
            content: `Transform this prompt into an optimized version for AI coding assistants:\n\n${prompt}`
          }
        ],
        stream: false
      };
    } else {
      // OpenRouter API
      url = 'https://openrouter.ai/api/v1/chat/completions';
      headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'AI Prompt Enhancer',
        'X-Title': 'AI Prompt Enhancer'
      };
      body = {
        model: selectedModel,
        messages: [
          {
            role: 'system',
            content: `You are an expert prompt engineer specializing in optimizing prompts for AI coding assistants like Cursor, Windsurf, Antigravity, and similar tools.

Your task is to transform user prompts into highly effective, structured prompts that AI coding assistants can understand and execute perfectly.

RULES:
1. Output MUST be in ${outputLanguage} regardless of input language
2. Convert all tasks into a numbered TODO list format
3. Be specific and actionable
4. Include technical details and requirements
5. Structure the prompt clearly with sections if needed
6. Keep it concise but comprehensive
7. Add context that helps AI understand the goal better

OUTPUT FORMAT:
- Start with a clear objective statement
- List all tasks as numbered items (1 - ..., 2 - ..., etc.)
- Include any important constraints or requirements
- End with expected outcome if applicable

Transform the user's prompt into an optimized version following these guidelines. Remember: The output MUST be written in ${outputLanguage}.`
          },
          {
            role: 'user',
            content: `Transform this prompt into an optimized version for AI coding assistants:\n\n${prompt}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || errorData.error || `API Error: ${response.status}`);
    }

    const data = await response.json();
    
    // Ollama response format is different
    let enhancedPrompt;
    if (selectedProvider === 'ollama') {
      enhancedPrompt = data.message?.content || 'No response generated';
    } else {
      enhancedPrompt = data.choices[0]?.message?.content || 'No response generated';
    }

    return {
      success: true,
      enhancedPrompt
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

// Get models from provider
ipcMain.handle('get-models', async (event, { provider, apiKey, ollamaUrl }) => {
  try {
    const selectedProvider = provider || 'openrouter';

    if (selectedProvider === 'ollama') {
      // Ollama API - get models from /api/tags
      const url = `${ollamaUrl || 'http://localhost:11434'}/api/tags`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Ollama API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform Ollama format to standard format
      const models = data.models?.map(m => ({
        id: m.name,
        name: m.name,
        size: m.size,
        modified_at: m.modified_at
      })) || [];

      return {
        success: true,
        models
      };
    } else {
      // OpenRouter API - get models from /api/v1/models
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Filter only free models (models with ":free" in their ID)
      const freeModels = data.data?.filter(m => m.id.includes(':free')) || [];
      
      const models = freeModels.map(m => ({
        id: m.id,
        name: m.name,
        context_length: m.context_length,
        pricing: m.pricing
      })) || [];

      return {
        success: true,
        models
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

// Test Ollama connection
ipcMain.handle('test-connection', async (event, { ollamaUrl }) => {
  try {
    const url = `${ollamaUrl || 'http://localhost:11434'}/api/tags`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Connection failed: ${response.status}`);
    }

    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});
