import { getCurrentWindow } from "@tauri-apps/api/window"
import type { RepoInfo } from "@/stores/useRepositoriesStore"

const APP_TITLE = "tauri-taro-git"

/**
 * 设置窗口标题
 * 有仓库时显示 "tauri-taro-git: 仓库名"，否则显示 "tauri-taro-git"
 */
export function setWindowTitle(repo?: RepoInfo | null) {
  if (repo) {
    const repoName = repo.path.split(/[/\\]/).pop() || repo.path
    console.log(`${APP_TITLE}: ${repoName}`)
    getCurrentWindow().setTitle(`Store: ${repoName}`)
  } else {
    getCurrentWindow().setTitle(APP_TITLE)
  }
}
