export interface TwentyFortyEightTile {
  value: number;
  id: string;
  isNew: boolean;
}

export interface TwentyFortyEightBoard {
  size: number;
  // flat matrix of cells. note that cells can contain multiple tiles
  grid: TwentyFortyEightTile[][];
}

export function makeBoard(size: number = 4): TwentyFortyEightBoard {
  const board: TwentyFortyEightBoard = {
    size,
    grid: Array.from({ length: size * size }, () => []),
  };
  addRandomTile(board, 2);
  return board;
}

function makeTile(value: number): TwentyFortyEightTile {
  return {
    value,
    id: crypto.randomUUID(),
    isNew: true,
  };
}

// in-place
function addRandomTile({ grid }: TwentyFortyEightBoard, value: number): void {
  const emptyCells = grid
    .map((val, idx) => (val.length === 0 ? idx : -1))
    .filter((idx) => idx !== -1);

  if (emptyCells.length === 0) {
    return;
  }

  const randomIdx = Math.floor(Math.random() * emptyCells.length);
  grid[emptyCells[randomIdx]].push(makeTile(value));
}

function shiftRowLeft(row: TwentyFortyEightTile[][]): TwentyFortyEightTile[][] {
  const flatFilteredRow = row
    .filter((cell) => cell.length > 0)
    .map((cell) => cell.reduce((p, c) => (c.value > p.value ? c : p)));

  const result: TwentyFortyEightTile[][] = [];
  let skipNext = false;

  for (let i = 0; i < flatFilteredRow.length; i++) {
    if (skipNext) {
      skipNext = false;
      continue;
    }

    const currentCell = { ...flatFilteredRow[i], isNew: false };
    const nextCell = flatFilteredRow[i + 1]
      ? { ...flatFilteredRow[i + 1], isNew: false }
      : undefined; // might be oob access

    if (nextCell && currentCell.value === nextCell.value) {
      result.push([currentCell, nextCell, makeTile(currentCell.value * 2)]);
      skipNext = true;
    } else {
      result.push([currentCell]);
    }
  }

  // pad RHS with empty cells
  while (result.length < row.length) {
    result.push([]);
  }

  return result;
}

export type Direction = "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown";

export function shiftBoard(
  oldBoard: TwentyFortyEightBoard,
  direction: Direction,
  newValue: number | null = Math.random() > 0.9 ? 4 : 2
): TwentyFortyEightBoard {
  const { size, grid: oldGrid } = oldBoard;
  const newBoard = makeBoard(size);
  const { grid: newGrid } = newBoard;

  const getRow = (rowIdx: number) =>
    oldGrid.slice(rowIdx * size, (rowIdx + 1) * size);

  const setRow = (rowIdx: number, row: TwentyFortyEightTile[][]) => {
    for (let i = 0; i < size; i++) {
      newGrid[rowIdx * size + i] = row[i];
    }
  };

  const getColumn = (colIdx: number) =>
    Array.from({ length: size }, (_, i) => oldGrid[i * size + colIdx]);

  const setColumn = (colIdx: number, col: TwentyFortyEightTile[][]) => {
    for (let i = 0; i < size; i++) {
      newGrid[i * size + colIdx] = col[i];
    }
  };

  if (direction === "ArrowLeft") {
    for (let i = 0; i < size; i++) {
      setRow(i, shiftRowLeft(getRow(i)));
    }
  } else if (direction === "ArrowRight") {
    for (let i = 0; i < size; i++) {
      setRow(i, shiftRowLeft(getRow(i).reverse()).reverse());
    }
  } else if (direction === "ArrowUp") {
    for (let i = 0; i < size; i++) {
      setColumn(i, shiftRowLeft(getColumn(i)));
    }
  } else if (direction === "ArrowDown") {
    for (let i = 0; i < size; i++) {
      setColumn(i, shiftRowLeft(getColumn(i).reverse()).reverse());
    }
  }

  if (newValue !== null) {
    addRandomTile(newBoard, newValue);
  }

  return newBoard;
}
