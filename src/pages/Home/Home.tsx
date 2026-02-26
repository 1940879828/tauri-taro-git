import SplitPane from "@/components/SplitPane"
import NotificationToastHost from "@/components/NotificationToastHost"
import BottomPanel from "@/pages/Home/components/BottomPanel"
import LeftSidebar from "@/pages/Home/components/LeftSidebar"
import NotificationHistoryPanel from "@/pages/Home/components/NotificationHistoryPanel"
import NotificationRail from "@/pages/Home/components/NotificationRail"
import RightEditor from "@/pages/Home/components/RightEditor"
import { useNotificationStore } from "@/stores/useNotificationStore"
import { useEffect, useState } from "react"
import styles from "./Home.module.css"

const Home = () => {
  const [showHistory, setShowHistory] = useState(false)
  const { unreadCount, markAllRead } = useNotificationStore()

  useEffect(() => {
    if (showHistory && unreadCount > 0) {
      markAllRead()
    }
  }, [showHistory, unreadCount, markAllRead])

  return (
    <div className={styles.container}>
      <SplitPane
        direction="vertical"
        minSize={100}
        splitterSize={10}
      >
        <SplitPane
          direction="horizontal"
          minSize={100}
          splitterSize={10}
        >
          <LeftSidebar />
          <div className={styles.rightWorkspace}>
            <div className={styles.rightEditor}>
              <RightEditor />
            </div>
            {showHistory ? <NotificationHistoryPanel /> : null}
            <NotificationRail
              expanded={showHistory}
              unreadCount={unreadCount}
              onToggle={() => setShowHistory((prev) => !prev)}
            />
          </div>
        </SplitPane>
        <BottomPanel />
      </SplitPane>
      <NotificationToastHost />
    </div>
  )
}

export default Home
