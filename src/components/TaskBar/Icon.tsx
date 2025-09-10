import { cn } from "@/utils";
import { motion } from "motion/react";
import type { ComponentProps } from "react";

export type TaskBarIconProps = ComponentProps<typeof motion.button>;

export default function TaskBarIcon(props: TaskBarIconProps) {
  return (
    <motion.button
      {...props}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "h-full flex center justify-center items-center rounded-sm hover:bg-neutral-200/5 transition-colors",
        props.className
      )}
    >
      {props.children}
    </motion.button>
  );
}
