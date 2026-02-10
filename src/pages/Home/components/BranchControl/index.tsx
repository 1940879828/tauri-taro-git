import SplitPane from "@/components/SplitPane"
import BranchList from "@/pages/Home/components/BranchControl/components/BranchList"
import CommitDetail from "@/pages/Home/components/BranchControl/components/CommitDetail"
import CommitList from "@/pages/Home/components/BranchControl/components/CommitList"
import styles from "./index.module.css"
import BranchSidebar from "./components/BranchSidebar"

const BranchControl = () => {
  const onOptionClick = (key: string) => {
    console.log(key)
  }

  return (
    <div className={styles.container}>
      {/* 侧边栏 */}
      <BranchSidebar onOptionClick={onOptionClick} />
      <SplitPane initialSizes={["20%", "40%"]}>
        {/* 分支列表 */}
        <BranchList />
        {/* 提交列表 */}
        <CommitList />
        {/* 提交详情 */}
        <CommitDetail />
      </SplitPane>
    </div>
  )
}

export default BranchControl
