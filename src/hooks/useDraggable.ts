import type { Position, Rect } from "@/utils/positions";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { clamp, oncePerFrame, pointInRect } from "@/utils";
import { useWindowEvent } from "./useWindowEvent";

export interface UseDraggableArgs {
  handleRef?: RefObject<HTMLElement | null>;
  elementRef?: RefObject<HTMLElement | null>;
  disabled?: boolean;
  onDragMove?: (position: Position) => void;
  onDragEnd?: () => void;
  restrictToWindow?: boolean; // TODO could be more generic and support arbitrary rects via element ref
}

export function useDraggable({
  handleRef,
  elementRef,
  disabled,
  onDragMove,
  onDragEnd,
  restrictToWindow,
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
          const eventPos: Position = { x: event.clientX, y: event.clientY };

          if (restrictToWindow) {
            const windowRect: Rect = {
              x: 0,
              y: 0,
              width: window.innerWidth,
              height: window.innerHeight,
            };

            if (!pointInRect(eventPos, windowRect)) {
              eventPos.x = clamp(
                eventPos.x,
                windowRect.x,
                windowRect.x + windowRect.width
              );
              eventPos.y = clamp(
                eventPos.y,
                windowRect.y,
                windowRect.y + windowRect.height
              );
            }
          }

          throttledOnDragMove({
            x: eventPos.x - dragOffset.x,
            y: eventPos.y - dragOffset.y,
          });
        }
      }
    },
    [dragOffset, throttledOnDragMove, restrictToWindow]
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
    const el = elementRef?.current;
    const handle = handleRef ? handleRef.current : el;

    if (handle && !disabled) {
      const startDrag = (event: PointerEvent) => {
        const rect = el?.getBoundingClientRect() ?? { left: 0, top: 0 };
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
