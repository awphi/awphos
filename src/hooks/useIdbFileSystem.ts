import IDBFileSystem from "@/utils/idb-fs";
import { useCallback, useState } from "react";

export function useIdbFileSystem(initialCwd?: string) {
  const [fs] = useState(() => new IDBFileSystem(initialCwd));
  const [cwd, setCwd] = useState(fs.cwd());

  const chdir = useCallback(
    async (pth: string) => {
      await fs.chdir(pth);
      setCwd(fs.cwd());
    },
    [fs]
  );

  return {
    fs,
    cwd,
    chdir,
  };
}

// TODO useFile and/or useDir hook to listen for file inode/data changes eventually?
