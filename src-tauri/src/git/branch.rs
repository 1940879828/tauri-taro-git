use super::{get_repo, GitError};
use git2::BranchType;

/// 获取所有本地分支名（简短名，如 main、develop）
pub fn git_local_branches(repo_path: &str) -> Result<Vec<String>, GitError> {
    let repo = get_repo(repo_path)?;
    let mut names = Vec::new();
    for branch in repo.branches(Some(BranchType::Local))? {
        let (b, _): (git2::Branch<'_>, BranchType) = branch?;
        if let Some(name) = b.name()? {
            names.push(name.to_string());
        }
    }
    names.sort();
    Ok(names)
}

/// 获取所有远程分支名（简短名，如 origin/main、origin/develop），不包含远程 HEAD（如 origin/HEAD）
pub fn git_remote_branches(repo_path: &str) -> Result<Vec<String>, GitError> {
    let repo = get_repo(repo_path)?;
    let mut names = Vec::new();
    for branch in repo.branches(Some(BranchType::Remote))? {
        let (b, _): (git2::Branch<'_>, BranchType) = branch?;
        if let Some(name) = b.name()? {
            // 不显示远程 HEAD 指针（如 origin/HEAD）
            if name.ends_with("/HEAD") {
                continue;
            }
            names.push(name.to_string());
        }
    }
    names.sort();
    Ok(names)
}