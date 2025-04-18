import { useCallback, useMemo } from "react";
import useAppDispatch from "./useAppDispatch";
import useAppSelector from "./useAppSelector";
import applicationsRegistry from "@/applications";
import {
  type Application,
  type ApplicationProps,
  closeApplication,
  setApplicationProps,
} from "@/store/applications";
import { useFocus } from "./useFocus";

const nullApplication: Application = Object.freeze({
  definitionId: "",
  applicationId: "",
  props: {
    title: "",
    minimized: false,
    maximized: false,
    size: { width: 0, height: 0 },
    topLeft: { x: -1, y: -1 },
  },
  args: {},
});

export function useApplication(applicationId: string) {
  const application = useAppSelector(
    (state) => state.applications.applications[applicationId] ?? nullApplication
  );
  const { definitionId } = application;
  const dispatch = useAppDispatch();
  const { focus: focusApp, isFocused: isAppFocused, focusQueue } = useFocus();

  const definition = useMemo(
    () => applicationsRegistry.definitions[definitionId],
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
