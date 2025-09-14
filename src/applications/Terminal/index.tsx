import useCurrentApplication from "@/hooks/useCurrentApplication";
import { useIdbFileSystem } from "@/hooks/useIdbFileSystem";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { makeLine, type SelectionRange, type TerminalLine } from "./utils";
import { useWindowEvent } from "@/hooks/useWindowEvent";
import { cn } from "@/utils";

export default function Terminal() {
  const {
    application: { args },
    setProps,
    isFocused,
  } = useCurrentApplication();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { cwd } = useIdbFileSystem(
    typeof args.directory === "string" ? args.directory : undefined
  );
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const prompt = useMemo(() => `admin@adamwph ${cwd} %`, [cwd]);
  const [input, setInput] = useState("");
  const [selection, setSelection] = useState<SelectionRange>({
    start: 0,
    end: 0,
  });

  const renderedInput = useMemo<ReactNode>(() => {
    const selectionClassName = isFocused
      ? "bg-white"
      : "outline-1 outline-white/50";
    if (selection.start === selection.end && selection.start === input.length) {
      return (
        <>
          <span>{input}</span>
          <span className={cn("text-transparent", selectionClassName)}>a</span>
        </>
      );
    }

    const end = Math.min(selection.end + 1, input.length);
    const before = input.slice(0, selection.start);
    const selectedChars = input.slice(selection.start, end);
    const after = input.slice(end, input.length);

    return (
      <>
        <span>{before}</span>
        <span className={cn("text-black", selectionClassName)}>
          {selectedChars}
        </span>
        <span>{after}</span>
      </>
    );
  }, [input, selection, isFocused]);

  useEffect(() => {
    setProps({
      title: `Terminal - ${cwd}`,
    });
  }, [cwd, setProps]);

  const focusInput = useCallback(() => {
    textAreaRef.current?.focus();
  }, []);

  const updateInputSelection = useCallback(() => {
    setSelection({
      start: textAreaRef.current?.selectionStart ?? 0,
      end:
        textAreaRef.current?.selectionEnd ??
        textAreaRef.current?.selectionStart ??
        0,
    });
  }, []);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (!textAreaRef.current) {
        return;
      }

      if (e.key === "Enter" && !e.shiftKey) {
        setLines((current) => current.concat(makeLine(`${prompt} ${input}`)));
        textAreaRef.current.value = "";
        setInput("");
        e.preventDefault();
      }

      requestAnimationFrame(() => {
        contentRef.current?.scrollTo(0, contentRef.current?.scrollHeight ?? 0);
      });
    },
    [input, prompt]
  );

  useEffect(() => {
    if (isFocused) {
      focusInput();
    }
  }, [isFocused, focusInput]);

  useWindowEvent(
    "selectionchange",
    (e) => {
      if (e.target === textAreaRef.current) {
        updateInputSelection();
      }
    },
    [updateInputSelection]
  );

  return (
    <div
      onClick={focusInput}
      ref={contentRef}
      className="overflow-auto px-2 py-1 bg-black w-full h-full font-mono"
    >
      <textarea
        ref={textAreaRef}
        className="fixed opacity-0"
        onKeyDown={onKeyDown}
        onChange={() => {
          setInput(textAreaRef.current?.value ?? "");
          updateInputSelection();
        }}
      />
      <div className="text-white flex flex-col">
        {lines.map((v) => {
          return (
            <div className="whitespace-pre-wrap" key={v.key}>
              {v.text}
            </div>
          );
        })}
      </div>
      <div className="whitespace-pre-wrap">
        {prompt} {renderedInput}
      </div>
    </div>
  );
}
