import useCurrentApplication from "@/hooks/useCurrentApplication";
import { WINDOW_DRAG_HANDLE_SIZE } from "./constants";
import { useMemo, useRef, type CSSProperties } from "react";
import { stringToColor } from "@/utils";
import { useDraggable } from "@/hooks/useDraggable";

interface WindowResizeHandleProps {
  variant: "vertical" | "horizontal" | "corner";
  x?: "left" | "right";
  y?: "top" | "bottom";
}

function WindowResizeHandle({ variant, x, y }: WindowResizeHandleProps) {
  const { setProps } = useCurrentApplication();
  const ref = useRef<HTMLDivElement>(null);

  const cursor = useMemo<CSSProperties["cursor"]>(() => {
    if (variant === "corner") {
      if (x === "left") {
        return y === "top" ? "nw-resize" : "sw-resize";
      } else {
        return y === "top" ? "ne-resize" : "se-resize";
      }
    }

    return variant === "vertical" ? "ew-resize" : "ns-resize";
  }, [variant, x, y]);

  // TODO probably need a delta from drag move event + store initial width/height/pos on drag start and update as needed
  useDraggable({
    handleRef: ref,
    onDragMove: console.log,
  });

  return (
    <div
      ref={ref}
      style={{
        cursor,
        position: "absolute",
        width: variant === "horizontal" ? "100%" : WINDOW_DRAG_HANDLE_SIZE,
        height: variant === "vertical" ? "100%" : WINDOW_DRAG_HANDLE_SIZE,
        ...(x ? { [x]: -WINDOW_DRAG_HANDLE_SIZE } : undefined),
        ...(y ? { [y]: -WINDOW_DRAG_HANDLE_SIZE } : undefined),
        backgroundColor: stringToColor(variant),
        zIndex: 10,
      }}
      onDragStart={(e) => e.preventDefault()}
    ></div>
  );
}

export default function WindowResizeHandles() {
  return (
    <>
      {/* edges */}
      <WindowResizeHandle y="top" variant="horizontal" />
      <WindowResizeHandle y="bottom" variant="horizontal" />
      <WindowResizeHandle x="left" variant="vertical" />
      <WindowResizeHandle x="right" variant="vertical" />

      {/* corners */}
      <WindowResizeHandle y="top" x="left" variant="corner" />
      <WindowResizeHandle y="top" x="right" variant="corner" />
      <WindowResizeHandle y="bottom" x="left" variant="corner" />
      <WindowResizeHandle y="bottom" x="right" variant="corner" />
    </>
  );
}
