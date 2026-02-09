import { type RefObject, useEffect, useRef } from "react"

/**
 * 检测不在指定元素内部的点击事件
 * @param handler 点击元素外部时触发的回调。
 * @returns 一个 ref 对象，用于绑定到需要检测点击外部的元素上
 */
function useClickOutside<T extends HTMLElement>(
  handler: (event: MouseEvent) => void
): RefObject<T | null> {
  const ref = useRef<T>(null)
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return
      handler(event)
    }
    document.addEventListener("click", listener)
    return () => {
      document.removeEventListener("click", listener)
    }
  }, [handler])
  return ref
}

export default useClickOutside
