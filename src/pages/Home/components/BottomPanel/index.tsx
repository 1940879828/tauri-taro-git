import { useCallback, useState } from "react"
import Tabs from "@/components/Tabs"
import useClickInside from "@/hook/useClickInside"
import useClickOutside from "@/hook/useClickOutSide"
import BranchControl from "@/pages/Home/components/BranchControl"
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
      ;(insideRef as React.MutableRefObject<HTMLDivElement | null>).current =
        node
      ;(outsideRef as React.MutableRefObject<HTMLDivElement | null>).current =
        node
    },
    [insideRef, outsideRef]
  )

  const tabs = [
    {
      label: "分支",
      key: "home"
    },
    {
      label: "控制台",
      key: "category"
    }
  ]

  const renderTabContent = () => {
    switch (activeTabKey) {
      case "home":
        return <BranchControl />
      case "category":
        return <div>控制台</div>
      default:
        return null
    }
  }

  return (
    <div ref={mergedRef} className={styles.container}>
      <Tabs
        prefix={
          <div className="w-[30px] text-center text-[12px] select-none cursor-default">
            Git:
          </div>
        }
        items={tabs}
        activeKey={activeTabKey}
        onChange={setActiveTabKey}
        focused={focusBottomContent}
      />
      <div className={styles.content}>{renderTabContent()}</div>
    </div>
  )
}

export default BottomPanel
