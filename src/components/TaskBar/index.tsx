import { useDate } from "@/hooks/useDate";
import { useMemo } from "react";

import TaskBarIcon from "./Icon";
import TaskBarApplications from "./Applications";
import TaskBarStartMenuIcon from "./StartMenuIcon";
import { TASK_BAR_HEIGHT } from "./constants";

export default function TaskBar() {
  const date = useDate({ updateInterval: 1000 * 60 });

  const formattedTime = useMemo(
    () => date.toLocaleTimeString("en-GB", { timeStyle: "short" }),
    [date]
  );
  const formattedDate = useMemo(
    () => date.toLocaleDateString("en-GB", { dateStyle: "short" }),
    [date]
  );

  return (
    <div
      className="w-full flex bg-neutral-800/70 gap-1 backdrop-blur-lg px-3 pb-1.5 py-1 select-none"
      style={{ zIndex: 1_000_000, height: TASK_BAR_HEIGHT }}
    >
      <TaskBarStartMenuIcon />
      <TaskBarApplications />
      <TaskBarIcon>
        <div className="flex flex-col text-sm px-2 py-0.5 text-right">
          <span>{formattedTime}</span>
          <span>{formattedDate}</span>
        </div>
      </TaskBarIcon>
    </div>
  );
}
