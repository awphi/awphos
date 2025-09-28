import path from "nanopath/posix";
import IDBFileSystem from "./idb-fs";

export const WELCOME_STICKY_NOTE_PATH = "/sticky-notes/welcome.json";
const WELCOME_STICKY_NOTE_CONTENT = {
  ops: [
    {
      insert:
        "Hello - Adam again! This is a work-in-progress rewrite of my old site over at ",
    },
    {
      attributes: {
        link: "https://www.adamw.ph/",
      },
      insert: "https://www.adamw.ph/",
    },
    {
      insert:
        ".\n\nThere's not a whole bunch to see here yet - currently working on a few fundamentals:\nRobust window system w/ all the standard bells and whistles (resizing, maximization, minimization, size constraints etc.)",
    },
    {
      attributes: {
        list: "bullet",
      },
      insert: "\n",
    },
    {
      insert: "IndexedDB-based file system",
    },
    {
      attributes: {
        list: "bullet",
      },
      insert: "\n",
    },
    {
      insert: "Simple text editing (like this sticky note!)",
    },
    {
      attributes: {
        list: "bullet",
      },
      insert: "\n",
    },
    {
      insert: "Standard terminal commands",
    },
    {
      attributes: {
        list: "bullet",
      },
      insert: "\n",
    },
    {
      insert: "Basic toy apps (so far just 2048 & Wikipedia)",
    },
    {
      attributes: {
        list: "bullet",
      },
      insert: "\n",
    },
    {
      insert: "\nCheck back soon for more or follow my progress on GitHub: ",
    },
    {
      attributes: {
        link: "https://github.com/awphi/awphos",
      },
      insert: "https://github.com/awphi/awphos",
    },
    {
      insert: ". Thanks! :)\n",
    },
  ],
};

// TODO can we do better than this - maybe map a real folder structure to the default fs?
export async function ensureDefaultFileSystem(): Promise<void> {
  const fs = new IDBFileSystem();
  if (!(await fs.exists(WELCOME_STICKY_NOTE_PATH))) {
    await fs.mkdir(path.dirname(WELCOME_STICKY_NOTE_PATH), {
      recursive: true,
    });
    await fs.writeFile(
      WELCOME_STICKY_NOTE_PATH,
      new Blob([JSON.stringify(WELCOME_STICKY_NOTE_CONTENT)], {
        type: "text/json",
      })
    );
  }
}
