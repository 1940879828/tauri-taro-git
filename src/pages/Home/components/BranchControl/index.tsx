import { useState } from "react"
import SplitPane from "@/components/SplitPane"
import BranchList from "@/pages/Home/components/BranchControl/components/BranchList"
import CommitDetail from "@/pages/Home/components/BranchControl/components/CommitDetail"
import CommitList from "@/pages/Home/components/BranchControl/components/CommitList"
import styles from "./index.module.css"
import BranchSidebar from "./components/BranchSidebar"

const BranchControl = () => {
  const [selectedBranchKey, setSelectedBranchKey] = useState<string | null>(null)
  const [createBranchSignal, setCreateBranchSignal] = useState(0)

  const onOptionClick = (key: string) => {
    if (key === "add" && selectedBranchKey) {
      setCreateBranchSignal((prev) => prev + 1)
    }
  }

  return (
    <div className={styles.container}>
      {/* 侧边栏 */}
      <BranchSidebar
        onOptionClick={onOptionClick}
        hasSelectedBranch={Boolean(selectedBranchKey)}
      />
      <SplitPane initialSizes={["20%", "40%"]}>
        {/* 分支列表 */}
        <BranchList
          selectedBranchKey={selectedBranchKey}
          onSelectedBranchKeyChange={setSelectedBranchKey}
          createBranchSignal={createBranchSignal}
        />
        {/* 提交列表 */}
        <CommitList />
        {/* 提交详情 */}
        <CommitDetail />
      </SplitPane>
    </div>
  )
}

export default BranchControl
