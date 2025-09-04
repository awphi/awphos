import useAppSelector from "@/hooks/useAppSelector";
import clsx from "clsx";
import Window from "@/components/Window";
import { AnimatePresence } from "motion/react";
import { useCallback, useMemo } from "react";
import useAppDispatch from "@/hooks/useAppDispatch";
import { finalizeCloseApplication } from "@/store/applications";

export default function Desktop() {
  const applications = useAppSelector(
    (state) => state.applications.applications
  );
  const dispatch = useAppDispatch();
  const applicationsList = useMemo(
    () => Object.values(applications),
    [applications]
  );

  const handleWindowAnimationExit = useCallback(() => {
    for (const { applicationId, state } of applicationsList) {
      if (state === "closing") {
        dispatch(finalizeCloseApplication(applicationId));
      }
    }
  }, []);

  return (
    <div className={clsx("w-full flex-auto relative")}>
      <AnimatePresence
        onExitComplete={handleWindowAnimationExit}
        initial={false}
      >
        {applicationsList.map((app) => (
          <Window key={app.applicationId} application={app}></Window>
        ))}
      </AnimatePresence>
    </div>
  );
}
