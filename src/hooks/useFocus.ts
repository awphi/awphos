import { focusApplication } from "@/store/applications";
import { useCallback } from "react";
import useAppDispatch from "./useAppDispatch";
import useAppSelector from "./useAppSelector";

export function useFocus() {
  const dispatch = useAppDispatch();
  const focusQueue = useAppSelector((state) => state.applications.focusQueue);

  const isFocused = useCallback(
    (applicationId: string | null) => {
      const length = focusQueue.length;
      if (length > 0) {
        return focusQueue[length - 1] === applicationId;
      }

      return false;
    },
    [focusQueue]
  );

  const focus = useCallback(
    (applicationId: string | null) => {
      if (!isFocused(applicationId)) {
        dispatch(focusApplication(applicationId));
      }
    },
    [isFocused]
  );

  return {
    focus,
    isFocused,
    focusQueue,
  };
}
