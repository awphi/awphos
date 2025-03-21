import clsx from "clsx";

export interface TaskBarIconProps extends React.ComponentProps<"button"> {}

export default function TaskBarIcon(props: TaskBarIconProps) {
  return (
    <button
      className={clsx(
        "h-full flex center justify-center items-center rounded-sm hover:bg-neutral-200/5 transition-colors",
        props.className
      )}
      {...props}
    >
      {props.children}
    </button>
  );
}
