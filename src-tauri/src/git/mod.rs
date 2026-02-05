mod repository;

pub use repository::{open_repo, RepoInfo};

use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct GitError {
    pub message: String,
}

