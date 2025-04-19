export function makeBoard(size: number = 4): number[] {
  const board = new Array<number>(size * size).fill(0);
  addRandomTile(board, 2);
  return board;
}

function getRandomEmptyCell(board: number[]): number {
  const emptyCells = board
    .map((val, idx) => (val === 0 ? idx : -1))
    .filter((idx) => idx !== -1);
  const randomIdx = Math.floor(Math.random() * emptyCells.length);
  return emptyCells[randomIdx];
}

export function addRandomTile(board: number[], value: number): void {
  board[getRandomEmptyCell(board)] = value;
}

function shiftRowLeft(row: number[]): number[] {
  const filtered = row.filter((val) => val !== 0);
  const merged: number[] = [];
  let skip = false;

  for (let i = 0; i < filtered.length; i++) {
    if (skip) {
      skip = false;
      continue;
    }
    if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
      merged.push(filtered[i] * 2);
      skip = true;
    } else {
      merged.push(filtered[i]);
    }
  }

  while (merged.length < row.length) {
    merged.push(0);
  }

  return merged;
}
export function shiftBoard(
  board: number[],
  direction: "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown",
  size: number = 4
): number[] {
  const newBoard = new Array<number>(size * size).fill(0);

  const getRow = (rowIdx: number) =>
    board.slice(rowIdx * size, (rowIdx + 1) * size);

  const setRow = (rowIdx: number, row: number[]) => {
    for (let i = 0; i < size; i++) {
      newBoard[rowIdx * size + i] = row[i];
    }
  };

  const getColumn = (colIdx: number) =>
    Array.from({ length: size }, (_, i) => board[i * size + colIdx]);

  const setColumn = (colIdx: number, col: number[]) => {
    for (let i = 0; i < size; i++) {
      newBoard[i * size + colIdx] = col[i];
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

  return newBoard;
}
