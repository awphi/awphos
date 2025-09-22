import { X, Maximize2, Minimize2, Minus, MinusIcon, XIcon } from "lucide-react";
import { WINDOW_CONTENT_CLASSNAME, WINDOW_TITLE_BAR_HEIGHT } from "./constants";
import useCurrentApplication from "@/hooks/useCurrentApplication";
import {
  useCallback,
  type ComponentProps,
  type MouseEvent,
  type RefObject,
} from "react";
import { cn } from "@/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../ContextMenu";

function WindowTitleBarButton(props: ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={cn(
        "h-full w-[42px] flex items-center justify-center hover:bg-neutral-500/75 transition-colors",
        WINDOW_CONTENT_CLASSNAME,
        props.className
      )}
    >
      {props.children}
    </button>
  );
}

export interface WindowTitleBarProps {
  dragHandle?: RefObject<HTMLDivElement | null>;
}

export default function WindowTitleBar({ dragHandle }: WindowTitleBarProps) {
  const {
    application: {
      props: { title, maximized, minimizable, maximizable, minimized },
    },
    setProps,
    close,
    isFocused,
    definition: { icon: Icon },
  } = useCurrentApplication();

  const ToggleMaximizeIcon = maximized ? Minimize2 : Maximize2;

  const toggleMinimize = useCallback(
    (e?: PointerEvent | MouseEvent) => {
      if (minimizable) {
        setProps({ minimized: !minimized });
        e?.stopPropagation();
      }
    },
    [setProps, minimizable, minimized]
  );

  const toggleMaximize = useCallback(
    (e?: PointerEvent | MouseEvent) => {
      if (maximizable) {
        setProps({ maximized: !maximized });
        e?.stopPropagation();
      }
    },
    [maximizable, setProps, maximized]
  );

  return (
    <div
      className={cn(
        "flex items-center select-none justify-between",
        isFocused ? "bg-neutral-800" : "bg-neutral-700",
        { "rounded-t-md": !maximized }
      )}
      style={{
        height: WINDOW_TITLE_BAR_HEIGHT,
        minHeight: WINDOW_TITLE_BAR_HEIGHT,
      }}
      // prevent title bar ever receiving focus
      onPointerDown={(e) => e.preventDefault()}
    >
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            ref={dragHandle}
            onDoubleClick={toggleMaximize}
            className="pl-2 flex-1 h-full flex gap-2 items-center overflow-hidden"
          >
            <Icon className="min-w-fit" width={16} height={16} />
            <p className="overflow-ellipsis whitespace-nowrap overflow-hidden">
              {title}
            </p>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="bg-neutral-800/70 backdrop-blur-lg">
          {minimizable && (
            <ContextMenuItem onClick={toggleMinimize} disabled={minimized}>
              <MinusIcon />
              Minimize
            </ContextMenuItem>
          )}
          {maximizable && (
            <ContextMenuItem onClick={toggleMaximize}>
              <ToggleMaximizeIcon />
              {maximized ? "Restore" : "Maximize"}
            </ContextMenuItem>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem onClick={close}>
            <XIcon />
            Close
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <div className="h-full flex">
        {minimizable && (
          <WindowTitleBarButton onClick={toggleMinimize}>
            <Minus width={18} />
          </WindowTitleBarButton>
        )}
        {maximizable && (
          <WindowTitleBarButton onClick={toggleMaximize}>
            <ToggleMaximizeIcon width={16} />
          </WindowTitleBarButton>
        )}
        <WindowTitleBarButton
          className={cn("hover:bg-red-500/75", { "rounded-tr-md": !maximized })}
          onClick={close}
        >
          <X width={18} />
        </WindowTitleBarButton>
      </div>
    </div>
  );
}
