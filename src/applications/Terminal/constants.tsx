import type useAppDispatch from "@/hooks/useAppDispatch";
import { openApplication, startCloseApplication } from "@/store/applications";
import type IDBFileSystem from "@/utils/idb-fs";
import type mri from "mri";
import type { ReactNode } from "react";

export const LINE_LIMIT = 256; // very low - need to virtualise the terminal renderer to increase

export interface CommandDef {
  run: (params: {
    args: mri.Argv;
    input: string;
    fs: IDBFileSystem;
    dispatch: ReturnType<typeof useAppDispatch>;
    applicationId: string;
  }) => Promise<ReactNode[]> | ReactNode[];
  usage: string;
  description: ReactNode;
  parseOptions?: mri.Options;
}

export const ALIASES: Record<string, string> = {
  empty: "clear",
  close: "exit",
  quit: "exit",
};

export const COMMANDS: Record<string, CommandDef | undefined> = {
  clear: {
    run() {
      return Array.from({ length: LINE_LIMIT }, () => "");
    },
    description: "Clear the terminal",
    usage: "clear",
  },
  pwd: {
    run({ fs }) {
      return [fs.cwd()];
    },
    description: "Prints the current working directory",
    usage: "pwd",
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
    description: "Change the current working directory",
    usage: "cd <dir>",
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
    description: (
      <>
        <p>Make a new directory or directories on the local file system</p>
        <p>
          Use the <code>-p</code> flag to create all necessary parent
          directories if they don&apos;t yet exist
        </p>
      </>
    ),
    usage: "mkdir [-p] <dirs>",
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
    description: (
      <>
        <p>List all the files and directories in a directory</p>
        <p>
          Displays the contents of the current working directory if no arguments
          are passed
        </p>
        <p>
          Use the <code>-a</code> flag to also display hidden files and
          directories
        </p>
      </>
    ),
    usage: "ls [-a] <dirs>",
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
    description: "Echo the content of a given file or set of files to stdout",
    usage: "cat <files>",
  },
  echo: {
    run({ input }) {
      // not totally accurate since strings aren't escaped but whatever
      return [input.slice("echo ".length, input.length)];
    },
    parseOptions: { unknown() {} },
    description: "Echo the passed input to stdout",
    usage: "echo <input>",
  },
  exit: {
    run({ dispatch, applicationId }) {
      dispatch(startCloseApplication(applicationId));
      return ["Exiting..."];
    },
    description: "Close the terminal session",
    usage: "exit",
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
    description: "Create a new file or set of files on the local file system",
    usage: "touch <files>",
  },
  help: {
    run({ dispatch, applicationId }) {
      dispatch(
        openApplication({
          definitionId: "terminal-manual",
          parentId: applicationId,
        })
      );
      return ["Opening manual..."];
    },
    description: "Opens this help manual",
    usage: "help",
  },
  rm: {
    async run({ fs, args }) {
      const files = args["_"];
      const result: string[] = [];

      for (const file of files) {
        try {
          if ((await fs.isDirectory(file)) && !args.r) {
            result.push(`rm: ${file}: is a directory`);
          } else {
            await fs.rm(file, { recursive: !!args.r, force: !!args.f });
          }
        } catch (e) {
          result.push(`rm: ${e}`);
        }
      }

      result.push(" ");
      return result;
    },
    parseOptions: {
      boolean: ["r", "f"],
      default: {
        r: false,
        f: false,
      },
    },
    description: "Deletes a file or set of files from the filesystem",
    usage: "rm [-rf] <files>",
  },
  // TODO mv, bonus: ping or basic curl
};
