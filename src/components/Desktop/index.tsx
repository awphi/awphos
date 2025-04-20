import useAppSelector from "@/hooks/useAppSelector";
import clsx from "clsx";
import Window from "../Window";
import { AnimatePresence } from "motion/react";

export default function Desktop() {
  const applications = useAppSelector(
    (state) => state.applications.applications
  );

  return (
    <div className={clsx("w-full flex-auto relative")}>
      <AnimatePresence initial={false}>
        {Object.keys(applications).map((id) =>
          applications[id].state === "open" ? (
            <Window key={id} application={applications[id]}></Window>
          ) : null
        )}
      </AnimatePresence>
    </div>
  );
}
