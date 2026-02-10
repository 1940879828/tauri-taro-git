import { useState } from "react"
import { useBranchStore } from "@/stores/useBanchStore"
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
}

const TreeItem = ({ node, depth, selectedKey, onSelect }: TreeItemProps) => {
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
        />
      ))}
    </>
  )
}

const BranchList = () => {
  const { branchInfo } = useBranchStore()
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

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

  return (
    <div className={styles.container}>
      {treeData.map((node) => (
        <TreeItem
          key={node.key}
          node={node}
          depth={0}
          selectedKey={selectedKey}
          onSelect={setSelectedKey}
        />
      ))}
    </div>
  )
}

export default BranchList
