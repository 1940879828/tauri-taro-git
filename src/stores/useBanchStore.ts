import { invoke } from "@tauri-apps/api/core"
import { atom, useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import { localStorageKey } from "@/constant/localStorageKey"

export interface BranchInfo {
  localBranches: string[]
  remoteBranches: string[]
  currentBranch: string | null
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
    } finally {
      setLoading(false)
    }
  }

  // 签出分支并刷新分支信息
  const checkoutBranch = async (repoPath: string, branchName: string) => {
    setLoading(true)
    setError(null)

    try {
      const checkedOutBranch = await invoke<string>("git_checkout_branch", {
        repoPath,
        branchName,
      })
      await getBranch(repoPath, checkedOutBranch)
      return checkedOutBranch
    } catch (e) {
      console.error("签出分支出错:", e)
      const message = e instanceof Error ? e.message : String(e)
      setError(message)
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
    clearBranch,
  }
}
