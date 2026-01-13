# AI Prompt Enhancer

A clean, minimal desktop application that transforms your prompts into optimized versions for AI coding assistants like Cursor, Antigravity, Windsurf, and similar tools.

![AI Prompt Enhancer](https://img.shields.io/badge/Electron-39.x-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Prompt Enhancement**: Converts any prompt into a structured, actionable format optimized for AI coding assistants
- **Multilingual Support**: Accept prompts in any language, output in 8 different languages
- **TODO Format**: Automatically structures tasks as numbered todo items
- **Prompt History**: View and manage your previous prompts with input/output details
- **API Key Storage**: Securely saves your OpenRouter API key locally
- **One-Click Copy**: Easily copy enhanced prompts to clipboard
- **Clean UI**: Minimal, shadow-free design suitable for commercial use

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [OpenRouter API Key](https://openrouter.ai/) (free tier available)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kodzamani/ai_prompt_enhancer.git
cd ai-prompt-enhancer
```

2. Install dependencies:
```bash
npm install
```

3. Run the application:
```bash
npm start
```

### Building Executables

Build for your platform:

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux

# All platforms
npm run dist
```

Output files will be in the `dist` folder.

### Getting an OpenRouter API Key

1. Go to [OpenRouter](https://openrouter.ai/)
2. Create a free account
3. Navigate to API Keys section
4. Generate a new API key
5. Copy and paste it into the application (Settings)

## Usage

1. Click the Settings icon and enter your OpenRouter API key
2. Type or paste your prompt in any language
3. Click "Enhance Prompt" or press `Ctrl+Enter`
4. Copy the enhanced prompt and use it in your favorite AI coding assistant
5. Access your prompt history via the menu icon on the left

## Example

**Input (Turkish):**
```
Bir blog sitesi yap, kullanıcı kayıt olabilsin, yazı yazabilsin, yorum yapabilsin
```

**Output (English):**
```
## Objective
Build a full-featured blog platform with user authentication and content management capabilities.

## Tasks
1 - Set up project structure with appropriate framework (Next.js/React recommended)
2 - Implement user authentication system (registration, login, logout)
3 - Create database schema for users, posts, and comments
4 - Build user registration page with form validation
5 - Develop blog post creation interface with rich text editor
6 - Implement comment system with nested replies support
7 - Add user profile pages showing their posts and comments
8 - Create responsive UI for all pages

## Requirements
- Secure password hashing
- Form validation on both client and server
- Clean, modern UI design
```

## Tech Stack

- **Electron** - Cross-platform desktop app framework
- **OpenRouter API** - AI model access (Devstral Free)
- **Vanilla JS** - No framework dependencies for the frontend

## Supported Output Languages

- English
- Türkçe
- 中文 (Chinese)
- Français
- 한국어 (Korean)
- 日本語 (Japanese)
- हिन्दी (Hindi)
- Shqip (Albanian)

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
