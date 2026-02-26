import styles from "./index.module.css"
import { useNotificationStore } from "@/stores/useNotificationStore"

const formatTime = (time: number) =>
  new Date(time).toLocaleString("zh-CN", {
    hour12: false,
  })

const NotificationHistoryPanel = () => {
  const { notifications, markRead, removeNotice, markAllRead: _, clearNotices } = useNotificationStore()

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>通知</span>
      </div>
      <div className={styles.timelineHeader}>
        <span className={styles.title}>时间线</span>
        <span className={styles.deleteButton} onClick={() => clearNotices()}>全部清除</span>
      </div>

      <div className={styles.list}>
        {notifications.length === 0 ? (
          <div className={styles.empty}>暂无通知</div>
        ) : (
          notifications.map((notice) => (
            <div
              key={notice.id}
              className={`${styles.item} ${notice.read ? styles.read : ""}`}
              onClick={() => markRead(notice.id)}
            >
              <div className={styles.itemHeader}>
                <span className={`${styles.typeTag} ${styles[notice.type]}`} />
                <span className={styles.time}>{formatTime(notice.time)}</span>
                <button
                  className={styles.deleteButton}
                  onClick={(event) => {
                    event.stopPropagation()
                    removeNotice(notice.id)
                  }}
                >
                  删除
                </button>
              </div>
              <div className={styles.itemTitle}>{notice.title}</div>
              {notice.content ? <div className={styles.itemContent}>{notice.content}</div> : null}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default NotificationHistoryPanel
