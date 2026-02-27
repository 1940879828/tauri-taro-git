import { invoke } from "@tauri-apps/api/core"
import { atom, useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import { localStorageKey } from "@/constant/localStorageKey"
import { pushGlobalNotice } from "@/stores/useNotificationStore"

export interface BranchInfo {
  localBranches: string[]
  remoteBranches: string[]
  currentBranch: string | null
}

interface RepoInfo {
  current_branch: string | null
}

interface CreateBranchParams {
  fromBranch: string
  branchName: string
  force: boolean
  checkout: boolean
}

const defaultBranchInfo: BranchInfo = {
  localBranches: [],
  remoteBranches: [],
  currentBranch: null,
}

const branchInfoAtom = atomWithStorage<BranchInfo>(
  localStorageKey.STORAGE_KEY_BRANCHES,
  defaultBranchInfo
)
const branchLoadingAtom = atom(false)
const branchErrorAtom = atom<string | null>(null)

export function useBranchStore() {
  const [branchInfo, setBranchInfo] = useAtom(branchInfoAtom)
  const [loading, setLoading] = useAtom(branchLoadingAtom)
  const [error, setError] = useAtom(branchErrorAtom)

  // 获取分支信息
  const getBranch = async (repoPath: string, currentBranch?: string | null) => {
    setLoading(true)
    setError(null)

    try {
      const [localBranches, remoteBranches] = await Promise.all([
        invoke<string[]>("git_branches_local", { repoPath }),
        invoke<string[]>("git_branches_remote", { repoPath }),
      ])

      const info: BranchInfo = {
        localBranches,
        remoteBranches,
        currentBranch: currentBranch ?? null,
      }
      setBranchInfo(info)
      return info
    } catch (e) {
      console.error("获取分支信息出错:", e)
      const message = e instanceof Error ? e.message : String(e)
      setError(message)
      pushGlobalNotice({
        type: "error",
        title: "获取分支信息失败",
        content: message,
      })
    } finally {
      setLoading(false)
    }
  }

  // 签出分支并刷新分支信息
  const checkoutBranch = async (repoPath: string, branchName: string) => {
    setLoading(true)
    setError(null)

    try {
      await invoke<string>("git_checkout_branch", {
        repoPath,
        branchName,
      })
      console.log("签出分支", branchName)
      // 重新读取仓库真实 HEAD，再刷新分支信息，确保 UI 与仓库状态一致
      const repoInfo = await invoke<RepoInfo>("git_open", { repoPath })
      const currentBranch = repoInfo.current_branch ?? null
      await getBranch(repoPath, currentBranch)
      pushGlobalNotice({
        type: "info",
        title: `已切换到分支 ${currentBranch ?? branchName}`,
      })
      return currentBranch ?? branchName
    } catch (e) {
      console.error("签出分支出错:", e)
      const message = e instanceof Error ? e.message : String(e)
      setError(message)
      pushGlobalNotice({
        type: "error",
        title: `切换分支失败: ${branchName}`,
        content: message,
      })
    } finally {
      setLoading(false)
    }
  }

  // 创建分支（可覆盖、可选签出）并刷新分支信息
  const createBranch = async (repoPath: string, params: CreateBranchParams) => {
    setLoading(true)
    setError(null)

    try {
      const { fromBranch, branchName, force, checkout } = params
      await invoke<string>("git_create_branch", {
        repoPath,
        fromBranch,
        branchName,
        force,
        checkout,
      })

      const repoInfo = await invoke<RepoInfo>("git_open", { repoPath })
      const currentBranch = repoInfo.current_branch ?? null
      await getBranch(repoPath, currentBranch)

      pushGlobalNotice({
        type: "info",
        title: checkout ? `已创建并签出分支 ${branchName}` : `已创建分支 ${branchName}`,
      })
      return branchName
    } catch (e) {
      console.error("创建分支出错:", e)
      const message = e instanceof Error ? e.message : String(e)
      setError(message)
      pushGlobalNotice({
        type: "error",
        title: `创建分支失败: ${params.branchName}`,
        content: message,
      })
    } finally {
      setLoading(false)
    }
  }

  // 清除分支信息
  const clearBranch = () => {
    setBranchInfo(defaultBranchInfo)
    setError(null)
  }

  return {
    branchInfo,
    loading,
    error,
    getBranch,
    checkoutBranch,
    createBranch,
    clearBranch,
  }
}
