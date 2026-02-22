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
ipcMain.handle('enhance-prompt', async (event, { apiKey, prompt, language }) => {
  try {
    const outputLanguage = language || 'English';
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'AI Prompt Enhancer',
        'X-Title': 'AI Prompt Enhancer'
      },
      body: JSON.stringify({
        model: 'z-ai/glm-4.5-air:free',
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
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      enhancedPrompt: data.choices[0]?.message?.content || 'No response generated'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});
