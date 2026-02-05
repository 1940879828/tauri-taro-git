import SplitPane from "@/components/SplitPane"

const Home = () => {
  return (
    <div className="h-full">
        <SplitPane
          direction="vertical"
          initialSize="30%"
          minSize={100}
          splitterSize={10} // 实际上有一条10px宽的隐形区域可以拖动
        >
          {/* 左侧/上方区域 */}
          <div
            style={{ background: "#3c3f41", height: "100%", padding: "20px" }}
          >
            <h2>Pane A</h2>
            <p>This pane has a controlled size.</p>
          </div>

          {/* 右侧/下方区域 */}
          <div
            style={{ background: "#1e1e1e", color: 'lightblue', height: "100%", padding: "20px" }}
          >
            <h2>Pane B</h2>
            <p>This pane fills the rest.</p>
          </div>
        </SplitPane>
    </div>
  )
}

export default Home
