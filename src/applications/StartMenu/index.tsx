import useCurrentApplication from "@/hooks/useCurrentApplication";
import React, { useEffect } from "react";
import { StartMenuApplicationList } from "./ApplicationList";

export default function StartMenu() {
  const { isFocused, setProps } = useCurrentApplication();

  useEffect(() => {
    if (!isFocused) {
      setProps({ minimized: true });
    }
  }, [isFocused]);

  return (
    <div className="h-full grid">
      <div className="bg-neutral-700/50 p-2 border-neutral-600/50 border-r border-t backdrop-blur-sm h-[500px] mt-auto flex flex-col gap-1">
        <StartMenuApplicationList></StartMenuApplicationList>
      </div>
    </div>
  );
}
