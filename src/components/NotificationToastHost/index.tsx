import { useEffect } from "react"
import styles from "./index.module.css"
import { NoticeItem, ToastItem, useNotificationStore } from "@/stores/useNotificationStore"

const DefaultNoticeCard = ({
  toast,
}: {
  toast: ToastItem
}) => {
  const { notice } = toast

  return (
    <div className={`${styles.card}`}>
      <div className={styles.main}>
        <span className={`${styles.typeIcon} ${styles[notice.type]}`} />
        <div className={styles.textWrap}>
          <div className={styles.title}>{notice.title}</div>
          {notice.content ? <div className={styles.content}>{notice.content}</div> : null}
        </div>
      </div>
    </div>
  )
}

const renderToast = (toast: ToastItem, notice: NoticeItem) => {
  if (toast.render) {
    return <div className={styles.custom}>{toast.render(notice)}</div>
  }

  return <DefaultNoticeCard toast={toast} />
}

const NotificationToastHost = () => {
  const { toasts, removeToast } = useNotificationStore()

  useEffect(() => {
    const timers = toasts
      .filter((toast) => toast.autoCloseMs > 0)
      .map((toast) =>
        setTimeout(() => {
          removeToast(toast.id)
        }, toast.autoCloseMs)
      )

    return () => {
      timers.forEach((timer) => clearTimeout(timer))
    }
  }, [toasts, removeToast])

  if (toasts.length === 0) {
    return null
  }

  return (
    <div className={styles.host}>
      {toasts.map((toast) => (
        <div key={toast.id}>{renderToast(toast, toast.notice)}</div>
      ))}
    </div>
  )
}

export default NotificationToastHost
