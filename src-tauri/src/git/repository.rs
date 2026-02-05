use super::GitError;
use git2::Repository;
use serde::Serialize;  
use std::path::Path;

#[derive(Debug, Serialize)]
pub struct RepoInfo {
    pub path: String,
    pub current_branch: Option<String>,
    pub is_bare: bool,
}

/// 打开并验证 Git 仓库，返回基本信息
pub fn open_repo(repo_path: &str) -> Result<RepoInfo, GitError> {
    let path = Path::new(repo_path).canonicalize().map_err(|e| GitError {
        message: format!("路径无效: {}", e),
    })?;
    let repo = Repository::open(&path).map_err(|e| GitError {
        message: format!("不是有效的 Git 仓库: {}", e.message()),
    })?;
    let path_str = path.to_string_lossy().into_owned();
    let current_branch = repo
        .head()
        .ok()
        .and_then(|r| r.shorthand().map(String::from));
    Ok(RepoInfo {
        path: path_str,
        current_branch,
        is_bare: repo.is_bare(),
    })
}