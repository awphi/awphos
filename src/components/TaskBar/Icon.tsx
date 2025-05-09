import clsx from "clsx";
import { motion } from "motion/react";
import type { ComponentProps } from "react";

export interface TaskBarIconProps
  extends ComponentProps<typeof motion.button> {}

export default function TaskBarIcon(props: TaskBarIconProps) {
  return (
    <motion.button
      {...props}
      whileTap={{ scale: 0.95 }}
      className={clsx(
        "h-full flex center justify-center items-center rounded-sm hover:bg-neutral-200/5 transition-colors",
        props.className
      )}
    >
      {props.children}
    </motion.button>
  );
}
