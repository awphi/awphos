import { useCallback, useMemo } from "react";
import useAppDispatch from "./useAppDispatch";
import useAppSelector from "./useAppSelector";
import {
  type ApplicationProps,
  startCloseApplication,
  setApplicationProps,
  finalizeCloseApplication,
  type Application,
} from "@/store/applications";
import { useFocus } from "./useFocus";
import { getApplicationDefinition } from "@/applications";

export const DUMMY_APPLICATION: Application = {
  applicationId: "dummy",
  definitionId: "dummy",
  parentId: null,
  props: {
    title: "",
    topLeft: {
      x: 0,
      y: 0,
    },
    size: {
      width: 0,
      height: 0,
    },
    maximized: false,
    minimized: false,
    maximizable: false,
    minimizable: false,
    minSize: {
      width: 0,
      height: 0,
    },
    draggable: false,
    resizable: false,
    showTitleBar: false,
    args: {},
  },
  state: "open",
};

export function useApplication(applicationId: string) {
  const application = useAppSelector(
    (state) =>
      state.applications.applications[applicationId] ?? DUMMY_APPLICATION
  );
  const dispatch = useAppDispatch();
  const { focus: focusApp, isFocused: isAppFocused, focusQueue } = useFocus();

  const definition = useMemo(
    () => getApplicationDefinition(application.definitionId),
    [application.definitionId]
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
    [applicationId, dispatch]
  );

  const close = useCallback(
    () => dispatch(startCloseApplication(applicationId)),
    [applicationId, dispatch]
  );

  const forceClose = useCallback(
    () => dispatch(finalizeCloseApplication(applicationId)),
    [applicationId, dispatch]
  );

  const focus = useCallback(
    () => focusApp(applicationId),
    [applicationId, focusApp]
  );

  const isFocused = useMemo(
    () => isAppFocused(applicationId),
    [applicationId, isAppFocused]
  );

  const zIndex = useMemo(
    () => focusQueue.indexOf(applicationId),
    [focusQueue, applicationId]
  );

  const isInsideWindowContent = useCallback(
    (tgt: EventTarget | null) => {
      if (tgt instanceof HTMLElement) {
        return (
          tgt.closest(
            `[data-role="window-content"][data-application-id="${applicationId}"]`
          ) !== null
        );
      }

      return false;
    },
    [applicationId]
  );

  return {
    application,
    definition,
    close,
    forceClose,
    setProps,
    focus,
    isFocused,
    zIndex,
    isInsideWindowContent,
  };
}
