import { X, Maximize2, Minimize2, Minus } from "lucide-react";
import { WINDOW_CONTENT_CLASSNAME, WINDOW_TITLE_BAR_HEIGHT } from "./constants";
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
    application: {
      props: { title, maximized, minimizable, maximizable },
    },
    setProps,
    close,
    isFocused,
    definition: { icon: Icon },
  } = useCurrentApplication();

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
      <div
        ref={dragHandle}
        onDoubleClick={() => {
          if (maximizable) {
            setProps({ maximized: !maximized });
          }
        }}
        className="pl-2 flex-1 h-full flex gap-2 items-center overflow-hidden"
      >
        <Icon className="min-w-fit" width={16} height={16} />
        <p className="overflow-ellipsis whitespace-nowrap overflow-hidden">
          {title}
        </p>
      </div>
      <div className="h-full flex">
        {minimizable && (
          <WindowTitleBarButton
            onClick={(e) => {
              setProps({ minimized: true });
              e.stopPropagation();
            }}
          >
            <Minus width={18} />
          </WindowTitleBarButton>
        )}
        {maximizable && (
          <WindowTitleBarButton
            onClick={(e) => {
              setProps({ maximized: !maximized });
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            {maximized ? <Minimize2 width={16} /> : <Maximize2 width={16} />}
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
