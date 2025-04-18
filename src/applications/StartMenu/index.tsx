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
      <div className="bg-neutral-800/75 p-2 backdrop-blur-sm h-[500px] mt-auto flex flex-col gap-1">
        <StartMenuApplicationList></StartMenuApplicationList>
      </div>
    </div>
  );
}
