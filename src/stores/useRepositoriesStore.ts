import { invoke } from "@tauri-apps/api/core"
import { open } from "@tauri-apps/plugin-dialog"
import { useLocalStorageState } from "ahooks"
import { useState } from "react"
import { localStorageKey } from "@/constant/localStorageKey"
import { setWindowTitle } from "@/utils/window"

// 仓库信息类型（与 Rust 后端返回一致）
export interface RepoInfo {
  path: string
  current_branch: string | null
  is_bare: boolean
}

// 存储的仓库记录（可扩展更多元数据）
export interface RepoRecord {
  path: string
  name: string // 仓库名（从 path 提取）
  lastOpened: number // 时间戳
}

export function useRepositoriesStore() {
  // 最近打开的仓库列表
  const [recentRepos, setRecentRepos] = useLocalStorageState<RepoRecord[]>(
    localStorageKey.STORAGE_KEY_RECENT_REPO,
    { defaultValue: [] }
  )

  // 当前仓库信息
  const [currentRepo, setCurrentRepo] = useLocalStorageState<RepoInfo | null>(
    localStorageKey.STORAGE_KEY_CURRENT_REPO,
    { defaultValue: null }
  )

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openRepo = async () => {
    console.log("1. openRepo 开始执行") // 👈 加这里
    setLoading(true)
    setError(null)

    try {
      console.log("2. 准备打开文件夹对话框") // 👈 加这里
      const selected = await open({
        directory: true,
        multiple: false
      })
      if (!selected) {
        console.log("4. 用户取消了选择") // 👈 加这里
        setLoading(false)
        return
      }
      console.log("3. 对话框返回:", selected) // 👈 加这里
      const info = await invoke<RepoInfo>("git_open", { repoPath: selected })
      // 更新当前仓库
      setCurrentRepo(info)
      // 更新最近打开列表（去重 + 置顶）
      const repoName = info.path.split(/[/\\]/).pop() || info.path

      const newRecord: RepoRecord = {
        path: info.path,
        name: repoName,
        lastOpened: Date.now()
      }

      setRecentRepos((prev = []) => {
        const filtered = prev.filter((r) => r.path !== info.path)
        return [newRecord, ...filtered].slice(0, 20) // 最多保留 20 个
      })

      return info
    } catch (e) {
      console.error("出错了:", e) // 👈 重点！把错误打出来
      const message = e instanceof Error ? e.message : String(e)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // 通过路径直接打开仓库
  const openRepoByPath = async (repoPath: string) => {
    setLoading(true)
    setError(null)

    try {
      const info = await invoke<RepoInfo>("git_open", { repoPath })
      setCurrentRepo(info)

      const repoName = info.path.split(/[/\\]/).pop() || info.path
      const newRecord: RepoRecord = {
        path: info.path,
        name: repoName,
        lastOpened: Date.now()
      }

      setRecentRepos((prev = []) => {
        const filtered = prev.filter((r) => r.path !== info.path)
        return [newRecord, ...filtered].slice(0, 20)
      })

      return info
    } catch (e) {
      console.error("打开仓库出错:", e)
      const message = e instanceof Error ? e.message : String(e)
      setError(message)
      // 打开失败，从最近仓库列表中移除
      removeFromRecent(repoPath)
    } finally {
      setLoading(false)
    }
  }

  // 从最近列表移除
  const removeFromRecent = (repoPath: string) => {
    setRecentRepos((prev = []) => prev.filter((r) => r.path !== repoPath))
  }

  // 关闭当前仓库
  const closeRepo = () => {
    setCurrentRepo(null)
    setError(null)
    setWindowTitle(null)
  }

  // 清除所有缓存
  const clearCache = () => {
    setCurrentRepo(null)
    setRecentRepos([])
    setError(null)
  }

  return {
    // 状态
    currentRepo,
    recentRepos: recentRepos ?? [],
    loading,
    error,

    // 方法
    openRepo,
    openRepoByPath,
    closeRepo,
    removeFromRecent,
    clearCache
  }
}
