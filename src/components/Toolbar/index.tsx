import { type MouseEvent, useMemo, useState } from "react"
import useClickOutside from "@/hook/useClickOutSide.ts"
import { cn } from "@/utils/styles.ts"
import styles from "./index.module.css"

const OPTION_TYPES = {
  FILE: "file",
  EDIT: "edit"
} as const

type ValidOptionKey = (typeof OPTION_TYPES)[keyof typeof OPTION_TYPES]
type ActiveOptionState = ValidOptionKey | ""

const Index = () => {
  const [activeOption, setActiveOption] = useState<ActiveOptionState>("")
  const [menuPositionLeft, setMenuPositionLeft] = useState(0)

  const isMenuOpen = activeOption !== ""

  const toolbarRef = useClickOutside<HTMLDivElement>(() => {
    if (isMenuOpen) {
      setActiveOption("")
    }
  })

  const getOptionElement = (target: EventTarget): HTMLElement | null => {
    if (!(target instanceof HTMLElement)) return null
    return target.closest(`.${styles.option}`) // 使用 closest 更健壮地查找父级选项
  }

  const handleOptionsClick = (e: MouseEvent<HTMLDivElement>) => {
    const optionElement = getOptionElement(e.target)
    if (!optionElement) return

    const type = optionElement.dataset.type as ActiveOptionState

    // 如果点击的是当前已激活的选项，则关闭菜单
    if (type && type === activeOption && isMenuOpen) {
      setActiveOption("")
      return
    }

    // 否则，切换菜单状态并更新激活选项和位置
    if (type) {
      setActiveOption(type)
      setMenuPositionLeft(optionElement.offsetLeft)
    }
  }

  const handleOptionsEnter = (e: MouseEvent<HTMLDivElement>) => {
    // 只有当菜单已打开时，才更新高亮和位置
    if (!isMenuOpen) return

    const optionElement = getOptionElement(e.target)
    if (!optionElement) return

    const type = optionElement.dataset.type as ActiveOptionState

    if (type && type !== activeOption) {
      // 避免不必要的更新
      setActiveOption(type)
      setMenuPositionLeft(optionElement.offsetLeft)
    }
  }

  // 菜单项数据
  const menuItems = useMemo(
    () => ({
      [OPTION_TYPES.FILE]: [
        { label: "新建文件", action: () => console.log("新建文件") },
        { label: "打开文件", action: () => console.log("打开文件") }
      ],
      [OPTION_TYPES.EDIT]: [
        { label: "撤销", action: () => console.log("撤销") },
        { label: "重做", action: () => console.log("重做") }
      ]
    }),
    []
  )

  const currentMenuItems = activeOption ? menuItems[activeOption] : undefined

  return (
    <div className={styles.container} ref={toolbarRef}>
      <div
        className={styles.options}
        onClick={handleOptionsClick}
        onMouseOver={handleOptionsEnter}
        role="menubar"
      >
        <div
          className={cn(
            styles.option,
            activeOption === OPTION_TYPES.FILE ? styles.active : ""
          )}
          data-type={OPTION_TYPES.FILE}
          role="menuitem"
          aria-haspopup="true"
        >
          文件
        </div>
        <div
          className={cn(
            styles.option,
            activeOption === OPTION_TYPES.EDIT ? styles.active : ""
          )}
          data-type={OPTION_TYPES.EDIT}
          role="menuitem"
          aria-haspopup="true"
        >
          编辑
        </div>
      </div>
      {isMenuOpen && currentMenuItems && (
        <div
          className={styles.menu}
          style={{ left: menuPositionLeft }}
          role="menu"
        >
          {currentMenuItems.map((item) => (
            <div
              key={item.label}
              className={styles.menuItem}
              onClick={item.action}
              role="menuitem"
              tabIndex={0}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Index
