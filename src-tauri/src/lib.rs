// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod git;

use git::{
  open_repo, RepoInfo,
  git_local_branches as do_git_local_branches,
  git_remote_branches as do_git_remote_branches,
  git_checkout_branch as do_git_checkout_branch,
};

#[tauri::command]
fn git_open(repo_path: String) -> Result<RepoInfo, git::GitError> {
  open_repo(&repo_path)
}

#[tauri::command]
fn git_branches_local(repo_path: String) -> Result<Vec<String>, git::GitError> {
    do_git_local_branches(&repo_path)
}

#[tauri::command]
fn git_branches_remote(repo_path: String) -> Result<Vec<String>, git::GitError> {
    do_git_remote_branches(&repo_path)
}

#[tauri::command]
fn git_checkout_branch(repo_path: String, branch_name: String) -> Result<String, git::GitError> {
  do_git_checkout_branch(&repo_path, &branch_name)
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_dialog::init())
    .invoke_handler(tauri::generate_handler![
      git_open,
      git_branches_local,
      git_branches_remote,
      git_checkout_branch,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
