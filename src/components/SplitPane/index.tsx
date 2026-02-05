import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"

/**
 * SplitPane 组件 Props 定义
 */
interface SplitPaneProps {
  children: [React.ReactNode, React.ReactNode] // 必须传入2个子元素
  direction?: "horizontal" | "vertical" // 布局方向
  initialSize?: number | string // 初始大小 (px数字, "px"字符串, "%"字符串)
  minSize?: number // 最小尺寸 (px)
  splitterSize?: number // 可拖动区域的大小 (px)，默认 1px
}

const SplitPane: React.FC<SplitPaneProps> = ({
  children,
  direction = "horizontal",
  initialSize = "50%",
  minSize = 50,
  splitterSize = 10 // 虽然看起来是线，但为了易于拖拽，默认热区可以设大一点，比如10px，视觉上可以是透明的
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [paneSize, setPaneSize] = useState<string | number>(initialSize)
  const [isDragging, setIsDragging] = useState(false)

  // 布局方向相关的属性映射
  const isHorizontal = direction === "horizontal"
  const sizeProp = isHorizontal ? "width" : "height"
  const clientAxis = isHorizontal ? "clientX" : "clientY"
  const cursorStyle = isHorizontal ? "ew-resize" : "ns-resize"

  // 将传入的 size 转换为 CSS 可用的字符串
  const formatSize = (size: number | string) => {
    if (typeof size === "number") return `${size}px`
    return size
  }

  // 开始拖拽
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  // 拖拽逻辑 (绑定到 window 以防止鼠标移出区域失效)
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const containerSize = isHorizontal
        ? containerRect.width
        : containerRect.height
      const containerStart = isHorizontal
        ? containerRect.left
        : containerRect.top

      // 计算鼠标相对于容器的位置
      let newSizePx = e[clientAxis] - containerStart

      // 限制最小尺寸 (Pane 1)
      if (newSizePx < minSize) {
        newSizePx = minSize
      }

      // 限制最大尺寸 (Pane 2 也要保留 minSize)
      if (newSizePx > containerSize - minSize) {
        newSizePx = containerSize - minSize
      }

      // 如果初始单位是百分比，则转换回百分比，否则保持像素
      const isPercentage =
        typeof paneSize === "string" && paneSize.endsWith("%")

      if (isPercentage) {
        const newSizePercent = (newSizePx / containerSize) * 100
        setPaneSize(`${newSizePercent.toFixed(2)}%`)
      } else {
        setPaneSize(newSizePx)
      }
    },
    [isDragging, isHorizontal, minSize, paneSize, clientAxis]
  )

  // 停止拖拽
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // 全局事件监听
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      // 拖拽时禁用 body 的 user-select 防止文字反白
      document.body.style.userSelect = "none"
      document.body.style.cursor = cursorStyle
    } else {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
      document.body.style.userSelect = ""
      document.body.style.cursor = ""
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp, cursorStyle])

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: isHorizontal ? "row" : "column",
        width: "100%",
        height: "100%",
        position: "relative", // 为了让分割线 absolute 定位
        overflow: "hidden"
      }}
    >
      {/* 区域 1: 受控大小 */}
      <div
        style={{
          [sizeProp]: formatSize(paneSize),
          flexShrink: 0, // 防止被压缩
          overflow: "auto",
          position: "relative"
        }}
      >
        {children[0]}
      </div>

      {/* 分割线 (Splitter) - 覆盖层 */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: "absolute",
          zIndex: 1000, // 确保在最上层
          // 动态定位：让它跟随 Pane 1 的边缘
          [isHorizontal ? "left" : "top"]: formatSize(paneSize),
          // 尺寸设置
          [isHorizontal ? "width" : "height"]: `${splitterSize}px`,
          [isHorizontal ? "height" : "width"]: "100%",
          // 核心：通过 transform 居中对齐到分割线，使其不占位但能被点中
          transform: isHorizontal ? "translateX(-50%)" : "translateY(-50%)",
          cursor: cursorStyle,
          // 视觉上透明 (或者为了调试可以加背景色)
          backgroundColor: "transparent",
          // 如果你想看到一条细线作为视觉提示，可以取消下面这行的注释：
          // borderLeft: isHorizontal ? '1px solid rgba(0,0,0,0.1)' : 'none',
          // borderTop: !isHorizontal ? '1px solid rgba(0,0,0,0.1)' : 'none',
          touchAction: "none" // 优化触摸设备
        }}
      />

      {/* 区域 2: 自动填充剩余空间 */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          position: "relative"
        }}
      >
        {children[1]}
      </div>
    </div>
  )
}

export default SplitPane
