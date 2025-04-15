import clsx from "clsx";
import { X, Maximize2, Minimize2, Minus } from "lucide-react";
import { useWindow } from "@/hooks/useWindow";
import { TITLE_BAR_HEIGHT, WINDOW_CONTENT_CLASSNAME } from "./constants";
import applicationsRegistry from "@/applications";

function WindowTitleBarButton(props: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={clsx(
        "h-full w-[42px] flex items-center justify-center hover:bg-neutral-500/75 transition-colors",
        WINDOW_CONTENT_CLASSNAME,
        props.className
      )}
    >
      {props.children}
    </button>
  );
}

export default function WindowTitleBar() {
  const {
    application: { props, definitionId },
    setMinimized,
    close,
    setMaximized,
    isFocused,
  } = useWindow();
  const def = applicationsRegistry.definitions[definitionId];
  const Icon = def.icon;

  return (
    <div
      className={clsx(
        "flex items-center select-none pl-2 justify-between",
        isFocused ? "bg-neutral-800" : "bg-neutral-700"
      )}
      style={{ minHeight: TITLE_BAR_HEIGHT }}
    >
      <div className="flex gap-2 items-center">
        <Icon width={16} height={16} />
        <p>{props.title}</p>
      </div>
      <div className="h-full flex">
        <WindowTitleBarButton
          onClick={(e) => {
            setMinimized(true);
            e.stopPropagation();
          }}
        >
          <Minus width={18} />
        </WindowTitleBarButton>
        <WindowTitleBarButton onClick={() => setMaximized(!props.maximized)}>
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
