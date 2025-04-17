import useAppSelector from "@/hooks/useAppSelector";
import clsx from "clsx";
import Window from "../Window";
import { useEffect, useMemo } from "react";
import { getFocusTargetId } from "@/utils";

export default function Desktop() {
  const focusTargetId = useMemo(() => getFocusTargetId("desktop"), []);

  const applications = useAppSelector(
    (state) => state.applications.applications
  );

  useEffect(() => {
    document.getElementById(focusTargetId)?.focus();
  }, []);

  return (
    <div className={clsx("w-full flex-auto relative")}>
      <input id={focusTargetId} className="w-0 h-0 absolute" />
      {Object.keys(applications).map((id) => (
        <Window key={id} application={applications[id]}></Window>
      ))}
    </div>
  );
}
