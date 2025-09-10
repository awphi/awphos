import { getApplicationDefinition } from "@/applications";
import TaskBarIcon from "@/components/TaskBar/Icon";
import {
  type ComponentProps,
  type MouseEvent,
  useCallback,
  useMemo,
  useState,
} from "react";
import useAppDispatch from "@/hooks/useAppDispatch";
import {
  focusApplication,
  openApplication,
  setApplicationProps,
  startCloseApplication,
} from "@/store/applications";
import { useFocus } from "@/hooks/useFocus";
import { cn } from "@/utils";

import { Popover, PopoverAnchor, PopoverContent } from "@/components/Popover";
import { motion, AnimatePresence } from "motion/react";
import {
  ContextMenuApplicationButton,
  ContextMenuButton,
} from "./ContextMenuButton";
import { XIcon } from "lucide-react";

export interface TaskBarApplicationIconProps {
  definitionId: string;
  applicationIds: string[];
}

function ContextMenuHeader({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      className={cn(
        "text-xs text-neutral-300/50 px-2 py-1  select-none",
        className
      )}
    ></span>
  );
}

export default function TaskBarApplicationIcon({
  definitionId,
  applicationIds,
}: TaskBarApplicationIconProps) {
  const def = getApplicationDefinition(definitionId);
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
      <AnimatePresence>
        {contextMenuOpen && (
          <PopoverContent
            onClick={(e) => {
              setContextMenuOpen(false);
              e.stopPropagation();
            }}
            side="top"
            className="mx-2 bg-neutral-800/70 backdrop-blur-lg pt-2"
            sideOffset={10}
            asChild
            forceMountPortal
          >
            <motion.div
              className="flex flex-col gap-1"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0 }}
            >
              {applicationIds.length > 0 && (
                <>
                  <ContextMenuHeader>Active windows</ContextMenuHeader>
                  {applicationIds.map((id) => (
                    <ContextMenuApplicationButton
                      onClick={() => dispatch(focusApplication(id))}
                      key={id}
                      applicationId={id}
                    />
                  ))}
                </>
              )}
              <ContextMenuHeader>Actions</ContextMenuHeader>
              <ContextMenuButton
                icon={def.icon}
                label={`Open new "${def.name}"`}
                onClick={() => dispatch(openApplication({ definitionId }))}
              />
              {applicationIds.length > 0 && (
                <ContextMenuButton
                  onClick={() => {
                    for (const id of applicationIds) {
                      dispatch(startCloseApplication(id));
                    }
                  }}
                  icon={XIcon}
                  label={
                    applicationIds.length > 1
                      ? "Close all windows"
                      : "Close window"
                  }
                />
              )}
            </motion.div>
          </PopoverContent>
        )}
      </AnimatePresence>
    </Popover>
  );
}
