import { useDate } from "@/hooks/useDate";
import { useMemo } from "react";
import TaskBarIcon from "./Icon";

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
    <div className="w-full flex bg-neutral-700/50 border-t  backdrop-blur-sm border-neutral-600/50 px-3 pb-1.5 py-1 z-10">
      <TaskBarIcon>
        <span className="h-full aspect-square text-4xl">a</span>
      </TaskBarIcon>
      <div className="flex flex-auto"></div>
      <TaskBarIcon>
        <div className="flex flex-col text-sm px-2 py-0.5 text-right">
          <span>{formattedTime}</span>
          <span>{formattedDate}</span>
        </div>
      </TaskBarIcon>
    </div>
  );
}
