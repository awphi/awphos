import useCurrentApplication from "@/hooks/useCurrentApplication";
import { useEffect, useState } from "react";
import {
  makeBoard,
  shiftBoard,
  type TwentyFortyEightBoard,
  type TwentyFortyEightTile,
} from "./board";
import { motion } from "motion/react";
import { cn } from "@/utils";

// indexed by (Math.log2(value) - 1) % colors.length
const TILE_COLORS = [
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

const TILE_FONT_SIZES = ["text-4xl", "text-3xl", "text-2xl", "text-xl"];

function TwentyFortyEightTile({
  tile: { value, id, isNew },
}: {
  tile: TwentyFortyEightTile;
}) {
  return (
    <motion.div
      layout
      layoutId={id}
      initial={isNew ? { opacity: 0, scale: 0 } : false}
      animate={{ opacity: 1, scale: 1 }}
      style={{ zIndex: value }}
      className={cn(
        "w-16 h-16 flex justify-center absolute items-center text-neutral-600 font-bold",
        value === 0
          ? "bg-neutral-400"
          : TILE_COLORS[(Math.log2(value) - 1) % TILE_COLORS.length],
        TILE_FONT_SIZES[value.toString().length - 1]
      )}
    >
      <span>{value}</span>
    </motion.div>
  );
}

function TwentyFortyEightBoard({ board }: { board: TwentyFortyEightBoard }) {
  return (
    <motion.div
      className="grid gap-2 w-fit bg-neutral-500 p-2 rounded-sm min-w-max select-none"
      style={{
        gridTemplateColumns: `repeat(${board.size}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: board.size * board.size }, (_, i) => (
        <motion.div className="w-16 h-16 bg-neutral-400" key={i}>
          {board.grid[i].map((tile) => (
            <TwentyFortyEightTile key={tile.id} tile={tile} />
          ))}
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function TwentyFortyEight() {
  const { isFocused } = useCurrentApplication();
  const [board, setBoard] = useState(makeBoard(4));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFocused) {
        return;
      }

      const maybeInt = Number.parseInt(e.key);

      if (e.key.startsWith("Arrow")) {
        setBoard(shiftBoard(board, e.key as any));
      } else if (e.key === "r") {
        setBoard(makeBoard(board.size));
      } else if (3 <= maybeInt && maybeInt <= 8) {
        setBoard(makeBoard(maybeInt));
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFocused, board, setBoard]);

  // TODO some sort of help menu for the controls
  return (
    <div className="bg-neutral-100 h-full min-h-fit flex items-center justify-center">
      <TwentyFortyEightBoard board={board}></TwentyFortyEightBoard>
    </div>
  );
}
