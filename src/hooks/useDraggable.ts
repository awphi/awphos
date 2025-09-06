import type { Position } from "@/utils/positions";
import { useEffect, useMemo, useState, type RefObject } from "react";
import { throttle } from "@/utils";

export interface UseDraggableArgs {
  handleRef?: RefObject<HTMLElement | null>;
  elementRef: RefObject<HTMLElement | null>;
  disabled?: boolean;
  onDragMove?: (position: Position) => void;
  throttleRate?: number; // ms
}

// TODO support taking in a bounding rect
export function useDraggable({
  handleRef,
  elementRef,
  disabled,
  onDragMove,
  throttleRate,
}: UseDraggableArgs) {
  const [dragging, setDragging] = useState(false);

  const throttledOnDragMove = useMemo(() => {
    return throttle(onDragMove, throttleRate);
  }, [onDragMove, throttleRate]);

  useEffect(() => {
    if (disabled) {
      return;
    }

    const el = elementRef.current;
    const handle = handleRef ? handleRef.current : el;

    if (handle && el) {
      let dragOffset: Position | null = null;

      const startDrag = (event: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        dragOffset = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
        setDragging(true);
      };

      const endDrag = () => {
        dragOffset = null;
        setDragging(false);
      };

      const moveDrag = (event: PointerEvent) => {
        if (dragOffset && throttledOnDragMove) {
          const pos: Position = {
            x: event.clientX - dragOffset.x,
            y: event.clientY - dragOffset.y,
          };
          throttledOnDragMove(pos);
        }
      };

      handle.addEventListener("pointerdown", startDrag);
      window.addEventListener("pointerup", endDrag);
      window.addEventListener("pointermove", moveDrag);

      return () => {
        handle.removeEventListener("pointerdown", startDrag);
        window.removeEventListener("pointerup", endDrag);
        window.removeEventListener("pointermove", moveDrag);
      };
    }
  }, [disabled, throttledOnDragMove]);

  return { dragging };
}
