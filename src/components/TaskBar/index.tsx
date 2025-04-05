import { useDate } from "@/hooks/useDate";
import { useMemo } from "react";
import TaskBarIcon from "./Icon";
import Image from "next/image";

import logo from "../../../public/logo.png";
import TaskBarApplications from "./Applications";

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
      className="w-full flex bg-neutral-700/50 border-t gap-1 backdrop-blur-sm border-neutral-600/50 px-3 pb-1.5 py-1 select-none"
      style={{ zIndex: 1_000_000 }}
    >
      <TaskBarIcon>
        <div
          title="Start"
          className="h-full aspect-square relative flex items-center justify-center"
        >
          <Image
            height={32}
            width={32}
            src={logo}
            alt="Logo image"
            sizes="100px"
          ></Image>
        </div>
      </TaskBarIcon>
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
