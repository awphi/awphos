import { useCallback, useMemo } from "react";
import useAppDispatch from "./useAppDispatch";
import useAppSelector from "./useAppSelector";
import applicationsRegistry from "@/applications";
import {
  type ApplicationProps,
  startCloseApplication,
  setApplicationProps,
  finalizeCloseApplication,
} from "@/store/applications";
import { useFocus } from "./useFocus";

export function useApplication(applicationId: string) {
  const application = useAppSelector(
    (state) => state.applications.applications[applicationId]
  );
  const dispatch = useAppDispatch();
  const { focus: focusApp, isFocused: isAppFocused, focusQueue } = useFocus();

  const definition = useMemo(
    () => applicationsRegistry.definitions[application.definitionId],
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
    [applicationId]
  );

  const close = useCallback(
    () => dispatch(startCloseApplication(applicationId)),
    [applicationId]
  );

  const forceClose = useCallback(
    () => dispatch(finalizeCloseApplication(applicationId)),
    [applicationId]
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
    definition,
    close,
    forceClose,
    setProps,
    focus,
    isFocused,
    zIndex,
  };
}
