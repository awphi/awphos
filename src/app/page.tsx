"use client";

import Desktop from "@/components/Desktop";
import TaskBar from "@/components/TaskBar";
import { store } from "@/store";
import { Provider } from "react-redux";
import { useFocus } from "@/hooks/useFocus";
import { useEffect } from "react";
import { ensureDefaultFileSystem } from "@/utils/ensure-fs";
import useAppDispatch from "@/hooks/useAppDispatch";
import { openApplication } from "@/store/applications";

function HomeContent() {
  const { focus } = useFocus();
  const dispatch = useAppDispatch();

  useEffect(() => {
    (async function () {
      try {
        // ensure default dirs/files exist
        await ensureDefaultFileSystem();
      } finally {
        // open default applications
        dispatch(
          openApplication({
            definitionId: "start-menu",
            applicationId: "start-menu",
            props: { minimized: true },
          })
        );

        dispatch(
          openApplication({
            definitionId: "sticky-note",
            props: {
              size: {
                height: 380,
                width: 380,
              },
              title: "Sticky Note - Welcome!",
            },
            args: {
              file: "/sticky-notes/welcome.json",
            },
          })
        );
      }
    })();
  }, [dispatch]);

  return (
    <>
      <div
        className="-z-50 pointer-events-none fixed w-full h-full"
        style={{
          background:
            "radial-gradient(circle,rgba(69, 68, 186, 1) 0%, #2a2970 40%, #1c1b4b 80%, rgba(7, 7, 19, 1) 112%)",
        }}
      ></div>
      <div
        className="w-full h-full flex flex-col"
        onClick={() => focus(null)}
        onContextMenu={(e) => e.preventDefault()}
      >
        <Desktop />
        <TaskBar />
      </div>
    </>
  );
}

export default function Home() {
  return (
    <Provider store={store}>
      <HomeContent />
    </Provider>
  );
}
