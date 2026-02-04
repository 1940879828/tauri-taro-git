import { useMemo } from "react"
import { Outlet } from "react-router"
import type { ToolbarOption } from "@/components/Toolbar"
import Toolbar from "@/components/Toolbar"
import styles from "./index.module.css"

const toolbarOptions: ToolbarOption[] = [
  {
    type: "file",
    label: "文件",
    items: [
      {
        id: "file-1",
        label: "打开仓库",
        action: () => console.log("打开仓库")
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

const RootLayout = () => {
  const options = useMemo(() => toolbarOptions, [])

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
