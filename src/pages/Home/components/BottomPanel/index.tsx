import { useCallback, useState } from "react"
import Tabs from "@/components/Tabs"
import useClickInside from "@/hook/useClickInside"
import useClickOutside from "@/hook/useClickOutSide"
import styles from "./index.module.css"

const BottomPanel = () => {
  const [activeTabKey, setActiveTabKey] = useState("home")
  const [focusBottomContent, setFocusBottomContent] = useState(false)

  const insideRef = useClickInside<HTMLDivElement>(
    useCallback(() => setFocusBottomContent(true), [])
  )
  const outsideRef = useClickOutside<HTMLDivElement>(
    useCallback(() => setFocusBottomContent(false), [])
  )

  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      ;(insideRef as React.MutableRefObject<HTMLDivElement | null>).current = node
      ;(outsideRef as React.MutableRefObject<HTMLDivElement | null>).current = node
    },
    [insideRef, outsideRef]
  )

  const tabs = [
    {
      label: "日志",
      key: "home"
    },
    {
      label: "控制台",
      key: "category"
    }
  ]
  return (
    <div ref={mergedRef} className={styles.container}>
      <Tabs
        prefix={
          <div className="w-8 text-center text-[12px] select-none cursor-default">
            Git:
          </div>
        }
        items={tabs}
        activeKey={activeTabKey}
        onChange={setActiveTabKey}
        focused={focusBottomContent}
      />
      <div className={styles.content}>content</div>
    </div>
  )
}

export default BottomPanel
