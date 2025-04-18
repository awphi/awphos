import useAppSelector from "@/hooks/useAppSelector";
import clsx from "clsx";
import Window from "../Window";

export default function Desktop() {
  const applications = useAppSelector(
    (state) => state.applications.applications
  );

  return (
    <div className={clsx("w-full flex-auto relative")}>
      {Object.keys(applications).map((id) => (
        <Window key={id} application={applications[id]}></Window>
      ))}
    </div>
  );
}
