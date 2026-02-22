mod commands;

// ─────────────────────────────────────────────
//  App entry point
// ─────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::enhance_prompt,
            commands::get_models,
            commands::test_connection
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
