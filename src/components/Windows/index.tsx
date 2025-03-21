import useAppSelector from "@/hooks/useAppSelector";
import Window from "@/components/Window";
import applications from "@/applications";
import { DndContext } from "@dnd-kit/core";
import useAppDispatch from "@/hooks/useAppDispatch";
import { setApplicationProps } from "@/store/applications";

export default function Windows() {
  const dispatch = useAppDispatch();
  const activeApplicationIds = useAppSelector(
    (state) => state.applications.applicationIds
  );
  const activeApplications = useAppSelector(
    (state) => state.applications.applications
  );

  return (
    <DndContext
      onDragEnd={({ active: { id }, delta }) => {
        if (typeof id === "string" && id in activeApplications) {
          const { topLeft } = activeApplications[id].props;
          dispatch(
            setApplicationProps({
              applicationId: id,
              props: {
                topLeft: {
                  x: topLeft.x + delta.x,
                  y: topLeft.y + delta.y,
                },
              },
            })
          );
        }
      }}
    >
      {activeApplicationIds.map((id) => {
        const app = activeApplications[id];
        if (!applications.hasComponent(app.definitionId)) {
          return null;
        }

        return <Window key={id} application={app}></Window>;
      })}
    </DndContext>
  );
}
