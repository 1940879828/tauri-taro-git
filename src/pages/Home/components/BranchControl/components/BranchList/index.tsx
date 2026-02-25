import { useEffect, useState, type MouseEvent } from "react"
import type { ToolbarOption } from "@/components/Toolbar"
import Toolbar from "@/components/Toolbar"
import { useBranchStore } from "@/stores/useBanchStore"
import { useRepositoriesStore } from "@/stores/useRepositoriesStore"
import styles from "./index.module.css"
import arrowIcon from "./arrow.svg"
import tagIcon from "./tag.svg"
import branchIcon from "./branch.svg"
import folderIcon from "./folder.svg"

interface TreeNode {
  key: string
  label: string
  children?: TreeNode[]
  isBranch?: boolean
  isCurrentBranch?: boolean
}

/** 将分支名列表构建为嵌套树结构（按 "/" 分层） */
function buildTree(branches: string[], currentBranch: string | null): TreeNode[] {
  const root: TreeNode[] = []

  for (const branch of branches) {
    const parts = branch.split("/")
    let currentLevel = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const key = parts.slice(0, i + 1).join("/")
      const isLast = i === parts.length - 1

      let existing = currentLevel.find((n) => n.label === part && n.key === key)
      if (!existing) {
        existing = {
          key,
          label: part,
          ...(isLast
            ? { isBranch: true, isCurrentBranch: branch === currentBranch }
            : { children: [] }),
        }
        currentLevel.push(existing)
      }

      // 如果不是最后一级，进入下一层
      if (!isLast) {
        if (!existing.children) existing.children = []
        currentLevel = existing.children
      }
    }
  }

  return root
}

interface TreeItemProps {
  node: TreeNode
  depth: number
  selectedKey: string | null
  onSelect: (key: string) => void
  onContextMenu: (event: MouseEvent<HTMLDivElement>, node: TreeNode) => void
}

const TreeItem = ({ node, depth, selectedKey, onSelect, onContextMenu }: TreeItemProps) => {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0
  const isSelected = node.key === selectedKey

  const handleClick = () => {
    if (hasChildren) {
      setExpanded(!expanded)
    }
    if (node.isBranch) {
      onSelect(node.key)
    }
  }

  return (
    <>
      <div
        className={`${styles.treeNode} ${isSelected ? styles.active : ""}`}
        style={{ paddingLeft: depth * 16 }}
        onClick={handleClick}
        onContextMenu={(event) => onContextMenu(event, node)}
        title={node.key}
      >
        {/* 展开/折叠箭头 */}
        <span className={`${styles.arrow} ${expanded && hasChildren ? styles.expanded : ""}`}>
          {hasChildren && <img src={arrowIcon} alt="arrow" />}
        </span>

        {/* 图标 */}
        <span className={styles.icon}>
          {hasChildren
            ? <img src={folderIcon} alt="folder" />
            : <img src={node.isCurrentBranch ? tagIcon : branchIcon} alt="branch" />}
        </span>

        {/* 名称 */}
        <span className={styles.label}>{node.label}</span>
      </div>

      {/* 子节点 */}
      {expanded && hasChildren && node.children!.map((child) => (
        <TreeItem
          key={child.key}
          node={child}
          depth={depth + 1}
          selectedKey={selectedKey}
          onSelect={onSelect}
          onContextMenu={onContextMenu}
        />
      ))}
    </>
  )
}

interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  node: TreeNode | null
}

const BranchList = () => {
  const { branchInfo, checkoutBranch } = useBranchStore()
  const { currentRepo } = useRepositoriesStore()
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    node: null,
  })

  const closeContextMenu = () => {
    setContextMenu((prev) => ({ ...prev, visible: false }))
  }

  const handleNodeContextMenu = (event: MouseEvent<HTMLDivElement>, node: TreeNode) => {
    event.preventDefault()
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      node,
    })
  }

  const handleCheckout = async () => {
    console.log("handleCheckout", contextMenu.node, currentRepo)
    if (!contextMenu.node?.isBranch || !currentRepo?.path) {
      closeContextMenu()
      return
    }

    await checkoutBranch(currentRepo.path, contextMenu.node.key)
    setSelectedKey(contextMenu.node.key)
    closeContextMenu()
  }

  useEffect(() => {
    const close = () => closeContextMenu()
    window.addEventListener("scroll", close, true)
    window.addEventListener("keydown", close)

    return () => {
      window.removeEventListener("scroll", close, true)
      window.removeEventListener("keydown", close)
    }
  }, [])

  const treeData: TreeNode[] = [
    {
      key: "__local__",
      label: "本地",
      children: buildTree(branchInfo.localBranches, branchInfo.currentBranch),
    },
    {
      key: "__remote__",
      label: "远程",
      children: buildTree(branchInfo.remoteBranches, null),
    },
  ]

  const contextMenuOptions: ToolbarOption[] = contextMenu.node
    ? [
      {
        type: "branch-tree-context-menu",
        label: "",
        items: contextMenu.node.isBranch
          ? [
            {
              id: "checkout-branch",
              label: "签出",
              action: () => {
                void handleCheckout()
              },
            },
          ]
          : [
            {
              id: "context-empty",
              label: "此处无任何内容",
              children: [],
            },
          ],
      },
    ]
    : []

  return (
    <div className={styles.container}>
      {treeData.map((node) => (
        <TreeItem
          key={node.key}
          node={node}
          depth={0}
          selectedKey={selectedKey}
          onSelect={setSelectedKey}
          onContextMenu={handleNodeContextMenu}
        />
      ))}
      {contextMenu.visible && contextMenu.node && (
        <Toolbar
          options={contextMenuOptions}
          contextMenuMode
          contextMenuVisible={contextMenu.visible}
          contextMenuPosition={{ x: contextMenu.x, y: contextMenu.y }}
          onContextMenuClose={closeContextMenu}
        />
      )}
    </div>
  )
}

export default BranchList
