import "./App.css"
import { useRepositoriesStore } from "./stores/useRepositoriesStore"

function App() {
  const { openRepo } = useRepositoriesStore()

  const handleOpenRepo = async () => {
    console.log("handleOpenRepo")
    const info = await openRepo()
    if (info) {
      console.log(info)
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center w-full h-full bg-[#1e1e1e]">
      <div
        className="text-[14px] cursor-pointer text-[#bbb] bg-[#4c5052] w-fit px-3 py-1 border-[#5e6060] border rounded-[3px]"
        onClick={() => handleOpenRepo()}
      >
        打开仓库
      </div>
    </main>
  )
}

export default App
