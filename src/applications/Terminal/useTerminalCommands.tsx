import IDBFileSystem from "@/utils/idb-fs";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import stringArgv from "string-argv";
import mri from "mri";
import useAppDispatch from "@/hooks/useAppDispatch";
import { ALIASES, COMMANDS, type CommandDef } from "./constants";

export interface UseTerminalCommandsArgs {
  applicationId: string;
}

function resolveCommand(commandStr: string): CommandDef | undefined {
  const command = COMMANDS[commandStr];
  const alias = ALIASES[commandStr];

  if (command === undefined && alias !== undefined) {
    return resolveCommand(alias);
  }

  return command;
}

export function useTerminalCommands({
  applicationId,
}: UseTerminalCommandsArgs) {
  const fs = useMemo(() => {
    return new IDBFileSystem({
      onCwdChanged: () => setCwd(fs.cwd()),
    });
  }, []);

  // expose a reactive version of fs.cwd() for rendering purposes
  const [cwd, setCwd] = useState(fs.cwd());
  const dispatch = useAppDispatch();

  const execute = useCallback(
    async (input: string): Promise<ReactNode[]> => {
      // TODO before processing commands we should support chaining and redirection - piping is out of scope
      const argv = stringArgv(input);
      const [commandStr, ...rest] = argv;
      const command = resolveCommand(commandStr);
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

      return await command.run({ args, fs, input, dispatch, applicationId });
    },
    [fs, dispatch, applicationId]
  );

  return {
    execute,
    cwd,
  };
}
