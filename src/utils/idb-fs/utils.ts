import type { INode } from "./types";

export function promisifyRequest<T>(reqFn: () => IDBRequest<T>): Promise<T> {
  return new Promise((res, rej) => {
    const req = reqFn();
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}

export function createINode(
  props: Pick<INode, "type" | "name" | "parentId">
): INode {
  const now = Date.now();
  return {
    ...props,
    id: crypto.randomUUID(),
    ctime: now,
    atime: now,
    mtime: now,
  };
}

export async function getRoot(db: IDBDatabase): Promise<INode> {
  const tx = db.transaction("inodes", "readonly");
  const inodes = tx.objectStore("inodes");
  const parentIdx = inodes.index("byParent");
  const rootCursor = await promisifyRequest(() =>
    parentIdx.openCursor(IDBKeyRange.only(""))
  );

  if (!rootCursor) {
    const tx = db.transaction("inodes", "readwrite");
    const inodes = tx.objectStore("inodes");
    const root = createINode({
      type: "dir",
      name: "",
      parentId: "",
    });
    await promisifyRequest(() => inodes.add(root));
    return root;
  }

  return rootCursor.value;
}
