import { useApplication } from "@/hooks/useApplication";
import { cn } from "@/utils";
import {
  Fragment,
  useMemo,
  type ComponentProps,
  type FC,
  type ReactNode,
} from "react";

// crazy long name
interface ContextMenuButtonProps extends ComponentProps<"button"> {
  label?: string;
  icon?: FC<ComponentProps<"svg">>;
}

export function ContextMenuButton({
  label,
  icon: Icon,
  className,
  ...props
}: ContextMenuButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "hover:bg-neutral-300/5 px-2 flex gap-2 py-0.5 w-full text-left rounded-md items-center",
        className
      )}
    >
      {Icon && <Icon className="size-4" />}
      <span>{label}</span>
    </button>
  );
}

export interface ApplicationContextMenuButtonProps
  extends ContextMenuButtonProps {
  applicationId: string;
}

export function ContextMenuApplicationButton({
  applicationId,
  ...props
}: ApplicationContextMenuButtonProps) {
  const { application, definition } = useApplication(applicationId);

  return (
    <ContextMenuButton
      icon={definition.icon}
      label={application.props.title}
      {...props}
    />
  );
}
