import type { Application } from "@/store/applications";
import {
  type PropsWithChildren,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import WindowTitleBar from "./TitleBar";
import {
  WINDOW_CONTENT_CLASSNAME,
  WINDOW_TITLE_BAR_HEIGHT,
  WindowContext,
} from "./constants";
import useCurrentApplication from "@/hooks/useCurrentApplication";
import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/utils";
import { useDraggable } from "@/hooks/useDraggable";
import { TASK_BAR_HEIGHT } from "../TaskBar/constants";
import type { Position } from "@/utils/positions";
import WindowResizeHandles from "./ResizeHandles";

export interface WindowProps extends PropsWithChildren {
  application: Application;
}

// TODO re-add resizing - CSS resize property was a bit dodgy: weird animations, doesn't support bounding, broken w/ iframes in chrome
function Window() {
  const {
    application: {
      props: { maximized, topLeft, size, minimized },
      state,
      applicationId,
    },
    definition: {
      component: Component,
      showTitleBar,
      draggable,
      resizable,
      minSize,
      animatedProps,
      windowProps: {
        className: windowClassName,
        style: windowStyleProp,
        ...windowProps
      },
    },
    forceClose,
    focus,
    setProps,
    zIndex,
  } = useCurrentApplication();
  const dragHandleRef = useRef<HTMLDivElement | null>(null);
  const windowRef = useRef<HTMLDivElement | null>(null);

  const [resizing, setResizing] = useState(false);

  const onDragEnd = useCallback(() => {
    const maxY = window.innerHeight - TASK_BAR_HEIGHT - WINDOW_TITLE_BAR_HEIGHT;
    if (topLeft.y >= maxY) {
      setProps({ topLeft: { x: topLeft.x, y: maxY } });
      // window can lose focus here for some reason so quick hack to fix that:
      requestAnimationFrame(() => focus());
    }
  }, [topLeft, focus, setProps]);

  const onDragMove = useCallback(
    (topLeft: Position) => {
      setProps({
        topLeft,
      });
    },
    [setProps]
  );

  const { dragging } = useDraggable({
    elementRef: windowRef,
    handleRef: dragHandleRef,
    disabled: !draggable || maximized,
    restrictToWindow: true,
    onDragMove,
    onDragEnd,
  });

  const renderedPosition = useMemo(() => {
    return {
      translateX: maximized ? 0 : topLeft.x,
      translateY: maximized ? 0 : topLeft.y,
    };
  }, [maximized, topLeft]);

  const renderedSize = useMemo(() => {
    return {
      width: maximized ? "100%" : size.width,
      height: maximized ? "100%" : size.height,
    };
  }, [maximized, size]);

  const animationProps = useMemo<HTMLMotionProps<"div">>(() => {
    const progress = minimized || state === "closing" ? 0 : 1;
    const initialAndExit = Object.fromEntries(animatedProps.map((v) => [v, 0]));
    return {
      exit: initialAndExit,
      initial: initialAndExit,
      animate: {
        ...Object.fromEntries(animatedProps.map((v) => [v, progress])),
        ...(resizing ? undefined : renderedSize),
        // only animate position when not dragging
        ...(dragging || resizing ? undefined : renderedPosition),
      },
    };
  }, [
    renderedSize,
    renderedPosition,
    dragging,
    minimized,
    state,
    resizing,
    animatedProps,
  ]);

  const style = useMemo<HTMLMotionProps<"div">["style"]>(() => {
    return {
      ...renderedPosition,
      ...renderedSize,
      ...windowStyleProp,
      minWidth: minSize.width,
      minHeight: minSize.height,
      zIndex,
    };
  }, [renderedPosition, renderedSize, windowStyleProp, minSize, zIndex]);

  return (
    <motion.div
      data-role="window"
      data-application-id={applicationId}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={() => focus()}
      ref={windowRef}
      transition={{ type: "spring", bounce: 0.2, duration: 0.2 }}
      className={cn(
        "shadow-md flex flex-col absolute overflow-visible ",
        windowClassName
      )}
      style={style}
      onAnimationComplete={() => {
        if (state === "closing") {
          forceClose();
        }
      }}
      {...animationProps}
      {...windowProps}
    >
      {resizable ? (
        <WindowResizeHandles onResizeStateChange={setResizing} />
      ) : null}
      {showTitleBar ? <WindowTitleBar dragHandle={dragHandleRef} /> : null}
      <div
        className={cn(
          "flex-auto",
          "overflow-hidden",
          WINDOW_CONTENT_CLASSNAME,
          {
            "pointer-events-none": dragging || resizing,
            "rounded-b-md": !maximized,
          }
        )}
        data-role="window-content"
        data-application-id={applicationId}
      >
        <Component />
      </div>
    </motion.div>
  );
}

export default function WindowWrapper(props: WindowProps) {
  const { applicationId } = props.application;

  return (
    <WindowContext.Provider value={applicationId}>
      <Window />
    </WindowContext.Provider>
  );
}
