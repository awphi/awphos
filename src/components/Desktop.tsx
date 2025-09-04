import useAppSelector from "@/hooks/useAppSelector";
import clsx from "clsx";
import Window from "@/components/Window";
import { useMemo } from "react";

export default function Desktop() {
  const applications = useAppSelector(
    (state) => state.applications.applications
  );
  const applicationsList = useMemo(
    () => Object.values(applications),
    [applications]
  );

  return (
    <div className={clsx("w-full flex-auto relative")}>
      {applicationsList.map((app) => (
        <Window key={app.applicationId} application={app}></Window>
      ))}
    </div>
  );
}
