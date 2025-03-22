import applications from "@/applications";
import useAppDispatch from "@/hooks/useAppDispatch";
import {
  Application,
  ApplicationProps,
  closeApplication,
  setApplicationProps,
} from "@/store/applications";
import React, { createContext, useCallback, useMemo } from "react";
import { Rnd } from "react-rnd";

export interface WindowProps extends React.PropsWithChildren {
  application: Application;
}

export const WindowContext = createContext<{ applicationId: string }>({
  applicationId: "",
});

const TITLE_BAR_HEIGHT = 32;
const WINDOW_CONTENT_CLASSNAME = "awphos-window-content";

export default function Window({ application }: WindowProps) {
  const { applicationId, definitionId, props } = application;

  const contextValue = useMemo(() => ({ applicationId }), [applicationId]);
  const dispatch = useAppDispatch();

  const close = useCallback(
    () => dispatch(closeApplication(applicationId)),
    [applicationId]
  );

  const ContentComponent = useMemo(
    () => applications.getComponent(definitionId),
    [definitionId]
  );

  const setProps = useCallback(
    (props: Partial<ApplicationProps>) => {
      dispatch(
        setApplicationProps({
          applicationId,
          props,
        })
      );
    },
    [applicationId]
  );

  return (
    <Rnd
      size={props.size}
      position={props.topLeft}
      minHeight={TITLE_BAR_HEIGHT}
      onDragStop={(_, { x, y }) => setProps({ topLeft: { x, y } })}
      onResizeStop={(_e, _dir, ref, _delta, { x, y }) =>
        setProps({
          size: { width: ref.offsetWidth, height: ref.offsetHeight },
          topLeft: { x, y },
        })
      }
      cancel={`.${WINDOW_CONTENT_CLASSNAME}`}
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div
          className="bg-neutral-800 flex items-center select-none rounded-t-sm border-b border-neutral-600/50 px-2 py-0.5"
          style={{ minHeight: TITLE_BAR_HEIGHT }}
        >
          <p>{props.title}</p>
        </div>
        <div
          className={`flex-auto ${WINDOW_CONTENT_CLASSNAME}`}
          style={{ cursor: "initial" }}
        >
          <WindowContext.Provider value={contextValue}>
            <ContentComponent />
          </WindowContext.Provider>
        </div>
      </div>
    </Rnd>
  );
}
