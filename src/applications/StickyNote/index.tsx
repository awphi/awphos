import QuillEditor from "@/components/QuillEditor";
import { ScrollArea } from "@/components/ScrollArea";
import useCurrentApplication from "@/hooks/useCurrentApplication";
import { debounce } from "@/utils";
import useFile from "@/utils/idb-fs/react/useFile";
import { Loader2 } from "lucide-react";
import type { Delta } from "quill";
import type Quill from "quill";
import { useMemo, useRef } from "react";

export default function StickyNote() {
  const {
    application: {
      props: { args },
    },
  } = useCurrentApplication();
  const editorRef = useRef<Quill>(null);

  if (typeof args.file !== "string") {
    throw new Error("Failed to open sticky note - missing file");
  }

  const { file, loading, write } = useFile(args.file);
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
