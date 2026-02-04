import { Outlet } from "react-router"
import Toolbar from "@/components/Toolbar"
import styles from "./index.module.css"

const RootLayout = () => {
  return (
    <div className={styles.container}>
      <Toolbar />
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  )
}

export default RootLayout
