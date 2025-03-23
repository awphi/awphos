import useAppSelector from "@/hooks/useAppSelector";
import { Application } from "@/store/applications";
import { useMemo } from "react";
import TaskBarApplicationIcon, {
  TaskBarApplicationIconProps,
} from "./ApplicationIcon";

// TODO eventually replace with some global state
const pinnedApplications = ["dummy-app"] as const;

function getTaskBarApplications(
  applications: Record<string, Application>
): TaskBarApplicationIconProps[] {
  const result: Record<string, TaskBarApplicationIconProps> =
    Object.create(null);

  for (const definitionId of pinnedApplications) {
    result[definitionId] = {
      definitionId,
      applicationIds: [],
    };
  }

  for (const [applicationId, { definitionId }] of Object.entries(
    applications
  )) {
    if (!(definitionId in result)) {
      result[definitionId] = {
        definitionId,
        applicationIds: [],
      };
    }

    result[definitionId].applicationIds.push(applicationId);
  }

  return Object.values(result);
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
      {taskbarApplications.map(TaskBarApplicationIcon)}
    </div>
  );
}
