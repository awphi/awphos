import IDBFileSystem from "@/utils/idb-fs";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import stringArgv from "string-argv";
import mri from "mri";
import useAppDispatch from "@/hooks/useAppDispatch";
import { startCloseApplication } from "@/store/applications";

export interface UseTerminalCommandsArgs {
  applicationId: string;
}

interface CommandDef {
  run: (params: {
    args: mri.Argv;
    input: string;
    fs: IDBFileSystem;
    dispatch: ReturnType<typeof useAppDispatch>;
    applicationId: string;
  }) => Promise<ReactNode[]> | ReactNode[];
  parseOptions?: mri.Options;
}

export const LINE_LIMIT = 256; // very low - need to virtualise the terminal renderer to increase

const ALIASES: Record<string, string> = {
  empty: "clear",
  close: "exit",
  quit: "exit",
};

const COMMANDS: Record<string, CommandDef | undefined> = {
  clear: {
    run() {
      return Array.from({ length: LINE_LIMIT }, () => "");
    },
  },
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
  ls: {
    async run({ fs, args }) {
      const dirs = args["_"];
      const result: string[] = [];

      if (dirs.length === 0) {
        dirs.push(fs.cwd());
      }

      for (const dir of dirs) {
        try {
          const content = await fs.readDir(dir);
          const names = content.children
            .map((v) => v.name)
            .filter((v) => !v.startsWith(".") || args.a);

          // only print headers when more than 1 dir like real ls
          if (dirs.length > 1) {
            result.push(`${dir}:`);
          }
          result.push(names.join("    "));
        } catch (e) {
          result.push(`ls: ${e}`);
        }
        result.push(" ");
      }

      return result;
    },
    parseOptions: {
      boolean: ["a"],
      default: {
        a: false,
      },
    },
  },
  cat: {
    async run({ fs, args }) {
      const files = args["_"];
      const result: string[] = [];

      for (const file of files) {
        try {
          const { data } = await fs.readFile(file);
          const txt = await data.text();
          result.push(txt);
        } catch (e) {
          result.push(`cat: ${e}`);
        }
      }

      return result;
    },
  },
  echo: {
    async run({ input }) {
      // not totally accurate since strings aren't escaped but whatever
      return [input.slice("echo ".length, input.length)];
    },
    parseOptions: { unknown() {} },
  },
  exit: {
    async run({ dispatch, applicationId }) {
      dispatch(startCloseApplication(applicationId));
      return ["Exiting..."];
    },
  },
  touch: {
    async run({ fs, args }) {
      const files = args["_"];

      for (const file of files) {
        try {
          if (await fs.exists(file)) {
            continue;
          }
          await fs.writeFile(file, new Blob());
        } catch (e) {
          return [`touch: ${e}`];
        }
      }

      return [" "];
    },
  },
  // TODO touch, rm and eventually mv, bonus: ping or basic curl
};

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
