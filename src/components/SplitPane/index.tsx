import type React from "react"
import { Children, useCallback, useEffect, useRef, useState } from "react"

/**
 * SplitPane 组件 Props 定义
 * 支持 2 个或多个子元素，每个子元素可设置初始大小
 */
interface SplitPaneProps {
  children: React.ReactNode
  direction?: "horizontal" | "vertical"
  /** 每个面板的初始大小（px 或 "%"），数组长度应与子元素数量一致，未指定的面板平均分配剩余空间 */
  initialSizes?: (number | string)[]
  minSize?: number
  splitterSize?: number
}

/** 将初始大小（可能是百分比或像素）解析为像素值 */
const parseSizeToPx = (size: number | string, containerSize: number): number => {
  if (typeof size === "number") return size
  if (size.endsWith("%")) return (parseFloat(size) / 100) * containerSize
  return parseFloat(size)
}

const SplitPane: React.FC<SplitPaneProps> = ({
  children,
  direction = "horizontal",
  initialSizes,
  minSize = 50,
  splitterSize = 10,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const childArray = Children.toArray(children)
  const childCount = childArray.length

  // 所有面板大小用像素管理，初始化时需要容器尺寸，先用 null 表示未初始化
  const [paneSizes, setPaneSizes] = useState<number[] | null>(null)
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  // 记录拖拽开始时的鼠标位置和面板尺寸快照
  const dragStartRef = useRef<{
    mousePos: number
    sizes: number[]
  } | null>(null)

  const isHorizontal = direction === "horizontal"
  const clientAxis = isHorizontal ? "clientX" : "clientY"
  const cursorStyle = isHorizontal ? "ew-resize" : "ns-resize"
  const sizeProp = isHorizontal ? "width" : "height"

  // 根据容器尺寸和 initialSizes 计算面板像素大小
  const calcInitialSizes = useCallback(
    (containerSize: number): number[] => {
      const sizes: number[] = []
      let assignedTotal = 0
      let unassignedCount = 0

      for (let i = 0; i < childCount; i++) {
        if (initialSizes && initialSizes[i] !== undefined) {
          const px = parseSizeToPx(initialSizes[i], containerSize)
          sizes.push(px)
          assignedTotal += px
        } else {
          sizes.push(-1)
          unassignedCount++
        }
      }

      const remaining = containerSize - assignedTotal
      const eachRemaining = unassignedCount > 0 ? remaining / unassignedCount : 0
      for (let i = 0; i < childCount; i++) {
        if (sizes[i] === -1) {
          sizes[i] = Math.max(eachRemaining, minSize)
        }
      }
      return sizes
    },
    [childCount, initialSizes, minSize]
  )

  // 初始化：根据容器实际尺寸计算每个面板的像素大小
  useEffect(() => {
    if (!containerRef.current || paneSizes !== null) return
    const containerRect = containerRef.current.getBoundingClientRect()
    const containerSize = isHorizontal ? containerRect.width : containerRect.height
    setPaneSizes(calcInitialSizes(containerSize))
  }, [isHorizontal, paneSizes, calcInitialSizes])

  // 监听容器尺寸变化，按比例重新分配面板大小
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newContainerSize = isHorizontal
          ? entry.contentRect.width
          : entry.contentRect.height

        setPaneSizes((prev) => {
          if (!prev || newContainerSize <= 0) return prev
          const oldTotal = prev.reduce((sum, s) => sum + s, 0)
          if (oldTotal <= 0) return prev

          // 按比例缩放各面板
          const scale = newContainerSize / oldTotal
          const newSizes = prev.map((s) => Math.max(s * scale, minSize))

          // 修正误差，确保总和等于容器大小
          const newTotal = newSizes.reduce((sum, s) => sum + s, 0)
          if (newTotal !== newContainerSize && newSizes.length > 0) {
            newSizes[newSizes.length - 1] += newContainerSize - newTotal
          }

          return newSizes
        })
      }
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [isHorizontal, minSize])

  // 开始拖拽
  const handleMouseDown = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    if (!paneSizes) return
    setDraggingIndex(index)
    const pos = isHorizontal ? e.clientX : e.clientY
    dragStartRef.current = {
      mousePos: pos,
      sizes: [...paneSizes],
    }
  }

  // 拖拽逻辑：只调整分割线两侧的面板，差值互补
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (draggingIndex === null || !dragStartRef.current || !paneSizes) return

      const { mousePos: startPos, sizes: startSizes } = dragStartRef.current
      const currentPos = e[clientAxis]
      const delta = currentPos - startPos

      const leftIndex = draggingIndex
      const rightIndex = draggingIndex + 1

      let newLeft = startSizes[leftIndex] + delta
      let newRight = startSizes[rightIndex] - delta

      // 限制最小尺寸
      if (newLeft < minSize) {
        newLeft = minSize
        newRight = startSizes[leftIndex] + startSizes[rightIndex] - minSize
      }
      if (newRight < minSize) {
        newRight = minSize
        newLeft = startSizes[leftIndex] + startSizes[rightIndex] - minSize
      }

      setPaneSizes((prev) => {
        if (!prev) return prev
        const next = [...prev]
        next[leftIndex] = newLeft
        next[rightIndex] = newRight
        return next
      })
    },
    [draggingIndex, paneSizes, minSize, clientAxis]
  )

  const handleMouseUp = useCallback(() => {
    setDraggingIndex(null)
    dragStartRef.current = null
  }, [])

  // 全局事件监听
  useEffect(() => {
    if (draggingIndex !== null) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
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
  }, [draggingIndex, handleMouseMove, handleMouseUp, cursorStyle])

  // 计算分割线位置：累加前面面板的像素值
  const getSplitterPosition = (index: number): number => {
    if (!paneSizes) return 0
    let pos = 0
    for (let i = 0; i <= index; i++) {
      pos += paneSizes[i]
    }
    return pos
  }

  // 未初始化时用 initialSizes 做 SSR/首帧渲染
  if (!paneSizes) {
    return (
      <div
        ref={containerRef}
        style={{
          display: "flex",
          flexDirection: isHorizontal ? "row" : "column",
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {childArray.map((child, index) => {
          const hasInitial = initialSizes && initialSizes[index] !== undefined
          const sizeValue = hasInitial
            ? typeof initialSizes![index] === "number"
              ? `${initialSizes![index]}px`
              : initialSizes![index]
            : undefined

          return (
            <div
              key={index}
              style={{
                ...(hasInitial
                  ? { [sizeProp]: sizeValue, flexShrink: 0 }
                  : { flex: 1 }),
                overflow: "auto",
                position: "relative",
              }}
            >
              {child}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: isHorizontal ? "row" : "column",
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {childArray.map((child, index) => (
        <div
          key={index}
          style={{
            [sizeProp]: `${paneSizes[index]}px`,
            flexShrink: 0,
            overflow: "auto",
            position: "relative",
          }}
        >
          {child}
        </div>
      ))}

      {/* 分割线：在第 i 个和第 i+1 个面板之间 */}
      {Array.from({ length: childCount - 1 }, (_, index) => (
        <div
          key={`splitter-${index}`}
          onMouseDown={handleMouseDown(index)}
          style={{
            position: "absolute",
            zIndex: 1000,
            [isHorizontal ? "left" : "top"]: `${getSplitterPosition(index)}px`,
            [isHorizontal ? "width" : "height"]: `${splitterSize}px`,
            [isHorizontal ? "height" : "width"]: "100%",
            transform: isHorizontal ? "translateX(-50%)" : "translateY(-50%)",
            cursor: cursorStyle,
            backgroundColor: "transparent",
            touchAction: "none",
          }}
        />
      ))}
    </div>
  )
}

export default SplitPane
