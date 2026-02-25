use super::{get_repo, GitError};
use git2::build::CheckoutBuilder;
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

fn checkout_local_branch(repo: &git2::Repository, branch_name: &str) -> Result<(), GitError> {
    let local_ref = format!("refs/heads/{}", branch_name);
    let reference = repo.find_reference(&local_ref)?;
    let target = reference.peel_to_commit()?;

    let mut checkout = CheckoutBuilder::new();
    checkout.safe();
    repo.checkout_tree(target.as_object(), Some(&mut checkout))?;
    repo.set_head(&local_ref)?;
    Ok(())
}

/// 签出分支：
/// - 本地分支：直接签出
/// - 远程分支（如 origin/main）：若本地不存在则先创建同名本地分支再签出
pub fn git_checkout_branch(repo_path: &str, branch_name: &str) -> Result<String, GitError> {
    let repo = get_repo(repo_path)?;

    if repo.find_branch(branch_name, BranchType::Local).is_ok() {
        checkout_local_branch(&repo, branch_name)?;
        return Ok(branch_name.to_string());
    }

    if repo.find_branch(branch_name, BranchType::Remote).is_ok() {
        let local_branch_name = match branch_name.split_once('/') {
            Some((_, name)) if !name.is_empty() => name,
            _ => branch_name,
        };

        if repo
            .find_branch(local_branch_name, BranchType::Local)
            .is_err()
        {
            let remote_ref = format!("refs/remotes/{}", branch_name);
            let remote_reference = repo.find_reference(&remote_ref)?;
            let remote_commit = remote_reference.peel_to_commit()?;
            repo.branch(local_branch_name, &remote_commit, false)?;
        }

        checkout_local_branch(&repo, local_branch_name)?;
        return Ok(local_branch_name.to_string());
    }

    Err(GitError {
        message: format!("分支不存在: {}", branch_name),
    })
}