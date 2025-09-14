import path from "nanopath/posix";
import { createDb, getDb, getDbStatus } from "./db";
import type { File, FileData, Folder, INode, MkdirOpts, RmOpts } from "./types";
import { createINode, getRoot, promisifyRequest } from "./utils";

export default class IDBFileSystem {
  private _cwd: string = "/";

  constructor() {
    const { loading, db } = getDbStatus();
    if (!db && !loading) {
      createDb();
    }
  }

  cwd(): string {
    return this._cwd;
  }

  private async read(pth: string): Promise<INode | undefined> {
    const parts = path.resolve(this.cwd(), pth).split(path.sep).filter(Boolean);

    const db = await getDb();
    let current = await getRoot(db);
    let currentPath = "/";
    for (const basename of parts) {
      const nextPath = path.join(currentPath, basename);
      const tx = db.transaction("inodes", "readonly");
      const inodes = tx.objectStore("inodes");
      const parentNameIdx = inodes.index("byParentAndName");
      const next = await promisifyRequest<INode | undefined>(() =>
        parentNameIdx.get([current.id, basename])
      );
      if (next === undefined) {
        return undefined;
      }
      currentPath = nextPath;
      current = next;
    }

    return current;
  }

  async chdir(pth: string): Promise<string> {
    const newDir = path.resolve(this.cwd(), pth);
    const isDir = await this.isDirectory(newDir);
    if (!isDir) {
      throw new Error(`Not a directory: ${newDir}`);
    }
    return this.cwd();
  }

  async exists(pth: string): Promise<boolean> {
    return (await this.read(pth)) !== undefined;
  }

  async isDirectory(pth: string): Promise<boolean> {
    const inode = await this.read(pth);
    return inode !== undefined && inode.type === "dir";
  }

  async mkdir(pth: string, opts?: MkdirOpts): Promise<INode> {
    const recursive = opts?.recursive ?? false;

    const childPath = path.resolve(this.cwd(), pth);
    const parentPath = path.resolve(childPath, "..");
    if (parentPath === childPath) {
      throw new Error(`Invalid parent: ${childPath}`);
    }

    if (await this.exists(childPath)) {
      throw new Error(`Directory already exists: ${childPath}`);
    }

    let parent: INode | undefined;
    if (recursive && !(await this.exists(parentPath))) {
      parent = await this.mkdir(parentPath, opts);
    }

    parent ??= await this.read(parentPath);

    if (parent === undefined || parent.type !== "dir") {
      throw new Error(`Could not read parent directory: ${parentPath}`);
    }
    const child = createINode({
      type: "dir",
      name: path.parse(childPath).base,
      parentId: parent.id,
    });

    // TODO it would be nice to re-use the transaction for {recursive: true} calls to maintain atomicity of updates
    const tx = (await getDb()).transaction("inodes", "readwrite");
    const inodes = tx.objectStore("inodes");
    await promisifyRequest(() => inodes.add(child));
    return child;
  }

  async writeFile(pth: string, data: Blob): Promise<INode> {
    const filePath = path.resolve(this.cwd(), pth);
    const parentPath = path.resolve(filePath, "..");

    if (await this.exists(filePath)) {
      await this.rm(filePath);
    }

    const parent = await this.read(parentPath);
    if (parent === undefined || parent.type !== "dir") {
      throw new Error(`Could not read parent directory: ${parentPath}`);
    }
    const inode = createINode({
      type: "file",
      name: path.parse(filePath).base,
      parentId: parent.id,
    });

    const db = await getDb();
    const tx = db.transaction(["inodes", "fileData"], "readwrite");
    const inodes = tx.objectStore("inodes");
    const fileData = tx.objectStore("fileData");

    await Promise.all([
      promisifyRequest(() => inodes.add(inode)),
      promisifyRequest(() =>
        fileData.add({
          inodeId: inode.id,
          data,
        })
      ),
    ]);

    return inode;
  }

  async rm(pth: string, opts?: RmOpts): Promise<void> {
    const recursive = opts?.recursive ?? false;
    const force = opts?.force ?? false;
    const filePath = path.resolve(this.cwd(), pth);

    if (filePath === "/") {
      throw new Error("Cannot delete the root path.");
    }

    const item = await this.read(filePath);
    if (item === undefined) {
      if (force) {
        return;
      } else {
        throw new Error(`File does not exist: ${filePath}`);
      }
    }

    const db = await getDb();
    const key = IDBKeyRange.only(item.id);
    if (recursive && item.type === "dir") {
      // faster than using readDir since we've already got the parent inode ID
      const tx = db.transaction("inodes", "readonly");
      const inodes = tx.objectStore("inodes");
      const childrenIdx = inodes.index("byParent");
      const children: INode[] = await promisifyRequest(() =>
        childrenIdx.getAll(key)
      );
      await Promise.all(
        children.map((v) => this.rm(path.join(filePath, v.name), opts))
      );
    }

    // TODO it would be nice to re-use the transaction for {recursive: true} calls to maintain atomicity of updates
    const tx = db.transaction(["inodes", "fileData"], "readwrite");
    const inodes = tx.objectStore("inodes");
    const fileData = tx.objectStore("fileData");

    await Promise.all([
      promisifyRequest(() => inodes.delete(key)),
      item.type === "file"
        ? promisifyRequest(() => fileData.delete(key))
        : Promise.resolve(),
    ]);
  }

  // TODO move() function - needs cycle detection

  async readFile(pth: string): Promise<File> {
    const filePath = path.resolve(this.cwd(), pth);
    const inode = await this.read(filePath);
    if (inode === undefined || inode.type !== "file") {
      throw new Error(`File not found: ${filePath}`);
    }

    const db = await getDb();
    const tx = db.transaction("fileData", "readonly");
    const fileData = tx.objectStore("fileData");
    const key = IDBKeyRange.only(inode.id);
    const { data } = await promisifyRequest<FileData>(() => fileData.get(key));
    return { ...inode, data };
  }

  async readDir(pth: string): Promise<Folder> {
    const filePath = path.resolve(this.cwd(), pth);
    const inode = await this.read(filePath);
    if (inode === undefined || inode.type !== "dir") {
      throw new Error(`Dir not found: ${filePath}`);
    }

    const db = await getDb();
    const tx = db.transaction("inodes", "readonly");
    const inodes = tx.objectStore("inodes");
    const childrenIdx = inodes.index("byParent");
    const key = IDBKeyRange.only(inode.id);
    const children: INode[] = await promisifyRequest(() =>
      childrenIdx.getAll(key)
    );
    return { ...inode, children };
  }
}

export * from "./types";
