import { useRef } from "react"
import { Outlet, useNavigate } from "react-router"
import type { ToolbarOption } from "@/components/Toolbar"
import Toolbar from "@/components/Toolbar"
import type { ToolbarRef } from "@/components/Toolbar"
import { useRepositoriesStore } from "@/stores/useRepositoriesStore"
import { setWindowTitle } from "@/utils/window"
import styles from "./index.module.css"

const RootLayout = () => {
  const navigate = useNavigate()
  const { openRepo, openRepoByPath, closeRepo, recentRepos } = useRepositoriesStore()
  const toolbarRef = useRef<ToolbarRef>(null)

  const handleOpenRepo = async () => {
    toolbarRef.current?.closeMenu()
    const info = await openRepo()
    if (info) {
      setWindowTitle(info)
      navigate("/home", { replace: true })
    }
  }

  const handleOpenRecentRepo = async (repoPath: string) => {
    toolbarRef.current?.closeMenu()
    const info = await openRepoByPath(repoPath)
    if (info) {
      setWindowTitle(info)
      navigate("/home", { replace: true })
    }
  }

  const handleCloseRepo = () => {
    closeRepo()
    navigate("/", { replace: true })
    toolbarRef.current?.closeMenu()
  }

  const options: ToolbarOption[] = [
    {
      type: "file",
      label: "文件",
      items: [
        {
          id: "file-1",
          label: "打开仓库",
          action: handleOpenRepo
        },
        {
          id: "file-2",
          label: "最近的仓库",
          children: recentRepos.map((repo) => ({
            id: `recent-${repo.path}`,
            label: repo.name,
            action: () => handleOpenRecentRepo(repo.path)
          }))
        },
        {
          id: "file-3",
          label: "关闭仓库",
          action: handleCloseRepo
        }
      ]
    }
  ]

  return (
    <div className={styles.container}>
      <Toolbar ref={toolbarRef} options={options} />
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  )
}

export default RootLayout
