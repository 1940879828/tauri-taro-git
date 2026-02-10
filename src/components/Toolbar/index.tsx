import { useThrottleFn } from "ahooks"
import { type MouseEvent, forwardRef, useImperativeHandle, useRef, useState } from "react"
import useClickOutside from "@/hook/useClickOutSide.ts"
import { cn } from "@/utils/styles.ts"
import styles from "./index.module.css"
import ToolbarSubMenu from "./ToolbarSubMenu"
import type { ToolbarOption } from "./types"
import { isMenuItemAction, isMenuItemWithChildren } from "./types"

export type { MenuItem, ToolbarOption } from "./types"

export interface ToolbarRef {
  closeMenu: () => void
}

interface ToolbarProps {
  options: ToolbarOption[]
}

const Toolbar = forwardRef<ToolbarRef, ToolbarProps>(({ options }, ref) => {
  const [activeOption, setActiveOption] = useState<string>("")
  const [menuPositionLeft, setMenuPositionLeft] = useState(0)

  const activeOptionRef = useRef(activeOption)
  const isMenuOpenRef = useRef(activeOption !== "")
  activeOptionRef.current = activeOption
  isMenuOpenRef.current = activeOption !== ""

  useImperativeHandle(ref, () => ({
    closeMenu: () => setActiveOption("")
  }))

  const isMenuOpen = activeOption !== ""

  const validTypes = options.map((o) => o.type)

  const isValidOptionType = (value: unknown): value is string =>
    typeof value === "string" && validTypes.includes(value)

  const toolbarRef = useClickOutside<HTMLDivElement>(() => {
    if (isMenuOpenRef.current) {
      setActiveOption("")
    }
  })

  const getOptionElement = (target: EventTarget): HTMLElement | null => {
    if (!(target instanceof HTMLElement)) return null
    return target.closest(`.${styles.option}`)
  }

  const handleOptionsClick = (e: MouseEvent<HTMLDivElement>) => {
    const optionElement = getOptionElement(e.target)
    if (!optionElement) return

    const type = optionElement.dataset.type
    if (!isValidOptionType(type)) return

    if (type === activeOptionRef.current && isMenuOpenRef.current) {
      setActiveOption("")
      return
    }

    setActiveOption(type)
    setMenuPositionLeft(optionElement.offsetLeft)
  }

  const handleOptionsEnter = (e: MouseEvent<HTMLDivElement>) => {
    if (!isMenuOpenRef.current) return

    const optionElement = getOptionElement(e.target)
    if (!optionElement) return

    const type = optionElement.dataset.type
    if (!isValidOptionType(type)) return

    if (type !== activeOptionRef.current) {
      setActiveOption(type)
      setMenuPositionLeft(optionElement.offsetLeft)
    }
  }

  const { run: ThrottleHandleOptionsEnter } = useThrottleFn(
    handleOptionsEnter,
    { wait: 50 }
  )

  const currentOption = options.find((o) => o.type === activeOption)
  const currentMenuItems = currentOption?.items

  return (
    <div className={styles.container} ref={toolbarRef}>
      <div
        className={styles.options}
        onClick={handleOptionsClick}
        onMouseOver={ThrottleHandleOptionsEnter}
        role="menubar"
      >
        {options.map((opt) => (
          <div
            key={opt.type}
            className={cn(
              styles.option,
              activeOption === opt.type ? styles.active : ""
            )}
            data-type={opt.type}
            role="menuitem"
            aria-haspopup="true"
          >
            {opt.label}
          </div>
        ))}
      </div>
      {isMenuOpen && currentMenuItems && (
        <div
          className={styles.menu}
          style={{ left: menuPositionLeft }}
          role="menu"
        >
          {currentMenuItems.map((item) => (
            <div
              key={item.id}
              className={styles.menuItem}
              role="menuitem"
              tabIndex={0}
            >
              <span
                className={styles.menuItemLabel}
                onClick={isMenuItemAction(item) ? item.action : undefined}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isMenuItemAction(item)) item.action()
                }}
              >
                {item.label}
              </span>
              {isMenuItemWithChildren(item) && item.children.length > 0 ? (
                <>
                  <span className={styles.arrowIcon} aria-hidden />
                  <ToolbarSubMenu items={item.children} />
                </>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

Toolbar.displayName = "Toolbar"

export default Toolbar
