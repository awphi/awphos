import type { Position } from "@/utils/positions";
import { useEffect, useRef, useState, type RefObject } from "react";
import { oncePerFrame } from "@/utils";

export interface UseDraggableArgs {
  handleRef?: RefObject<HTMLElement | null>;
  elementRef: RefObject<HTMLElement | null>;
  disabled?: boolean;
  onDragMove?: (position: Position) => void;
  onDragEnd?: () => void;
}

export function useDraggable({
  handleRef,
  elementRef,
  disabled,
  onDragMove: _onDragMove,
  onDragEnd: _onDragEnd,
}: UseDraggableArgs) {
  const [dragging, setDragging] = useState(false);
  const onDragMove = useRef<(position: Position) => void>(null);
  const onDragEnd = useRef<() => void>(null);

  onDragMove.current = _onDragMove ?? null;
  onDragEnd.current = _onDragEnd ?? null;

  useEffect(() => {
    if (disabled) {
      return;
    }

    console.log("registering drag handlers");

    const el = elementRef.current;
    const handle = handleRef ? handleRef.current : el;
    const throttledOnDragMove = onDragMove.current
      ? oncePerFrame(onDragMove.current)
      : null;

    if (handle && el) {
      let dragOffset: Position | null = null; // represents if a drag has started
      let dragged = false; // represents if a drag move has actually happened

      const startDrag = (event: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        // grab the bounds at the start of the drag
        dragOffset = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
        dragged = false;
        setDragging(true);
      };

      const endDrag = () => {
        if (dragged) {
          onDragEnd.current?.();
        }
        dragOffset = null;
        dragged = false;
        setDragging(false);
      };

      const moveDrag = (event: PointerEvent) => {
        if (dragOffset) {
          dragged = true;
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
  }, [disabled, onDragMove, onDragEnd]);

  return { dragging };
}
