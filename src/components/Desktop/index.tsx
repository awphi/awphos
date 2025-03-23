import useAppDispatch from "@/hooks/useAppDispatch";
import useAppSelector from "@/hooks/useAppSelector";
import { focusApplication, openApplication } from "@/store/applications";
import clsx from "clsx";
import Window from "../Window";
import { useEffect } from "react";

export default function Desktop() {
  const { applications } = useAppSelector((state) => state.applications);
  const dispatch = useAppDispatch();

  // TODO temporary - remove
  useEffect(() => {
    dispatch(openApplication("dummy-app"));
  }, []);

  return (
    <div
      className={clsx("w-full flex-auto relative")}
      onClick={() => dispatch(focusApplication(null))}
    >
      {Object.keys(applications).map((id) => (
        <Window key={id} application={applications[id]}></Window>
      ))}
    </div>
  );
}
