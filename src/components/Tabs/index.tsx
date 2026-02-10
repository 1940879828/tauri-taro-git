import type React from "react"
import styles from "./index.module.css"

export type Tab = { label: string; key: string }

interface TabsProps {
  items: Tab[]
  // 当前激活的tab，对应item的value
  activeKey: string
  // 切换tab的回调
  onChange: (key: string) => void
  prefix?: React.ReactNode
  // 是否处于聚焦状态
  focused?: boolean
}

const Tabs: React.FC<TabsProps> = ({
  items,
  activeKey,
  onChange,
  prefix,
  focused = true
}) => {
  return (
    <div
      className={`${styles.tabs} ${focused ? styles.focused : styles.unfocused}`}
    >
      {prefix}
      {items.map((item) => (
        <div
          key={item.key}
          className={`${styles.tab} ${activeKey === item.key ? styles.active : ""}`}
          onClick={() => onChange(item.key)}
        >
          {item.label}
        </div>
      ))}
    </div>
  )
}

export default Tabs
