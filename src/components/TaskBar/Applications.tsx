import useAppSelector from "@/hooks/useAppSelector";
import type { Application } from "@/store/applications";
import { useMemo } from "react";
import TaskBarApplicationIcon, {
  type TaskBarApplicationIconProps,
} from "./ApplicationIcon";
import applicationsRegistry from "@/applications";

// TODO eventually replace with some global state
const pinnedApplications = ["wikipedia", "dummy-app"] as const;

function getTaskBarApplications(
  applications: Record<string, Application>
): TaskBarApplicationIconProps[] {
  const result = new Map<string, TaskBarApplicationIconProps>();

  function append(definitionId: string, applicationId?: string): void {
    if (
      applicationsRegistry.definitions[definitionId].showInTaskbar === false
    ) {
      return;
    }

    if (!(definitionId in result)) {
      result.set(definitionId, {
        definitionId,
        applicationIds: [],
      });
    }

    if (applicationId) {
      result.get(definitionId)!.applicationIds.push(applicationId);
    }
  }

  for (const definitionId of pinnedApplications) {
    append(definitionId);
  }

  for (const [appId, { definitionId }] of Object.entries(applications)) {
    append(definitionId, appId);
  }

  return [...result.values()];
}

export default function TaskBarApplications() {
  const applications = useAppSelector(
    (state) => state.applications.applications
  );
  const taskbarApplications = useMemo(
    () => getTaskBarApplications(applications),
    [applications]
  );

  return (
    <div className="flex flex-auto gap-1">
      {taskbarApplications.map((props) => (
        <TaskBarApplicationIcon {...props} key={props.definitionId} />
      ))}
    </div>
  );
}
