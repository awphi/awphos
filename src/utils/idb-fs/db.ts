let _DB: IDBDatabase | undefined;
let _dbLoading = false;

const DB_NAME = "fs";
const DB_VERSION = 1;

export async function createDb(): Promise<void> {
  _dbLoading = true;
  _DB = await new Promise<IDBDatabase>((res, rej) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event) => {
      console.log(
        `Upgrading idb-fs: ${event.oldVersion} -> ${event.newVersion}`
      );
      const db = (event.target as { result?: IDBDatabase } | null)?.result;
      if (!db) {
        throw new Error("Failed to get DB from onupgradeneeded event");
      }

      // Inode store: dirs + files metadata
      const inodeStore = db.createObjectStore("inodes", {
        keyPath: "id",
        autoIncrement: true,
      });

      inodeStore.createIndex("byParentAndName", ["parentId", "name"], {
        unique: true,
      }); // index on parentId+name so you can look up "child.txt" in a given dir quickly
      inodeStore.createIndex("byParent", "parentId", {}); // index on parentId alone (for readdir-style lookups)

      db.createObjectStore("fileData", {
        keyPath: "inodeId",
      });
    };

    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
  _dbLoading = false;
}

export async function getDb(): Promise<IDBDatabase> {
  while (_DB === undefined) {
    await new Promise((res) => setTimeout(res, 10));
  }

  return _DB;
}

export function getDbStatus(): { loading: boolean; db: boolean } {
  return {
    loading: _dbLoading,
    db: _DB !== undefined,
  };
}
