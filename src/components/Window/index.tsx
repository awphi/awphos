import type { Application } from "@/store/applications";
import {
  type CSSProperties,
  type MouseEvent,
  type PropsWithChildren,
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { Rnd } from "react-rnd";
import WindowTitleBar from "./TitleBar";
import { WINDOW_CONTENT_CLASSNAME, WindowContext } from "./constants";
import useCurrentApplication from "@/hooks/useCurrentApplication";
import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/utils";

export interface WindowProps extends PropsWithChildren {
  application: Application;
}

function WindowContentWrapper({ children }: { children?: ReactNode }) {
  const {
    application: { props },
    setProps,
    focus,
    definition: { minSize, draggable, resizable, style: styleProp },
    zIndex,
  } = useCurrentApplication();
  const [interacting, setInteracting] = useState(false);

  const rndRef = useRef<Rnd>(null);

  const size = useMemo(() => {
    return props.maximized ? { width: "100%", height: "100%" } : props.size;
  }, [props.maximized, props.size]);

  const topLeft = useMemo(() => {
    return props.maximized ? { x: 0, y: 0 } : props.topLeft;
  }, [props.maximized, props.topLeft]);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      focus();
      e.stopPropagation();
    },
    [focus]
  );

  const className = useMemo(
    () =>
      cn({
        // use native CSS transitions for toggling maximized state
        "transition-all": !interacting,
        "pointer-events-none": props.minimized,
      }),
    [interacting, props.minimized]
  );

  const useRnd = resizable || draggable;

  const style = useMemo<CSSProperties>(
    () => ({
      cursor: "initial",
      zIndex,
      ...(!useRnd
        ? {
            minHeight: minSize.height,
            minWidth: minSize.width,
            width: size.width,
            height: size.height,
            position: "absolute",
            display: "inline-block",
            top: topLeft.y,
            left: topLeft.x,
          }
        : {}),
      ...styleProp,
    }),
    [zIndex]
  );

  if (!useRnd) {
    return (
      <div onClick={handleClick} className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <Rnd
      size={size}
      ref={rndRef}
      position={topLeft}
      minHeight={minSize.height}
      minWidth={minSize.width}
      onDragStart={() => {
        setInteracting(true);
      }}
      onDragStop={(_, { x, y }) => {
        setProps({ topLeft: { x, y } });
        setInteracting(false);
      }}
      onResizeStart={() => {
        setInteracting(true);
      }}
      onResizeStop={(_e, _dir, ref, _delta, { x, y }) => {
        setProps({
          size: { width: ref.offsetWidth, height: ref.offsetHeight },
          topLeft: { x, y },
        });
        setInteracting(false);
      }}
      disableDragging={props.maximized || !draggable}
      enableResizing={!props.maximized && resizable}
      cancel={`.${WINDOW_CONTENT_CLASSNAME}`}
      style={style}
      className={className}
      onClick={handleClick}
    >
      {children}
    </Rnd>
  );
}

function WindowContent() {
  const {
    application: { props, state },
    definition: { component: Component, showTitleBar, getAnimationProps },
    forceClose,
  } = useCurrentApplication();

  const animationProps = useMemo<HTMLMotionProps<"div">>(() => {
    const progress = props.minimized || state === "closing" ? 0 : 1;
    return {
      exit: { opacity: 0, scale: 0 },
      initial: { opacity: 0, scale: 0 },
      animate: { opacity: progress, scale: progress },
      ...getAnimationProps?.(progress),
      onAnimationComplete() {
        if (state === "closing") {
          forceClose();
        }
      },
    };
  }, [getAnimationProps, props.minimized, state]);

  return (
    <WindowContentWrapper>
      <motion.div
        transition={{ type: "spring", bounce: 0.2, duration: 0.2 }}
        {...animationProps}
        className={cn(
          "shadow-md flex flex-col h-full overflow-hidden",
          animationProps.className
        )}
      >
        {showTitleBar ? <WindowTitleBar /> : null}
        <div className={cn("flex-auto", WINDOW_CONTENT_CLASSNAME)}>
          <Component />
        </div>
      </motion.div>
    </WindowContentWrapper>
  );
}

export default function Window(props: WindowProps) {
  const { applicationId, state } = props.application;

  return (
    <WindowContext.Provider value={applicationId}>
      <WindowContent></WindowContent>
    </WindowContext.Provider>
  );
}
