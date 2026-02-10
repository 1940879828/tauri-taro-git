import { invoke } from "@tauri-apps/api/core"
import { useLocalStorageState } from "ahooks"
import { useState } from "react"
import { localStorageKey } from "@/constant/localStorageKey"

export interface BranchInfo {
  localBranches: string[]
  remoteBranches: string[]
  currentBranch: string | null
}

export function useBranchStore() {
  const [branchInfo, setBranchInfo] = useLocalStorageState<BranchInfo>(
    localStorageKey.STORAGE_KEY_BRANCHES,
    {
      defaultValue: {
        localBranches: [],
        remoteBranches: [],
        currentBranch: null,
      },
    }
  )

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  // 清除分支信息
  const clearBranch = () => {
    setBranchInfo({
      localBranches: [],
      remoteBranches: [],
      currentBranch: null,
    })
    setError(null)
  }

  return {
    branchInfo: branchInfo ?? { localBranches: [], remoteBranches: [], currentBranch: null },
    loading,
    error,
    getBranch,
    clearBranch,
  }
}
