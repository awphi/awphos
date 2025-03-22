import useAppDispatch from "@/hooks/useAppDispatch";
import { closeApplication } from "@/store/applications";
import { useCallback } from "react";
import { WindowProps } from "..";
import clsx from "clsx";
import { X, Maximize2, Minus } from "lucide-react";

export const TITLE_BAR_HEIGHT = 32;

function WindowTitleBarButton(props: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={clsx(
        "h-full w-[42px] flex items-center justify-center hover:bg-neutral-500/75 transition-colors",
        props.className
      )}
    >
      {props.children}
    </button>
  );
}

export default function WindowTitleBar({ application }: WindowProps) {
  const { applicationId, props } = application;

  const dispatch = useAppDispatch();

  const close = useCallback(
    () => dispatch(closeApplication(applicationId)),
    [applicationId]
  );

  const maximize = useCallback(() => {
    // TODO
  }, []);
  const minimize = useCallback(() => {
    // TODO
  }, []);

  return (
    <div
      className="bg-neutral-800 flex items-center select-none pl-2 justify-between"
      style={{ minHeight: TITLE_BAR_HEIGHT }}
    >
      <p>{props.title}</p>
      <div className="h-full flex">
        <WindowTitleBarButton onClick={minimize}>
          <Minus width={18} />
        </WindowTitleBarButton>
        <WindowTitleBarButton onClick={maximize}>
          <Maximize2 width={16} />
        </WindowTitleBarButton>
        <WindowTitleBarButton className="hover:bg-red-500/75" onClick={close}>
          <X width={18} />
        </WindowTitleBarButton>
      </div>
    </div>
  );
}
