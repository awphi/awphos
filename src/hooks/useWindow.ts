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

export function useWindow() {
  const { applicationId } = useContext(WindowContext);
  const application = useAppSelector(
    (state) => state.applications.applications[applicationId]
  );
  const { definitionId } = application;
  const dispatch = useAppDispatch();

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

  const focus = useCallback(() => {
    dispatch(focusApplication(applicationId));
  }, []);

  return {
    application,
    Component,
    close,
    setProps,
    setMaximized,
    setMinimized,
    focus,
  };
}
