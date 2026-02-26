import { ReactNode } from "react"
import { atom, getDefaultStore, useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import { localStorageKey } from "@/constant/localStorageKey"

const MAX_HISTORY = 200
const DEFAULT_AUTO_CLOSE_MS = 3500
const ERROR_AUTO_CLOSE_MS = 6000

export type NoticeType = "info" | "warning" | "error"

export interface NoticeItem {
  id: string
  type: NoticeType
  title: string
  content?: string
  time: number
  read: boolean
}

export type NoticeCustomRender = (notice: NoticeItem) => ReactNode

export interface PushNoticePayload {
  type: NoticeType
  title: string
  content?: string
  autoCloseMs?: number
  render?: NoticeCustomRender
}

export interface ToastItem {
  id: string
  notice: NoticeItem
  autoCloseMs: number
  render?: NoticeCustomRender
}

const notificationsAtom = atomWithStorage<NoticeItem[]>(
  localStorageKey.STORAGE_KEY_NOTIFICATIONS,
  []
)

const toastsAtom = atom<ToastItem[]>([])
const jotaiStore = getDefaultStore()

const getDefaultAutoCloseMs = (type: NoticeType) => {
  if (type === "error") {
    return ERROR_AUTO_CLOSE_MS
  }
  return DEFAULT_AUTO_CLOSE_MS
}

const createNoticeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

const createNotice = (payload: PushNoticePayload): NoticeItem => ({
  id: createNoticeId(),
  type: payload.type,
  title: payload.title,
  content: payload.content,
  time: Date.now(),
  read: false,
})

export const pushGlobalNotice = (payload: PushNoticePayload) => {
  const notice = createNotice(payload)

  const nextNotifications = [notice, ...jotaiStore.get(notificationsAtom)].slice(0, MAX_HISTORY)
  jotaiStore.set(notificationsAtom, nextNotifications)
  jotaiStore.set(toastsAtom, [
    ...jotaiStore.get(toastsAtom),
    {
      id: notice.id,
      notice,
      autoCloseMs: payload.autoCloseMs ?? getDefaultAutoCloseMs(payload.type),
      render: payload.render,
    },
  ])

  return notice
}

export function useNotificationStore() {
  const [notifications, setNotifications] = useAtom(notificationsAtom)
  const [toasts, setToasts] = useAtom(toastsAtom)

  const pushNotice = (payload: PushNoticePayload) => {
    const notice = createNotice(payload)
    setNotifications((prev) => [notice, ...prev].slice(0, MAX_HISTORY))
    setToasts((prev) => {
      const next = [...prev]
      next.push({
        id: notice.id,
        notice,
        autoCloseMs: payload.autoCloseMs ?? getDefaultAutoCloseMs(payload.type),
        render: payload.render,
      })
      return next
    })
    return notice
  }

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    )
  }

  const markAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
  }

  const removeNotice = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id))
    setToasts((prev) => prev.filter((item) => item.id !== id))
  }

  const clearNotices = () => {
    setNotifications([])
    setToasts([])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id))
  }

  const unreadCount = notifications.reduce((count, item) => {
    if (!item.read) {
      return count + 1
    }
    return count
  }, 0)

  return {
    notifications,
    toasts,
    unreadCount,
    pushNotice,
    markRead,
    markAllRead,
    removeNotice,
    clearNotices,
    removeToast,
  }
}
