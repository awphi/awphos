import useAppSelector from "@/hooks/useAppSelector";
import clsx from "clsx";
import Window from "../Window";
import { AnimatePresence } from "motion/react";
import { useCallback, useMemo } from "react";
import useAppDispatch from "@/hooks/useAppDispatch";
import { finalizeCloseApplication } from "@/store/applications";

export default function Desktop() {
  const applications = useAppSelector(
    (state) => state.applications.applications
  );
  const dispatch = useAppDispatch();
  const applicationIds = useMemo(
    () => Object.keys(applications),
    [applications]
  );

  const handleWindowAnimationExit = useCallback(() => {
    for (const id of applicationIds) {
      if (applications[id].state === "closing") {
        dispatch(finalizeCloseApplication(id));
      }
    }
  }, []);

  return (
    <div className={clsx("w-full flex-auto relative")}>
      <AnimatePresence
        onExitComplete={handleWindowAnimationExit}
        initial={false}
      >
        {applicationIds.map((id) =>
          applications[id].state === "open" ? (
            <Window key={id} application={applications[id]}></Window>
          ) : null
        )}
      </AnimatePresence>
    </div>
  );
}
