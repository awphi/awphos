import applicationsRegistry, { type ApplicationsRegistry } from "..";
import { useEffect, useMemo, useRef } from "react";
import { openApplication } from "@/store/applications";
import useAppDispatch from "@/hooks/useAppDispatch";
import useCurrentApplication from "@/hooks/useCurrentApplication";
import { useDebouncedState } from "@/hooks/useDebouncedState";
import { motion } from "motion/react";

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
  const inputRef = useRef<HTMLInputElement>(null);
  const { isFocused } = useCurrentApplication();
  const [search, setSearch, debouncedSearch] = useDebouncedState("");

  const entries = useMemo(
    () =>
      Object.entries(applicationsRegistry.definitions)
        .sort((a, b) => a[1].name.localeCompare(b[1].name))
        .filter(([id]) => id !== "start-menu")
        .filter(([_, definition]) =>
          definition.name.toLowerCase().includes(debouncedSearch.toLowerCase())
        ),
    [applicationsRegistry, debouncedSearch]
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, [isFocused]);

  return (
    <div className="flex flex-col gap-1 select-none">
      {/* build out a proper search component with a search icon + clear button */}
      <input
        ref={inputRef}
        type="text"
        placeholder="Search for applications..."
        value={search}
        onInput={(e) => setSearch(e.currentTarget.value)}
        className="w-full rounded-sm border border-neutral-200/25 focus:border-neutral-200 px-2 py-1 mb-2 outline-none"
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
