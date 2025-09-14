export interface INode {
  /**
   * random uuidv4
   */
  id: string;
  type: "file" | "dir";
  /**
   * basename of the file
   */
  name: string;
  /**
   * reference to another inode id or the empty string if root
   */
  parentId: string;
  /**
   * UNIX timestamp of last modification to file content or inode metadata
   */
  ctime: number;
  /**
   * UNIX timestamp of last modification to file content
   */
  mtime: number;
  /**
   * UNIX timestamp of last file access or modification of content.
   */
  atime: number;
}

export interface FileData {
  /**
   * reference to the inode that describes this file
   */
  inodeId: string;
  data: Blob;
}

export type File = INode & Pick<FileData, "data">;

export type Folder = INode & { children: INode[] };

export interface MkdirOpts {
  recursive?: boolean;
}

export interface RmOpts {
  recursive?: boolean;
  force?: boolean;
}
