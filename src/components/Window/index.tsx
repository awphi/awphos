import type { Application } from "@/store/applications";
import {
  type MouseEvent,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
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

export interface WindowProps extends PropsWithChildren {
  application: Application;
}

// TODO re-add resizing - CSS resize property was a bit dodgy: weird animations, doesn't support bounding, broken w/ iframes in chrome
function WindowContent() {
  const {
    application: {
      props: { maximized, topLeft, size, minimized },
      state,
    },
    definition: {
      component: Component,
      showTitleBar,
      draggable,
      resizable,
      minSize,
      animatedProps,
      style: styleProp,
      className,
    },
    forceClose,
    focus,
    setProps,
    zIndex,
  } = useCurrentApplication();
  const dragHandleRef = useRef<HTMLDivElement | null>(null);
  const windowRef = useRef<HTMLDivElement | null>(null);

  const { dragging } = useDraggable({
    elementRef: windowRef,
    handleRef: dragHandleRef,
    disabled: !draggable || maximized,
    onDragMove: (position) =>
      setProps({
        topLeft: position,
      }),
    onDragEnd: () => {
      const maxY =
        window.innerHeight - TASK_BAR_HEIGHT - WINDOW_TITLE_BAR_HEIGHT;
      if (topLeft.y >= maxY) {
        setProps({ topLeft: { x: topLeft.x, y: maxY } });
        // window can lose focus here for some reason so quick hack to fix that:
        requestAnimationFrame(() => focus());
      }
    },
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
        ...renderedSize,
        // only animate position when not dragging
        ...(dragging ? undefined : renderedPosition),
      },
    };
  }, [
    renderedSize,
    renderedPosition,
    dragging,
    minimized,
    state,
    animatedProps,
  ]);

  const style = useMemo<HTMLMotionProps<"div">["style"]>(() => {
    return {
      ...renderedPosition,
      ...renderedSize,
      ...styleProp,
      minWidth: minSize.width,
      minHeight: minSize.height,
      zIndex,
    };
  }, [renderedPosition, renderedSize, styleProp, resizable, minSize, zIndex]);

  return (
    <motion.div
      onClick={(e) => e.stopPropagation()}
      onPointerDown={() => focus()}
      ref={windowRef}
      transition={{ type: "spring", bounce: 0.2, duration: 0.2 }}
      className={cn(
        "shadow-md flex flex-col overflow-hidden absolute",
        className
      )}
      style={style}
      onAnimationComplete={() => {
        if (state === "closing") {
          forceClose();
        }
      }}
      {...animationProps}
    >
      {showTitleBar ? <WindowTitleBar dragHandle={dragHandleRef} /> : null}
      <div
        className={cn("flex-auto", "overflow-auto", WINDOW_CONTENT_CLASSNAME, {
          "pointer-events-none": dragging,
        })}
      >
        <Component />
      </div>
    </motion.div>
  );
}

export default function Window(props: WindowProps) {
  const { applicationId } = props.application;

  return (
    <WindowContext.Provider value={applicationId}>
      <WindowContent></WindowContent>
    </WindowContext.Provider>
  );
}
