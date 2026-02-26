import styles from "./index.module.css"

interface NotificationRailProps {
  expanded: boolean
  unreadCount: number
  onToggle: () => void
}

const NotificationRail = ({ expanded, unreadCount:_, onToggle }: NotificationRailProps) => {
  return (
    <div className={styles.container}>
      <button
        className={`${styles.button} ${expanded ? styles.active : ""}`}
        title="通知"
        onClick={onToggle}
      >
        <div className={styles.icon}></div>
        <span className={styles.text}>通知</span>
      </button>
    </div>
  )
}

export default NotificationRail
