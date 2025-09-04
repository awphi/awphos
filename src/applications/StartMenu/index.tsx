import useCurrentApplication from "@/hooks/useCurrentApplication";
import React, { useEffect } from "react";
import { StartMenuApplicationList } from "./ApplicationList";

export default function StartMenu() {
  const {
    isFocused,
    setProps,
    application: {
      props: { minimized },
    },
  } = useCurrentApplication();

  useEffect(() => {
    if (!isFocused) {
      setProps({ minimized: true });
    }
  }, [isFocused]);

  return (
    <div className="bg-neutral-900/70 p-4 backdrop-blur-lg h-full mt-auto flex flex-col gap-1">
      {minimized ? null : <StartMenuApplicationList></StartMenuApplicationList>}
    </div>
  );
}
