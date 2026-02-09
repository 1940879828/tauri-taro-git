import { Outlet, useNavigate } from "react-router"
import type { ToolbarOption } from "@/components/Toolbar"
import Toolbar from "@/components/Toolbar"
import { useRepositoriesStore } from "@/stores/useRepositoriesStore"
import { setWindowTitle } from "@/utils/window"
import styles from "./index.module.css"

const RootLayout = () => {
  const navigate = useNavigate()
  const { openRepo } = useRepositoriesStore()

  const handleOpenRepo = async () => {
    const info = await openRepo()
    if (info) {
      setWindowTitle(info)
      navigate("/home", { replace: true })
    }
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
          children: [
            {
              id: "file-2-1",
              label: "仓库1",
              action: () => console.log("打开仓库1")
            },
            {
              id: "file-2-2",
              label: "仓库2",
              action: () => console.log("打开仓库2")
            }
          ]
        }
      ]
    }
  ]

  return (
    <div className={styles.container}>
      <Toolbar options={options} />
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  )
}

export default RootLayout
