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
    const def = applicationsRegistry.definitions[definitionId];
    if (!def.showInTaskbar) {
      return;
    }

    if (!result.has(definitionId)) {
      result.set(definitionId, {
        definitionId,
        applicationIds: [],
      });
    }

    if (applicationId && applications[applicationId]?.state === "open") {
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
