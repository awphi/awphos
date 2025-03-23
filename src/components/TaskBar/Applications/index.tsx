import applicationsRegistry from "@/applications";
import useAppSelector from "@/hooks/useAppSelector";
import TaskBarIcon from "../Icon";
import { Application } from "@/store/applications";
import { useMemo } from "react";

// TODO eventually replace with some global state
const pinnedApplications = ["dummy-app"] as const;

interface TaskBarApplicationIconProps {
  definitionId: string;
  applicationIds: string[];
}

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
  const { applications } = useAppSelector((state) => state.applications);
  const taskbarApplications = useMemo(
    () => getTaskBarApplications(applications),
    [applications]
  );

  // TODO clicking action based on: minimized state, focus state and window count
  // TODO styling based on: minimized state, focus state and window count
  // TODO context menu - simple for now: new window, close all windows
  return (
    <div className="flex flex-auto gap-1">
      {taskbarApplications.map(({ definitionId }) => {
        const def = applicationsRegistry.definitions[definitionId];
        const Icon = def.icon;

        return (
          <TaskBarIcon key={definitionId}>
            <div
              title={def.name}
              className="h-full aspect-square flex items-center justify-center"
            >
              <Icon />
            </div>
          </TaskBarIcon>
        );
      })}
    </div>
  );
}
