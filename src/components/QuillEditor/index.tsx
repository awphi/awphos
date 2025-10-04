import React, {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  type ComponentProps,
} from "react";
import type Quill from "quill";
import type { Delta, Range, EmitterSource } from "quill";
import "./theme.css";

export interface QuillEditorProps
  extends Omit<ComponentProps<"div">, "defaultValue"> {
  readOnly?: boolean;
  defaultValue?: Delta | (() => Promise<Delta>) | (() => Delta);
  onTextChange?: (delta: Delta, oldDelta: Delta, source: EmitterSource) => void;
  onSelectionChange?: (
    range: Range,
    oldRange: Range,
    source: EmitterSource
  ) => void;
}

// QuillEditor is an uncontrolled React component
const QuillEditor = forwardRef<Quill, QuillEditorProps>(
  (props: QuillEditorProps, ref) => {
    const {
      readOnly,
      defaultValue,
      onTextChange,
      onSelectionChange,
      ...divProps
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const defaultValueRef = useRef(defaultValue);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);

    if (typeof ref !== "object") {
      throw new Error("Invalid ref passed to QuillEditor");
    }

    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    });

    useEffect(() => {
      ref?.current?.enable(!readOnly);
    }, [ref, readOnly]);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const editorContainer = container.appendChild(
        container.ownerDocument.createElement("div")
      );

      (async function () {
        const Quill = (await import("quill")).default;
        const quill = new Quill(editorContainer, {
          theme: "snow",
        });

        if (ref) {
          ref.current = quill;
        }

        if (defaultValueRef.current) {
          const delta =
            typeof defaultValueRef.current === "function"
              ? await defaultValueRef.current()
              : defaultValueRef.current;
          quill.setContents(delta);
        }

        quill.on(Quill.events.TEXT_CHANGE, (...args) => {
          onTextChangeRef.current?.(...args);
        });

        quill.on(Quill.events.SELECTION_CHANGE, (...args) => {
          onSelectionChangeRef.current?.(...args);
        });
      })();

      return () => {
        if (ref) {
          ref.current = null;
        }
        container.replaceChildren();
      };
    }, [ref]);

    return <div ref={containerRef} {...divProps}></div>;
  }
);

QuillEditor.displayName = "Editor";

export default QuillEditor;
