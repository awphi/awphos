import useCurrentApplication from "@/hooks/useCurrentApplication";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { addRandomTile, makeBoard, shiftBoard } from "./board";

// indexed by (Math.log2(value) - 1) % colors.length
const colors = [
  "bg-neutral-100",
  "bg-neutral-200",
  "bg-amber-50",
  "bg-amber-100",
  "bg-amber-200",
  "bg-amber-300",
  "bg-red-300",
  "bg-red-400",
  "bg-red-500",
  "bg-red-600",
  "bg-red-700",
];

const fontSizes = ["text-4xl", "text-3xl", "text-2xl", "text-xl"];

function TwentyFortyEightCell({ value }: { value: number }) {
  const bgClass =
    value === 0
      ? "bg-neutral-400"
      : colors[(Math.log2(value) - 1) % colors.length];
  const fontSizeClass = fontSizes[value.toString().length - 1];

  return (
    <div
      className={clsx(
        "w-16 h-16 flex justify-center items-center text-neutral-600 font-bold transition-all",
        bgClass,
        fontSizeClass
      )}
    >
      {value > 0 ? <span>{value}</span> : null}
    </div>
  );
}

function TwentyFortyEightBoard({ board }: { board: number[] }) {
  return (
    <div className="grid grid-cols-4 gap-2 w-fit bg-neutral-500 p-2 rounded-sm">
      {board.map((cell, idx) => (
        <TwentyFortyEightCell key={idx} value={cell} />
      ))}
    </div>
  );
}

export default function TwentyFortyEight() {
  const { isFocused } = useCurrentApplication();
  const [board, setBoard] = useState(makeBoard());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFocused) {
        return;
      }

      if (e.key.startsWith("Arrow")) {
        const newBoard = shiftBoard(board, e.key as any);
        addRandomTile(newBoard, Math.random() < 0.9 ? 2 : 4);
        setBoard(newBoard);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFocused, board, setBoard]);

  return (
    <div className="bg-neutral-100 h-full min-h-fit flex items-center justify-center">
      <TwentyFortyEightBoard board={board}></TwentyFortyEightBoard>
    </div>
  );
}
