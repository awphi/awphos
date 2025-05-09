import type { Application } from "@/store/applications";
import {
  type MouseEvent,
  type PropsWithChildren,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { Rnd } from "react-rnd";
import WindowTitleBar from "./TitleBar";
import clsx from "clsx";
import { WINDOW_CONTENT_CLASSNAME, WindowContext } from "./constants";
import useCurrentApplication from "@/hooks/useCurrentApplication";
import { motion } from "motion/react";

export interface WindowProps extends PropsWithChildren {
  application: Application;
}

function WindowContent() {
  const {
    application: { props },
    setProps,
    focus,
    definition: {
      component: Component,
      showTitleBar = true,
      minSize = { width: 250, height: 100 },
    },
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

  const scaleAndOpacity = useMemo(() => {
    return props.minimized ? 0 : 1;
  }, [props.minimized]);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      focus();
      e.stopPropagation();
    },
    [focus]
  );

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
      disableDragging={props.maximized}
      enableResizing={!props.maximized}
      cancel={`.${WINDOW_CONTENT_CLASSNAME}`}
      style={{ cursor: "initial", zIndex }}
      className={clsx({
        // use native CSS transitions for toggling maximized state
        "transition-all": !interacting,
        "pointer-events-none": props.minimized,
      })}
      onClick={handleClick}
    >
      <motion.div
        exit={{ opacity: 0, scale: 0 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: scaleAndOpacity, scale: scaleAndOpacity }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.2 }}
        className="drop-shadow-sm flex flex-col h-full overflow-hidden"
      >
        {showTitleBar ? <WindowTitleBar /> : null}
        <div className={clsx("flex-auto", WINDOW_CONTENT_CLASSNAME)}>
          <Component />
        </div>
      </motion.div>
    </Rnd>
  );
}

export default function Window(props: WindowProps) {
  const { applicationId, state } = props.application;

  if (state !== "open") {
    return null;
  }

  return (
    <WindowContext.Provider value={applicationId}>
      <WindowContent></WindowContent>
    </WindowContext.Provider>
  );
}
