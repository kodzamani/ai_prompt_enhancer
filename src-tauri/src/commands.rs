use serde::Serialize;
use serde_json::{json, Value};

// ─────────────────────────────────────────────
//  Response types
// ─────────────────────────────────────────────

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct EnhanceResult {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    enhanced_prompt: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct ModelsResult {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    models: Option<Vec<Value>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

#[derive(Serialize)]
struct SimpleResult {
    success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

// ─────────────────────────────────────────────
//  Tauri commands
// ─────────────────────────────────────────────

/// Enhance a prompt using OpenRouter or Ollama.
///
/// JS call:
/// ```js
/// window.__TAURI__.core.invoke('enhance_prompt', {
///   apiKey, prompt, language, provider, model, ollamaUrl
/// })
/// ```
#[tauri::command]
pub async fn enhance_prompt(
    api_key: String,
    prompt: String,
    language: String,
    provider: String,
    model: String,
    ollama_url: String,
) -> Value {
    let output_language = if language.is_empty() { "English".to_string() } else { language };
    let selected_provider = if provider.is_empty() { "openrouter".to_string() } else { provider };
    let selected_model = if model.is_empty() { "z-ai/glm-4.5-air:free".to_string() } else { model };

    let system_content = format!(
        r#"You are an expert prompt engineer specializing in optimizing prompts for AI coding assistants like Cursor, Windsurf, Antigravity, and similar tools.

Your task is to transform user prompts into highly effective, structured prompts that AI coding assistants can understand and execute perfectly.

RULES:
1. Output MUST be in {lang} regardless of input language
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

Transform the user's prompt into an optimized version following these guidelines. Remember: The output MUST be written in {lang}."#,
        lang = output_language
    );

    let user_content = format!(
        "Transform this prompt into an optimized version for AI coding assistants:\n\n{}",
        prompt
    );

    let client = match reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(60))
        .build()
    {
        Ok(c) => c,
        Err(e) => {
            return json!(EnhanceResult {
                success: false,
                enhanced_prompt: None,
                error: Some(e.to_string()),
            });
        }
    };

    if selected_provider == "ollama" {
        let base_url = if ollama_url.is_empty() {
            "http://localhost:11434".to_string()
        } else {
            ollama_url.trim_end_matches('/').to_string()
        };

        let body = json!({
            "model": selected_model,
            "messages": [
                { "role": "system", "content": system_content },
                { "role": "user", "content": user_content }
            ],
            "stream": false
        });

        match client
            .post(format!("{}/api/chat", base_url))
            .json(&body)
            .send()
            .await
        {
            Ok(resp) => {
                if !resp.status().is_success() {
                    let status = resp.status().as_u16();
                    return json!(EnhanceResult {
                        success: false,
                        enhanced_prompt: None,
                        error: Some(format!("Ollama API Error: {}", status)),
                    });
                }
                match resp.json::<Value>().await {
                    Ok(data) => {
                        let content = data["message"]["content"]
                            .as_str()
                            .unwrap_or("No response generated")
                            .to_string();
                        json!(EnhanceResult {
                            success: true,
                            enhanced_prompt: Some(content),
                            error: None,
                        })
                    }
                    Err(e) => json!(EnhanceResult {
                        success: false,
                        enhanced_prompt: None,
                        error: Some(e.to_string()),
                    }),
                }
            }
            Err(e) => json!(EnhanceResult {
                success: false,
                enhanced_prompt: None,
                error: Some(e.to_string()),
            }),
        }
    } else {
        // OpenRouter
        let body = json!({
            "model": selected_model,
            "messages": [
                { "role": "system", "content": system_content },
                { "role": "user", "content": user_content }
            ],
            "temperature": 0.7,
            "max_tokens": 2000
        });

        match client
            .post("https://openrouter.ai/api/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", api_key))
            .header("Content-Type", "application/json")
            .header("HTTP-Referer", "AI Prompt Enhancer")
            .header("X-Title", "AI Prompt Enhancer")
            .json(&body)
            .send()
            .await
        {
            Ok(resp) => {
                if !resp.status().is_success() {
                    let error_data: Value = resp.json().await.unwrap_or_default();
                    let msg = error_data["error"]["message"]
                        .as_str()
                        .or_else(|| error_data["error"].as_str())
                        .unwrap_or("API Error")
                        .to_string();
                    return json!(EnhanceResult {
                        success: false,
                        enhanced_prompt: None,
                        error: Some(msg),
                    });
                }
                match resp.json::<Value>().await {
                    Ok(data) => {
                        let content = data["choices"][0]["message"]["content"]
                            .as_str()
                            .unwrap_or("No response generated")
                            .to_string();
                        json!(EnhanceResult {
                            success: true,
                            enhanced_prompt: Some(content),
                            error: None,
                        })
                    }
                    Err(e) => json!(EnhanceResult {
                        success: false,
                        enhanced_prompt: None,
                        error: Some(e.to_string()),
                    }),
                }
            }
            Err(e) => json!(EnhanceResult {
                success: false,
                enhanced_prompt: None,
                error: Some(e.to_string()),
            }),
        }
    }
}

/// Fetch available models from OpenRouter or Ollama.
///
/// JS call:
/// ```js
/// window.__TAURI__.core.invoke('get_models', { provider, apiKey, ollamaUrl })
/// ```
#[tauri::command]
pub async fn get_models(provider: String, api_key: String, ollama_url: String) -> Value {
    let selected_provider = if provider.is_empty() {
        "openrouter".to_string()
    } else {
        provider
    };

    let client = match reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
    {
        Ok(c) => c,
        Err(e) => {
            return json!(ModelsResult {
                success: false,
                models: None,
                error: Some(e.to_string()),
            });
        }
    };

    if selected_provider == "ollama" {
        let base_url = if ollama_url.is_empty() {
            "http://localhost:11434".to_string()
        } else {
            ollama_url.trim_end_matches('/').to_string()
        };

        match client
            .get(format!("{}/api/tags", base_url))
            .send()
            .await
        {
            Ok(resp) => {
                if !resp.status().is_success() {
                    let status = resp.status().as_u16();
                    return json!(ModelsResult {
                        success: false,
                        models: None,
                        error: Some(format!("Ollama API Error: {}", status)),
                    });
                }
                match resp.json::<Value>().await {
                    Ok(data) => {
                        let models: Vec<Value> = data["models"]
                            .as_array()
                            .unwrap_or(&vec![])
                            .iter()
                            .map(|m| {
                                json!({
                                    "id": m["name"].as_str().unwrap_or(""),
                                    "name": m["name"].as_str().unwrap_or(""),
                                    "size": m["size"],
                                    "modified_at": m["modified_at"]
                                })
                            })
                            .collect();
                        json!(ModelsResult {
                            success: true,
                            models: Some(models),
                            error: None,
                        })
                    }
                    Err(e) => json!(ModelsResult {
                        success: false,
                        models: None,
                        error: Some(e.to_string()),
                    }),
                }
            }
            Err(e) => json!(ModelsResult {
                success: false,
                models: None,
                error: Some(e.to_string()),
            }),
        }
    } else {
        // OpenRouter
        match client
            .get("https://openrouter.ai/api/v1/models")
            .header("Authorization", format!("Bearer {}", api_key))
            .header("Content-Type", "application/json")
            .send()
            .await
        {
            Ok(resp) => {
                if !resp.status().is_success() {
                    let error_data: Value = resp.json().await.unwrap_or_default();
                    let msg = error_data["error"]["message"]
                        .as_str()
                        .unwrap_or("API Error")
                        .to_string();
                    return json!(ModelsResult {
                        success: false,
                        models: None,
                        error: Some(msg),
                    });
                }
                match resp.json::<Value>().await {
                    Ok(data) => {
                        let all_models = data["data"].as_array().cloned().unwrap_or_default();
                        let models: Vec<Value> = all_models
                            .iter()
                            .filter(|m| {
                                m["id"].as_str().map(|id| id.contains(":free")).unwrap_or(false)
                            })
                            .map(|m| {
                                json!({
                                    "id": m["id"],
                                    "name": m["name"],
                                    "context_length": m["context_length"],
                                    "pricing": m["pricing"]
                                })
                            })
                            .collect();
                        json!(ModelsResult {
                            success: true,
                            models: Some(models),
                            error: None,
                        })
                    }
                    Err(e) => json!(ModelsResult {
                        success: false,
                        models: None,
                        error: Some(e.to_string()),
                    }),
                }
            }
            Err(e) => json!(ModelsResult {
                success: false,
                models: None,
                error: Some(e.to_string()),
            }),
        }
    }
}

/// Test connection to Ollama server.
///
/// JS call:
/// ```js
/// window.__TAURI__.core.invoke('test_connection', { ollamaUrl })
/// ```
#[tauri::command]
pub async fn test_connection(ollama_url: String) -> Value {
    let base_url = if ollama_url.is_empty() {
        "http://localhost:11434".to_string()
    } else {
        ollama_url.trim_end_matches('/').to_string()
    };

    let client = match reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
    {
        Ok(c) => c,
        Err(e) => {
            return json!(SimpleResult {
                success: false,
                error: Some(e.to_string()),
            });
        }
    };

    match client
        .get(format!("{}/api/tags", base_url))
        .send()
        .await
    {
        Ok(resp) => {
            if resp.status().is_success() {
                json!(SimpleResult {
                    success: true,
                    error: None,
                })
            } else {
                json!(SimpleResult {
                    success: false,
                    error: Some(format!("Connection failed: {}", resp.status().as_u16())),
                })
            }
        }
        Err(e) => json!(SimpleResult {
            success: false,
            error: Some(e.to_string()),
        }),
    }
}
