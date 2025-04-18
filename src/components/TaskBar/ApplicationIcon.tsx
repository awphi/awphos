import applicationsRegistry from "@/applications";
import TaskBarIcon from "./Icon";
import { type MouseEvent, useCallback, useMemo } from "react";
import useAppDispatch from "@/hooks/useAppDispatch";
import { openApplication, setApplicationProps } from "@/store/applications";
import { useFocus } from "@/hooks/useFocus";
import clsx from "clsx";

export interface TaskBarApplicationIconProps {
  definitionId: string;
  applicationIds: string[];
}

export default function TaskBarApplicationIcon({
  definitionId,
  applicationIds,
}: TaskBarApplicationIconProps) {
  const def = applicationsRegistry.definitions[definitionId];
  const Icon = def.icon;
  const dispatch = useAppDispatch();
  const { isFocused, focus } = useFocus();

  const isSomeInstanceFocused = useMemo(
    () => applicationIds.some(isFocused),
    [isFocused, applicationIds]
  );

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (applicationIds.length === 0) {
        dispatch(openApplication({ definitionId }));
      } else if (applicationIds.length === 1) {
        if (!isSomeInstanceFocused) {
          focus(applicationIds[0]);
        } else {
          dispatch(
            setApplicationProps({
              applicationId: applicationIds[0],
              props: { minimized: true },
            })
          );
        }
      } else {
        // TODO open context menu listing all active windows - clicking one will focus it
      }

      // prevent click being captured by parent which will focus(null)
      e.stopPropagation();
    },
    [definitionId, applicationIds, isSomeInstanceFocused]
  );

  // TODO right click context menu to close all or open a new instance of this application

  return (
    <TaskBarIcon
      onClick={handleClick}
      className={clsx(
        {
          "bg-neutral-200/5": isSomeInstanceFocused,
        },
        "relative"
      )}
    >
      {isSomeInstanceFocused && applicationIds.length > 1 ? (
        <div className="absolute  w-[91%] h-full bg-neutral-200/5 rounded-sm left-0 border-r border-neutral-200/5"></div>
      ) : null}
      <div
        title={def.name}
        className="h-full flex items-center justify-center relative"
        style={{ aspectRatio: "1.1 / 1" }}
      >
        <Icon />
        <div
          className={clsx(
            "absolute bottom-0.5 w-2 h-1 rounded-sm transition-all",
            isSomeInstanceFocused ? "bg-primary-400" : "bg-neutral-400",
            {
              "opacity-0": applicationIds.length === 0,
              "w-4": isSomeInstanceFocused,
            }
          )}
        ></div>
      </div>
    </TaskBarIcon>
  );
}
