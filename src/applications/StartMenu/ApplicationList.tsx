import { applicationsRegistry } from "..";
import { useMemo } from "react";
import { openApplication } from "@/store/applications";
import useAppDispatch from "@/hooks/useAppDispatch";
import { useDebouncedState } from "@/hooks/useDebouncedState";
import { motion } from "motion/react";
import Input from "@/components/Input";

const excludedApps = new Set(["start-menu", "terminal-manual"]);

function StartMenuApplicationListButton({
  definitionId,
}: {
  definitionId: string;
}) {
  const { name, icon: Icon } = useMemo(
    () => applicationsRegistry.definitions[definitionId],
    [definitionId]
  );
  const dispatch = useAppDispatch();

  return (
    <motion.button
      key={name}
      whileTap={{ scale: 0.95 }}
      className="text-left hover:bg-neutral-200/10 px-2 py-0.5 rounded-sm w-full flex gap-2 items-center"
      onClick={(e) => {
        dispatch(openApplication({ definitionId }));
        e.stopPropagation();
      }}
    >
      <Icon className="size-4" />
      <span>{name}</span>
    </motion.button>
  );
}

export function StartMenuApplicationList() {
  const [search, setSearch, debouncedSearch] = useDebouncedState("");

  const entries = useMemo(
    () =>
      Object.entries(applicationsRegistry.definitions)
        .sort((a, b) => a[1].name.localeCompare(b[1].name))
        .filter(([id]) => !excludedApps.has(id))
        .filter(([, definition]) =>
          definition.name.toLowerCase().includes(debouncedSearch.toLowerCase())
        ),
    [debouncedSearch]
  );

  return (
    <div className="flex flex-col gap-1 p-4 select-none">
      <Input
        className="mb-2"
        value={search}
        onChange={setSearch}
        autoFocus={true}
      />
      {entries.map(([definitionId]) => (
        <StartMenuApplicationListButton
          key={definitionId}
          definitionId={definitionId}
        />
      ))}
    </div>
  );
}
