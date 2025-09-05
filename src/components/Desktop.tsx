import useAppSelector from "@/hooks/useAppSelector";
import Window from "@/components/Window";
import { useMemo } from "react";
import { cn } from "@/utils";

export default function Desktop() {
  const applications = useAppSelector(
    (state) => state.applications.applications
  );
  const applicationsList = useMemo(
    () => Object.values(applications),
    [applications]
  );

  return (
    <div className={cn("w-full flex-auto relative")}>
      {applicationsList.map((app) => (
        <Window key={app.applicationId} application={app}></Window>
      ))}
    </div>
  );
}
