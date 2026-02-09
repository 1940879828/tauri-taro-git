import SplitPane from "@/components/SplitPane"
import BottomPanel from "@/pages/Home/components/BottomPanel"
import LeftSidebar from "@/pages/Home/components/LeftSidebar"
import RightEditor from "@/pages/Home/components/RightEditor"

const Home = () => {
  return (
    <div className="h-full">
      <SplitPane
        direction="vertical"
        initialSize="30%"
        minSize={100}
        splitterSize={10}
      >
        <SplitPane
          direction="horizontal"
          initialSize="30%"
          minSize={100}
          splitterSize={10}
        >
          <LeftSidebar />
          <RightEditor />
        </SplitPane>
        <BottomPanel />
      </SplitPane>
    </div>
  )
}

export default Home
