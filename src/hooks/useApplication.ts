import { useCallback, useEffect, useMemo } from "react";
import useAppDispatch from "./useAppDispatch";
import useAppSelector from "./useAppSelector";
import applicationsRegistry from "@/applications";
import {
  type Application,
  type ApplicationProps,
  startCloseApplication,
  setApplicationProps,
  finalizeCloseApplication,
} from "@/store/applications";
import { useFocus } from "./useFocus";
import { useIsPresent } from "motion/react";

export function useApplication(applicationId: string) {
  const application = useAppSelector(
    (state) => state.applications.applications[applicationId]
  );
  const dispatch = useAppDispatch();
  const isPresent = useIsPresent();
  const { focus: focusApp, isFocused: isAppFocused, focusQueue } = useFocus();

  // Ensure the application is removed from the store once its exit animation is complete
  useEffect(() => {
    if (!isPresent && application.state === "closing") {
      const cleanup = window.setTimeout(() => {
        dispatch(finalizeCloseApplication(applicationId));
      }, 1000);
      return () => {
        window.clearTimeout(cleanup);
      };
    }
  }, [isPresent]);

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
    setProps,
    focus,
    isFocused,
    zIndex,
  };
}
