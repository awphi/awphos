import useCurrentApplication from "@/hooks/useCurrentApplication";
import { WINDOW_DRAG_HANDLE_SIZE } from "./constants";
import { useCallback, useMemo, useRef, useState } from "react";
import { cn, isNumericSize } from "@/utils";
import { useDraggable } from "@/hooks/useDraggable";
import type { CSSSize, Position } from "@/utils/positions";

interface WindowResizeHandleProps {
  variant: "vertical" | "horizontal" | "corner";
  x?: "left" | "right";
  y?: "top" | "bottom";
  onResizeStateChange?: (state: boolean) => void;
}

const HANDLES: WindowResizeHandleProps[] = [
  // edges
  { y: "top", variant: "horizontal" },
  { y: "bottom", variant: "horizontal" },
  { x: "left", variant: "vertical" },
  { x: "right", variant: "vertical" },

  // corners
  { y: "top", x: "left", variant: "corner" },
  { y: "top", x: "right", variant: "corner" },
  { y: "bottom", x: "left", variant: "corner" },
  { y: "bottom", x: "right", variant: "corner" },
];

function WindowResizeHandle({
  variant,
  x,
  y,
  onResizeStateChange,
}: WindowResizeHandleProps) {
  const {
    setProps,
    application: {
      props: { topLeft, size },
    },
    definition: { minSize },
  } = useCurrentApplication();
  const ref = useRef<HTMLDivElement>(null);
  const [initial, setInitial] = useState<{
    size: CSSSize;
    topLeft: Position;
    dragStart: Position;
  } | null>(null);

  const cursorClass = useMemo(() => {
    if (variant === "corner") {
      if (x === "left") {
        return y === "top" ? "cursor-nw-resize" : "cursor-sw-resize";
      } else {
        return y === "top" ? "cursor-ne-resize" : "cursor-se-resize";
      }
    }

    return variant === "vertical" ? "cursor-ew-resize" : "cursor-ns-resize";
  }, [variant, x, y]);

  const onDragStart = useCallback(
    (position: Position) => {
      setInitial({
        dragStart: position,
        size,
        topLeft,
      });
      onResizeStateChange?.(true);
      // only need to apply cursor class to body as everything else doesn't receive pointer events during drag
      window.document.body.classList.add(cursorClass);
    },
    [topLeft, size, cursorClass, onResizeStateChange]
  );

  const onDragMove = useCallback(
    (position: Position) => {
      if (initial === null) {
        return;
      }

      // TODO support non-numeric sizes with calc()?
      if (!isNumericSize(initial.size) || !isNumericSize(minSize)) {
        console.warn(
          "drag-to-resize is not supported on windows sized with non-numeric units (rem, vh, %, etc.)"
        );
        return;
      }

      let dx = variant === "horizontal" ? 0 : position.x - initial.dragStart.x;
      let dy = variant === "vertical" ? 0 : position.y - initial.dragStart.y;

      if (y === "top") {
        dy = -dy;
      }

      if (x === "left") {
        dx = -dx;
      }

      const clampedWidth = Math.max(minSize.width, initial.size.width + dx);
      const clampedHeight = Math.max(minSize.height, initial.size.height + dy);
      const appliedDx = clampedWidth - initial.size.width;
      const appliedDy = clampedHeight - initial.size.height;

      const update: any = {
        size: {
          width: clampedWidth,
          height: clampedHeight,
        },
      };

      if (y === "top" || x === "left") {
        update.topLeft = {
          x: x === "left" ? initial.topLeft.x - appliedDx : initial.topLeft.x,
          y: y === "top" ? initial.topLeft.y - appliedDy : initial.topLeft.y,
        };
      }

      setProps(update);
    },
    [initial, variant, minSize]
  );

  const onDragEnd = useCallback(() => {
    onResizeStateChange?.(false);
    setInitial(null);
    window.document.body.classList.remove(cursorClass); // asumes cursor hasn't changed between drag start and end
  }, [onResizeStateChange, cursorClass]);

  useDraggable({
    handleRef: ref,
    onDragMove,
    onDragStart,
    onDragEnd,
    restrictToWindow: true,
  });

  return (
    <div
      ref={ref}
      onPointerDown={(e) => e.preventDefault()}
      className={cn("pointer-events-auto absolute", cursorClass)}
      style={{
        width: variant === "horizontal" ? "100%" : WINDOW_DRAG_HANDLE_SIZE,
        height: variant === "vertical" ? "100%" : WINDOW_DRAG_HANDLE_SIZE,
        ...(x ? { [x]: -WINDOW_DRAG_HANDLE_SIZE } : undefined),
        ...(y ? { [y]: -WINDOW_DRAG_HANDLE_SIZE } : undefined),
        //backgroundColor: stringToColor(variant),
      }}
    ></div>
  );
}

export interface WindowResizeHandlesProps {
  onResizeStateChange?: WindowResizeHandleProps["onResizeStateChange"];
}

export default function WindowResizeHandles({
  onResizeStateChange,
}: WindowResizeHandlesProps) {
  return (
    <>
      {HANDLES.map((props) => (
        <WindowResizeHandle
          onResizeStateChange={onResizeStateChange}
          key={JSON.stringify(props)}
          {...props}
        />
      ))}
    </>
  );
}
