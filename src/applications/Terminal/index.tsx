import useCurrentApplication from "@/hooks/useCurrentApplication";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useWindowEvent } from "@/hooks/useWindowEvent";
import { clamp, cn } from "@/utils";
import { useTerminalCommands } from "./useTerminalCommands";
import { ScrollArea } from "@/components/ScrollArea";
import { LINE_LIMIT } from "./constants";

export interface SelectionRange {
  start: number;
  end: number;
}

export default function Terminal() {
  const {
    setProps,
    isFocused,
    application: { applicationId },
  } = useCurrentApplication();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { execute, cwd } = useTerminalCommands({ applicationId });
  const [lines, setLines] = useState<ReactNode[]>([
    <span key="welcome" className="text-neutral-400">
      Welcome to the adamw.ph online terminal - type &quot;help&quot; to find
      out more!
    </span>,
  ]);
  const prompt = useMemo(() => `admin@adamwph ${cwd} %`, [cwd]);
  const [input, setInput] = useState("");
  const [selection, setSelection] = useState<SelectionRange>({
    start: 0,
    end: 0,
  });
  const [history, setHistory] = useState<string[]>([]);
  const [historyCursor, setHistoryCursor] = useState(-1); // -1 = empty

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
    async (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (!textAreaRef.current) {
        return;
      }

      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        const dir = e.key === "ArrowUp" ? 1 : -1;
        const oldCursor = historyCursor;
        const newCursor = clamp(oldCursor + dir, -1, history.length - 1);
        setHistoryCursor(newCursor);
        if (newCursor !== oldCursor) {
          const entry = newCursor === -1 ? "" : history[newCursor];
          setInput(entry);
          textAreaRef.current.value = entry;
          setSelection({ start: entry.length, end: entry.length });
        }
        e.preventDefault();
      }

      if (e.key === "Enter" && !e.shiftKey) {
        const result = await execute(input);
        setLines((current) =>
          current.concat(`${prompt} ${input}`).concat(result).slice(-LINE_LIMIT)
        );
        setHistory((current) => [input].concat(current));
        setHistoryCursor(-1);
        textAreaRef.current.value = "";
        setInput("");
        setSelection({ start: 0, end: 0 });
        e.preventDefault();
      }

      requestAnimationFrame(() => {
        contentRef.current?.scrollTo(0, contentRef.current?.scrollHeight ?? 0);
      });
    },
    [input, prompt, execute, history, historyCursor]
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
    <ScrollArea
      onClick={focusInput}
      ref={contentRef}
      className="px-2 py-1 bg-neutral-950 w-full h-full font-mono"
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
      <div className="text-neutral-100 flex flex-col">
        {lines.map((v, i) => {
          return (
            <div className="whitespace-pre-wrap" key={i}>
              {v}
            </div>
          );
        })}
      </div>
      <div className="whitespace-pre-wrap">
        {prompt} {renderedInput}
      </div>
    </ScrollArea>
  );
}
