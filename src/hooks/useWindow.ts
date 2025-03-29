import { useCallback, useContext, useMemo } from "react";
import useAppDispatch from "./useAppDispatch";
import { WindowContext } from "@/components/Window";
import useAppSelector from "./useAppSelector";
import applicationsRegistry from "@/applications";
import {
  ApplicationProps,
  closeApplication,
  focusApplication,
  setApplicationProps,
} from "@/store/applications";
import { useFocus } from "./useFocus";

export function useWindow() {
  const { applicationId } = useContext(WindowContext);
  const application = useAppSelector(
    (state) => state.applications.applications[applicationId]
  );
  const { definitionId } = application;
  const dispatch = useAppDispatch();
  const { focus: focusApp, isFocused: isAppFocused } = useFocus();

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

  const setMaximized = useCallback((state: boolean) => {
    setProps({ maximized: state });
  }, []);

  const setMinimized = useCallback((state: boolean) => {
    setProps({ minimized: state });
  }, []);

  const focus = useCallback(
    () => focusApp(applicationId),
    [applicationId, focusApp]
  );

  const isFocused = useMemo(
    () => isAppFocused(applicationId),
    [applicationId, isAppFocused]
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
  };
}
