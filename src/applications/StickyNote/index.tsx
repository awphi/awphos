import QuillEditor from "@/components/QuillEditor";
import { ScrollArea } from "@/components/ScrollArea";
import useCurrentApplication from "@/hooks/useCurrentApplication";
import useFile from "@/utils/idb-fs/react/useFile";
import { Loader2 } from "lucide-react";
import type Quill from "quill";
import { useRef } from "react";

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

  // TODO check for error
  const { file, loading } = useFile(args.file);

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
          // TODO debounced writing back to disk - bonus points for saving status in quill toolbar
          console.log(editorRef.current?.getContents());
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
