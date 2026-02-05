// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod git;

use git::{
  open_repo, RepoInfo,
};

#[tauri::command]
fn git_open(repo_path: String) -> Result<RepoInfo, git::GitError> {
  open_repo(&repo_path)
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_dialog::init())
    .invoke_handler(tauri::generate_handler![git_open])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
