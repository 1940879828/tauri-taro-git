/** 有子菜单的菜单项，无 action */
export interface MenuItemWithChildren {
  id: string
  label: string
  children: MenuItem[]
}

/** 可点击的菜单项，无 children */
export interface MenuItemAction {
  id: string
  label: string
  action: () => void
}

/** 菜单项：要么有 children，要么有 action（互斥） */
export type MenuItem = MenuItemWithChildren | MenuItemAction

export function isMenuItemWithChildren(
  item: MenuItem
): item is MenuItemWithChildren {
  return "children" in item && Array.isArray(item.children)
}

export function isMenuItemAction(item: MenuItem): item is MenuItemAction {
  return "action" in item && typeof item.action === "function"
}

/** 工具栏选项：与顶层菜单一一对应 */
export interface ToolbarOption {
  type: string
  label: string
  items: MenuItem[]
}
