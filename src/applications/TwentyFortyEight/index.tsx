import useCurrentApplication from "@/hooks/useCurrentApplication";
import { useEffect, useState } from "react";
import {
  makeBoard,
  shiftBoard,
  type TwentyFortyEightBoard,
  type TwentyFortyEightTile,
} from "./board";
import { motion, useDomEvent } from "motion/react";
import { cn } from "@/utils";
import { useWindowEvent } from "@/hooks/useWindowEvent";
import { ArrowRight, ArrowRightIcon, HelpCircleIcon } from "lucide-react";
import { Popover } from "@/components/Popover";
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Kbd } from "@/components/Kbd";

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
  const { isFocused, isInsideWindowContent } = useCurrentApplication();
  const [board, setBoard] = useState(makeBoard(4));

  useWindowEvent(
    "keydown",
    (e) => {
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
    },
    [isFocused, board]
  );

  return (
    <div className="bg-neutral-100 text-neutral-500 h-full min-h-fit flex items-center justify-center relative">
      <TwentyFortyEightBoard board={board}></TwentyFortyEightBoard>
      <Popover defaultOpen>
        <PopoverTrigger className="absolute bottom-2 left-2 flex gap-2 p-1 rounded-md hover:bg-neutral-200">
          <HelpCircleIcon />
        </PopoverTrigger>
        <PopoverContent
          avoidCollisions={false}
          sideOffset={8}
          onInteractOutside={(e) =>
            !isInsideWindowContent(e.target) ? e.preventDefault() : undefined
          }
          side="top"
          align="start"
          className="py-1 px-2 border border-neutral-400 bg-neutral-100 rounded-md select-none flex gap-1 flex-col"
        >
          <h1 className="font-semibold ">Controls</h1>
          <div className="grid grid-cols-[auto_auto] justify-items-start gap-y-1 gap-x-2 text-sm">
            <span>Move tiles</span>
            <div className="flex items-center gap-0.5">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              <Kbd>←</Kbd>
              <Kbd>→</Kbd>
            </div>
            <span>Restart</span>
            <Kbd>R</Kbd>
            <span>Board size</span>
            <div className="flex items-center gap-0.5">
              <Kbd>1</Kbd>
              <ArrowRightIcon className="size-3" />
              <Kbd>8</Kbd>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
