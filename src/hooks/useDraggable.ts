import type { Position } from "@/utils/positions";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { oncePerFrame } from "@/utils";
import { useWindowEvent } from "./useWindowEvent";

export interface UseDraggableArgs {
  handleRef?: RefObject<HTMLElement | null>;
  elementRef: RefObject<HTMLElement | null>;
  disabled?: boolean;
  onDragMove?: (position: Position) => void;
  onDragEnd?: () => void;
  restrictToWindow?: boolean;
}

export function useDraggable({
  handleRef,
  elementRef,
  disabled,
  onDragMove,
  onDragEnd,
}: UseDraggableArgs) {
  const [dragOffset, setDragOffset] = useState<Position | null>(null);
  const [dragged, setDragged] = useState(false);
  const throttledOnDragMove = useMemo(
    () => (onDragMove ? oncePerFrame(onDragMove) : undefined),
    [onDragMove]
  );

  useWindowEvent(
    "pointermove",
    (event: PointerEvent) => {
      if (dragOffset) {
        setDragged(true);
        if (throttledOnDragMove) {
          const pos: Position = {
            x: event.clientX - dragOffset.x,
            y: event.clientY - dragOffset.y,
          };

          // TODO don't call handler if drag is outside the viewport
          // TODO (bonus) keep last position so we can find the exact event that went outside the viewport and clamp
          throttledOnDragMove(pos);
        }
      }
    },
    [dragOffset, throttledOnDragMove]
  );

  useWindowEvent(
    "pointerup",
    () => {
      if (dragged) {
        onDragEnd?.();
      }
      setDragOffset(null);
      setDragged(false);
    },
    [dragged, onDragEnd]
  );

  useEffect(() => {
    const el = elementRef.current;
    const handle = handleRef ? handleRef.current : el;

    if (handle && el && !disabled) {
      const startDrag = (event: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        setDragOffset({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
        setDragged(false);
      };

      handle.addEventListener("pointerdown", startDrag);

      return () => {
        handle.removeEventListener("pointerdown", startDrag);
      };
    }
  }, [disabled]);

  return { dragging: dragOffset !== null };
}
