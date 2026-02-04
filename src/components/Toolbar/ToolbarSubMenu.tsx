import styles from "./index.module.css"
import type { MenuItem } from "./types"
import { isMenuItemAction, isMenuItemWithChildren } from "./types"

interface ToolbarSubMenuProps {
  items: MenuItem[]
}

const ToolbarSubMenu = ({ items }: ToolbarSubMenuProps) => (
  <div className={styles.subMenu} role="menu">
    {items.map((item) => (
      <div
        key={item.id}
        className={styles.subMenuItem}
        role="menuitem"
        tabIndex={0}
      >
        <span
          className={styles.subMenuItemLabel}
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
)

export default ToolbarSubMenu
