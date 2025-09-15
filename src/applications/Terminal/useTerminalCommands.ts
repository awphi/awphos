import IDBFileSystem from "@/utils/idb-fs";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import stringArgv from "string-argv";
import mri from "mri";

export interface UseTerminalCommandsArgs {
  fs: IDBFileSystem;
}

interface CommandDef {
  run: (params: {
    args: mri.Argv;
    fs: IDBFileSystem;
  }) => Promise<ReactNode[]> | ReactNode[];
  parseOptions?: mri.Options;
}

// TODO go for file-based instead of registry-based - can we avoid eval()?
const COMMANDS: Record<string, CommandDef | undefined> = {
  pwd: {
    run({ fs }) {
      return [fs.cwd()];
    },
  },
  cd: {
    async run({ fs, args }) {
      const dir: string | undefined = args["_"][0];
      if (dir === undefined) {
        return [" "];
      }
      try {
        await fs.chdir(dir);
      } catch (e) {
        return [`cd: ${e}`];
      }
      return [fs.cwd()];
    },
  },
  mkdir: {
    async run({ fs, args }) {
      const dirs = args["_"];
      if (dirs.length === 0) {
        return [`usage: mkdir [-p] directory_name ...`];
      }

      try {
        for (const dir of dirs) {
          await fs.mkdir(dir, { recursive: args["p"] });
        }
      } catch (e) {
        return [`mkdir: ${e}`];
      }

      return [" "];
    },
    parseOptions: {
      boolean: ["p"],
      default: {
        p: false,
      },
    },
  },
  // TODO ls, cat, rm (and eventually mv)
};

export function useTerminalCommands() {
  const fs = useMemo(() => {
    return new IDBFileSystem({
      onCwdChanged: () => setCwd(fs.cwd()),
    });
  }, []);

  // expose a reactive version of fs.cwd() for rendering purposes
  const [cwd, setCwd] = useState(fs.cwd());

  const execute = useCallback(
    async (input: string): Promise<ReactNode[]> => {
      const argv = stringArgv(input);
      const [commandStr, ...rest] = argv;
      const command = COMMANDS[commandStr];
      if (command === undefined) {
        return [`command not found: ${commandStr}`];
      }

      let unknown: string | undefined;
      const args = mri(rest, {
        unknown(flag) {
          unknown = flag;
        },
        ...command.parseOptions,
      });
      if (unknown) {
        return [`${commandStr}: bad option: ${unknown}`];
      }

      return await command.run({ args, fs });
    },
    [fs]
  );

  return {
    execute,
    cwd,
  };
}
