import applicationsRegistry from "@/applications";
import TaskBarIcon from "./Icon";
import { useCallback, useMemo } from "react";
import useAppDispatch from "@/hooks/useAppDispatch";
import { openApplication } from "@/store/applications";
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

  const handleClick = useCallback(() => {
    if (applicationIds.length === 0) {
      dispatch(openApplication(definitionId));
    } else if (applicationIds.length === 1) {
      if (!isSomeInstanceFocused) {
        focus(applicationIds[0]);
      }
    } else {
      // TODO open context menu listing all active windows - clicking one will focus it
    }
  }, [definitionId, applicationIds, isSomeInstanceFocused]);

  // TODO right click context menu to close all or open a new instance of this application

  // TODO add styling for window count > 1 - paged like effect
  return (
    <TaskBarIcon
      onClick={handleClick}
      key={definitionId}
      className={clsx({
        "bg-neutral-200/5": isSomeInstanceFocused,
      })}
    >
      <div
        title={def.name}
        className="h-full aspect-square flex items-center justify-center relative"
      >
        <Icon />
        <div
          className={clsx(
            "absolute bottom-0.5 w-2 h-1 rounded-sm transition-all",
            isSomeInstanceFocused ? "bg-purple-500" : "bg-neutral-400",
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
