import styles from "./index.module.css"

import addIcon from "./add.svg"
import grayAddIcon from "./gray_add.svg"
import blueArrowIcon from "./blue_arrow.svg"
import grayArrowIcon from "./gray_arrow.svg"
import blueDeleteIcon from "./blue_delete.svg"
import grayDeleteIcon from "./gray_delete.svg"
import blueArrowBorderIcon from "./blue_arrow_border.svg"
import grayArrowBorderIcon from "./gray_arrow_border.svg"

export interface SidebarItem {
  key: string
  icon: string
  disabledIcon: string
  disabled?: boolean
  title?: string
  size?: number
  onClick?: () => void
}

export const defaultSidebarItems: SidebarItem[] = [
  {
    key: "add",
    icon: addIcon,
    disabledIcon: grayAddIcon,
    title: "新分支",
    size: 16,
    disabled: false,
  },
  {
    key: "update",
    icon: blueArrowIcon,
    disabledIcon: grayArrowIcon,
    title: "更新所选",
    size: 11,
    disabled: false,
  },
  {
    key: "delete",
    icon: blueDeleteIcon,
    disabledIcon: grayDeleteIcon,
    title: "删除",
    size: 17,
    disabled: false,
  },
  {
    key: "extract",
    icon: blueArrowBorderIcon,
    disabledIcon: grayArrowBorderIcon,
    title: "提取",
    size: 12,
    disabled: false,
  },
]

interface BranchSidebarProps {
  onOptionClick: (key: string) => void
}

const BranchSidebar = ({ onOptionClick }: BranchSidebarProps) => {
  return (
    <div className={styles.container}>
      {defaultSidebarItems.map((item) => (
        <div
          key={item.key}
          className={`${styles.item} ${item.disabled ? styles.disabled : ""}`}
          title={item.title}
          onClick={() => !item.disabled && onOptionClick(item.key)}
        >
          <img
            src={item.disabled ? item.disabledIcon : item.icon}
            alt={item.key}
            style={item.size ? { width: item.size, height: item.size } : undefined}
          />
        </div>
      ))}
    </div>
  )
}

export default BranchSidebar
