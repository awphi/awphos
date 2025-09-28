import { useCallback, useEffect, useState } from "react";
import IDBFileSystem, { type File, type INode } from "..";

export interface UseFileResult {
  file: File | null;
  error: Error | null;
  loading: boolean;
  write(data: Blob): Promise<INode>;
}

const defaultFs = new IDBFileSystem();

export default function useFile(
  path: string,
  fs: IDBFileSystem = defaultFs
): UseFileResult {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async function () {
      try {
        const result = await fs.readFile(path);
        setFile(result);
      } catch (e) {
        setError(e instanceof Error ? e : new Error(`Unknown error - ${e}`));
      }
      setLoading(false);
    })();
  }, [fs, path]);

  const write = useCallback(
    (data: Blob) => {
      return fs.writeFile(path, data);
    },
    [fs, path]
  );

  return { file, error, loading, write };
}
