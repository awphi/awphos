import { useCallback, useContext, useMemo } from "react";
import useAppDispatch from "./useAppDispatch";
import useAppSelector from "./useAppSelector";
import applicationsRegistry from "@/applications";
import {
  ApplicationProps,
  closeApplication,
  setApplicationProps,
} from "@/store/applications";
import { useFocus } from "./useFocus";
import { WindowContext } from "@/components/Window/constants";

export function useWindow() {
  const { applicationId } = useContext(WindowContext);
  const application = useAppSelector(
    (state) => state.applications.applications[applicationId]
  );
  const { definitionId } = application;
  const dispatch = useAppDispatch();
  const { focus: focusApp, isFocused: isAppFocused, focusQueue } = useFocus();

  const Component = useMemo(
    () => applicationsRegistry.definitions[definitionId].component,
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

  const close = useCallback(
    () => dispatch(closeApplication(applicationId)),
    [applicationId]
  );

  const setMaximized = useCallback(
    (state: boolean) => setProps({ maximized: state }),
    [setProps]
  );

  const setMinimized = useCallback(
    (state: boolean) => setProps({ minimized: state }),
    [setProps]
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

  return {
    application,
    Component,
    close,
    setProps,
    setMaximized,
    setMinimized,
    focus,
    isFocused,
    zIndex,
  };
}
