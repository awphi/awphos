import type { Position, Rect } from "@/utils/positions";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { clamp, oncePerFrame, pointInRect } from "@/utils";
import { useWindowEvent } from "./useWindowEvent";

export interface UseDraggableArgs {
  handleRef?: RefObject<HTMLElement | null>;
  elementRef?: RefObject<HTMLElement | null>;
  disabled?: boolean;
  onDragMove?: (position: Position) => void;
  onDragEnd?: () => void;
  onDragStart?: (position: Position) => void;
  restrictToWindow?: boolean; // TODO could be more generic and support arbitrary rects via element ref
}

// prevent all pointer events on anything not explicitly set with pointer-events: auto while dragging
// this prevents focus loss when a drag ends outside a window
const DRAG_CLASS = "[&_*]:pointer-events-none";

export function useDraggable({
  handleRef,
  elementRef,
  disabled,
  onDragMove,
  onDragEnd,
  onDragStart,
  restrictToWindow,
}: UseDraggableArgs) {
  const [dragOffset, setDragOffset] = useState<Position | null>(null);
  const [dragged, setDragged] = useState(false);
  const throttledOnDragMove = useMemo(
    () => (onDragMove ? oncePerFrame(onDragMove) : undefined),
    [onDragMove]
  );

  const getDragPosition = useCallback(
    (event: PointerEvent, offset: Position) => {
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

      return {
        x: eventPos.x - offset.x,
        y: eventPos.y - offset.y,
      };
    },
    [dragOffset]
  );

  useWindowEvent(
    "pointermove",
    (event: PointerEvent) => {
      if (dragOffset) {
        setDragged(true);
        throttledOnDragMove?.(getDragPosition(event, dragOffset));
      }
    },
    [dragOffset, throttledOnDragMove, getDragPosition]
  );

  useWindowEvent(
    "pointerup",
    () => {
      if (dragged) {
        onDragEnd?.();
      }
      setDragOffset(null);
      setDragged(false);
      window.document.body.classList.remove(DRAG_CLASS);
    },
    [dragged, onDragEnd]
  );

  useEffect(() => {
    const el = elementRef?.current;
    const handle = handleRef ? handleRef.current : el;

    if (handle && !disabled) {
      const preventDefaultDrag = (e: DragEvent) => e.preventDefault();

      const startDrag = (event: PointerEvent) => {
        const rect = el?.getBoundingClientRect() ?? { left: 0, top: 0 };
        const dragOffset: Position = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };

        setDragOffset(dragOffset);
        onDragStart?.(getDragPosition(event, dragOffset));
        setDragged(false);
        window.document.body.classList.add(DRAG_CLASS);
      };

      handle.addEventListener("dragstart", preventDefaultDrag);
      handle.addEventListener("pointerdown", startDrag);

      return () => {
        handle.removeEventListener("dragstart", preventDefaultDrag);
        handle.removeEventListener("pointerdown", startDrag);
      };
    }
  }, [disabled, onDragStart]);

  return { dragging: dragOffset !== null };
}
