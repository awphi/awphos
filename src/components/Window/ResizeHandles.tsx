import useCurrentApplication from "@/hooks/useCurrentApplication";
import { WINDOW_DRAG_HANDLE_SIZE } from "./constants";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { isNumericSize, stringToColor } from "@/utils";
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

  const cursor = useMemo<NonNullable<CSSProperties["cursor"]>>(() => {
    if (variant === "corner") {
      if (x === "left") {
        return y === "top" ? "nw-resize" : "sw-resize";
      } else {
        return y === "top" ? "ne-resize" : "se-resize";
      }
    }

    return variant === "vertical" ? "ew-resize" : "ns-resize";
  }, [variant, x, y]);

  const onDragStart = useCallback(
    (position: Position) => {
      setInitial({
        dragStart: position,
        size,
        topLeft,
      });
      onResizeStateChange?.(true);
      // TODO make cursor style sticky while dragging - need to set it all on elements, can be done with child selectors and some classes
    },
    [topLeft, size, onResizeStateChange]
  );

  const onDragMove = useCallback(
    (position: Position) => {
      // TODO support non-numeric sizes with calc()?
      if (
        initial === null ||
        !isNumericSize(initial.size) ||
        !isNumericSize(minSize)
      ) {
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

      const newWidth = initial.size.width + dx;
      const newHeight = initial.size.height + dy;

      setProps({
        size: {
          width: newWidth,
          height: newHeight,
        },
      });

      if (y === "top" || x === "left") {
        // TODO clamp this so once a minimum dimension is reached we don't move this window along that axis any further
        setProps({
          topLeft: {
            x: initial.topLeft.x - dx,
            y: initial.topLeft.x - dy,
          },
        });
      }
    },
    [initial, variant, minSize]
  );

  const onDragEnd = useCallback(() => {
    onResizeStateChange?.(false);
  }, [onResizeStateChange, cursor]);

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
      style={{
        cursor,
        pointerEvents: "all",
        position: "absolute",
        width: variant === "horizontal" ? "100%" : WINDOW_DRAG_HANDLE_SIZE,
        height: variant === "vertical" ? "100%" : WINDOW_DRAG_HANDLE_SIZE,
        ...(x ? { [x]: -WINDOW_DRAG_HANDLE_SIZE } : undefined),
        ...(y ? { [y]: -WINDOW_DRAG_HANDLE_SIZE } : undefined),
        backgroundColor: stringToColor(variant),
        zIndex: 10,
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
