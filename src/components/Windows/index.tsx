import useAppSelector from "@/hooks/useAppSelector";
import Window from "@/components/Window";
import applications from "@/applications";

export default function Windows() {
  const activeApplicationIds = useAppSelector(
    (state) => state.applications.applicationIds
  );
  const activeApplications = useAppSelector(
    (state) => state.applications.applications
  );

  return (
    <>
      {activeApplicationIds.map((id) => {
        const app = activeApplications[id];
        if (!applications.hasComponent(app.definitionId)) {
          return null;
        }

        return <Window key={id} application={app}></Window>;
      })}
    </>
  );
}
