import QuillEditor from "@/components/QuillEditor";
import { ScrollArea } from "@/components/ScrollArea";
import useCurrentApplication from "@/hooks/useCurrentApplication";
import useOnce from "@/hooks/useOnce";
import { debounce } from "@/utils";
import useFile from "@/utils/idb-fs/react/useFile";
import { Loader2 } from "lucide-react";
import path from "nanopath/posix";
import type { Delta } from "quill";
import type Quill from "quill";
import { useMemo, useRef } from "react";

export default function StickyNote() {
  const {
    application: {
      props: { args, cwd },
    },
    setProps,
  } = useCurrentApplication();
  const editorRef = useRef<Quill>(null);
  const filePath: string = path.resolve(
    cwd,
    args._[0] ?? `/sticky-notes/${new Date().toISOString()}.json`
  );

  useOnce(() => {
    setProps({
      title: `Sticky Note - ${filePath}`,
    });
  });

  const { file, loading, write } = useFile(filePath);
  const debouncedWrite = useMemo(() => {
    return debounce((text: Delta) => {
      const blob = new Blob([JSON.stringify(text)], { type: "text/json" });
      return write(blob);
    }, 500);
  }, [write]);

  if (loading) {
    return (
      <div className="bg-yellow-100 h-full w-full flex items-center justify-center text-neutral-950">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-full bg-yellow-100 text-neutral-950">
      <QuillEditor
        ref={editorRef}
        onTextChange={() => {
          const contents = editorRef.current?.getContents();
          if (contents) {
            debouncedWrite(contents);
          }
        }}
        className="h-full"
        defaultValue={async () => {
          const value = (await file?.data.text()) ?? "{}";
          return JSON.parse(value);
        }}
      />
    </ScrollArea>
  );
}
