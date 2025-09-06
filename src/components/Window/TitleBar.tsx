import { X, Maximize2, Minimize2, Minus } from "lucide-react";
import { WINDOW_CONTENT_CLASSNAME, WINDOW_TITLE_BAR_HEIGHT } from "./constants";
import applicationsRegistry from "@/applications";
import useCurrentApplication from "@/hooks/useCurrentApplication";
import type { ComponentProps, RefObject } from "react";
import { cn } from "@/utils";

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
    application: { props, definitionId },
    setProps,
    close,
    isFocused,
  } = useCurrentApplication();
  const def = applicationsRegistry.definitions[definitionId];
  const Icon = def.icon;

  return (
    <div
      className={cn(
        "flex items-center select-none justify-between",
        isFocused ? "bg-neutral-800" : "bg-neutral-700"
      )}
      style={{
        height: WINDOW_TITLE_BAR_HEIGHT,
        minHeight: WINDOW_TITLE_BAR_HEIGHT,
      }}
    >
      <div
        ref={dragHandle}
        className="pl-2 flex-1 h-full flex gap-2 items-center"
      >
        <Icon width={16} height={16} />
        <p>{props.title}</p>
      </div>
      <div className="h-full flex">
        <WindowTitleBarButton
          onClick={(e) => {
            setProps({ minimized: true });
            e.stopPropagation();
          }}
        >
          <Minus width={18} />
        </WindowTitleBarButton>
        <WindowTitleBarButton
          onClick={() => setProps({ maximized: !props.maximized })}
        >
          {props.maximized ? (
            <Minimize2 width={16} />
          ) : (
            <Maximize2 width={16} />
          )}
        </WindowTitleBarButton>
        <WindowTitleBarButton className="hover:bg-red-500/75" onClick={close}>
          <X width={18} />
        </WindowTitleBarButton>
      </div>
    </div>
  );
}
