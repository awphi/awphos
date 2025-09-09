import applicationsRegistry from "@/applications";
import TaskBarIcon from "./Icon";
import { type MouseEvent, useCallback, useMemo, useState } from "react";
import useAppDispatch from "@/hooks/useAppDispatch";
import { openApplication, setApplicationProps } from "@/store/applications";
import { useFocus } from "@/hooks/useFocus";
import { cn } from "@/utils";

import { Popover, PopoverAnchor, PopoverContent } from "../Popover";
import { PopoverPortal } from "@radix-ui/react-popover";

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
  const [contextMenuOpen, setContextMenuOpen] = useState(false);

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
        setContextMenuOpen(true);
      }

      // prevent click being captured by parent which will focus(null)
      e.stopPropagation();
    },
    [definitionId, applicationIds, isSomeInstanceFocused, dispatch, focus]
  );

  return (
    <Popover open={contextMenuOpen} onOpenChange={setContextMenuOpen}>
      <PopoverAnchor>
        <TaskBarIcon
          onContextMenu={() => setContextMenuOpen(true)}
          onClick={handleClick}
          className={cn(
            {
              "bg-neutral-200/5": isSomeInstanceFocused,
            },
            "relative"
          )}
        >
          {isSomeInstanceFocused && applicationIds.length > 1 ? (
            <div className="absolute w-[91%] h-full bg-neutral-200/5 rounded-sm left-0 border-r border-neutral-200/5"></div>
          ) : null}
          <div
            title={def.name}
            className="h-full flex items-center justify-center relative"
            style={{ aspectRatio: "1.1 / 1" }}
          >
            <Icon />
            <div
              className={cn(
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
      </PopoverAnchor>
      <PopoverPortal>
        <PopoverContent
          side="top"
          sideOffset={10}
          className="mx-2 bg-neutral-800/70 backdrop-blur-lg"
        >
          TODO - animate motion div that slides up and list all open apps +
          supports opening a new one
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  );
}
