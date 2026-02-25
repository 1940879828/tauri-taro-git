mod repository;
mod branch;

pub use repository::{get_repo,open_repo, RepoInfo};
pub use branch::{
    git_checkout_branch, git_local_branches, git_remote_branches,
};

use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct GitError {
    pub message: String,
}

impl From<git2::Error> for GitError {
    fn from(err: git2::Error) -> Self {
        GitError {
            message: err.message().to_string(),
        }
    }
}

