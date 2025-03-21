import applications from "@/applications";
import useAppDispatch from "@/hooks/useAppDispatch";
import { Application, closeApplication } from "@/store/applications";
import { useDraggable } from "@dnd-kit/core";
import React, { createContext, useCallback, useMemo } from "react";

export interface WindowProps extends React.PropsWithChildren {
  application: Application;
}

export const WindowContext = createContext<{ applicationId: string }>({
  applicationId: "",
});

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

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: applicationId,
  });

  const style = useMemo(
    () => ({
      width: props.size.width,
      height: props.size.height,
      transform: transform
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined,
      left: props.topLeft.x,
      top: props.topLeft.y,
    }),
    [props, transform]
  );

  return (
    <div className="flex flex-col fixed overflow z-20" style={style}>
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className="bg-neutral-800 select-none rounded-t-sm border-b border-neutral-600/50 px-2 py-0.5"
      >
        <p>{props.title}</p>
      </div>
      <div>
        <WindowContext.Provider value={contextValue}>
          <ContentComponent />
        </WindowContext.Provider>
      </div>
    </div>
  );
}
