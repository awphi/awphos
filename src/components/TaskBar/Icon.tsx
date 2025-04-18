import clsx from "clsx";
import type { ComponentProps } from "react";

export interface TaskBarIconProps extends ComponentProps<"button"> {}

export default function TaskBarIcon(props: TaskBarIconProps) {
  return (
    <button
      {...props}
      className={clsx(
        "h-full flex center justify-center items-center rounded-sm hover:bg-neutral-200/5 transition-colors",
        props.className
      )}
    >
      {props.children}
    </button>
  );
}
