import { Application } from "@/store/applications";
import React, { createContext, useMemo, useState } from "react";
import { Rnd } from "react-rnd";
import WindowTitleBar, { TITLE_BAR_HEIGHT } from "./TitleBar";
import { useWindow } from "@/hooks/useWindow";
import clsx from "clsx";

export interface WindowProps extends React.PropsWithChildren {
  application: Application;
}

export const WindowContext = createContext<{ applicationId: string }>({
  applicationId: "",
});

const WINDOW_CONTENT_CLASSNAME = "awphos-window-content";

function WindowContent() {
  const {
    application: { props },
    setProps,
    Component,
  } = useWindow();
  const [interacting, setInteracting] = useState(false);

  const size = useMemo(() => {
    return props.maximized ? { width: "100%", height: "100%" } : props.size;
  }, [props.maximized, props.size]);

  const topLeft = useMemo(() => {
    return props.maximized ? { x: 0, y: 0 } : props.topLeft;
  }, [props.maximized, props.topLeft]);

  return (
    <Rnd
      size={size}
      position={topLeft}
      minHeight={TITLE_BAR_HEIGHT}
      onDragStop={(_, { x, y }) => {
        setProps({ topLeft: { x, y } });
        setInteracting(false);
      }}
      onDragStart={() => {
        setInteracting(true);
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
      style={{ cursor: "initial" }}
      className={clsx({ "transition-all": !interacting })}
    >
      <div className="flex flex-col h-full overflow-hidden">
        <WindowTitleBar></WindowTitleBar>
        <div className={`flex-auto ${WINDOW_CONTENT_CLASSNAME}`}>
          <Component />
        </div>
      </div>
    </Rnd>
  );
}

export default function Window(props: WindowProps) {
  const { applicationId } = props.application;
  const contextValue = useMemo(() => ({ applicationId }), [applicationId]);

  return (
    <WindowContext.Provider value={contextValue}>
      <WindowContent></WindowContent>
    </WindowContext.Provider>
  );
}
