import { BoxesIcon } from "lucide-react";
import applicationsRegistry, { type ApplicationsRegistry } from "..";
import { useMemo } from "react";
import { openApplication } from "@/store/applications";
import useAppDispatch from "@/hooks/useAppDispatch";

interface ApplicationDefinitionGroup {
  definitionIds: string[];
  title: string;
}

function groupApplicationDefinitions(): ApplicationDefinitionGroup[] {
  const result: ApplicationDefinitionGroup[] = [];

  for (const [definitionId, def] of Object.entries(
    applicationsRegistry.definitions
  )) {
    if (!def.showInStartMenu) {
      continue;
    }
    const char = def.name[0].toUpperCase();
    const idx = char.charCodeAt(0);
    if (result[idx] === undefined) {
      result[idx] = { title: char, definitionIds: [] };
    }

    result[idx].definitionIds.push(definitionId);
  }

  return result
    .filter((group) => group !== undefined)
    .sort((a, b) => a.title.localeCompare(b.title));
}

function StartMenuApplicationListButton({
  definitionId,
}: {
  definitionId: string;
}) {
  const { name } = useMemo(
    () => applicationsRegistry.definitions[definitionId],
    [definitionId]
  );
  const dispatch = useAppDispatch();

  return (
    <button
      key={name}
      className="text-left ml-1 hover:bg-neutral-200/10 px-2 py-0.5 rounded-sm w-full"
      onClick={(e) => {
        dispatch(openApplication({ definitionId }));
        e.stopPropagation();
      }}
    >
      <span>{name}</span>
    </button>
  );
}

function StartMenuApplicationListGroup({
  group: { title, definitionIds },
}: {
  group: ApplicationDefinitionGroup;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold">{title}</h2>
      {definitionIds.map((definitionId) => (
        <StartMenuApplicationListButton
          key={definitionId}
          definitionId={definitionId}
        />
      ))}
    </div>
  );
}

export function StartMenuApplicationList() {
  const entries = useMemo(
    () => groupApplicationDefinitions(),
    [applicationsRegistry]
  );
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2 text-lg font-bold items-center">
        <BoxesIcon width={20} />
        <h1>Apps</h1>
      </div>
      <hr className="opacity-25" />

      {entries.map((group) => (
        <StartMenuApplicationListGroup group={group} key={group.title} />
      ))}
    </div>
  );
}
