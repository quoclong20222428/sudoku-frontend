type Puzzle = number[][];
interface PuzzleResult {
  puzzle: Puzzle;
  solution: Puzzle;
}

function shuffleArray(arr: number[]): number[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isSafe(board: Puzzle, row: number, col: number, num: number): boolean {
  for (let x = 0; x < 9; x++) {
    if (
      board[row][x] === num ||
      board[x][col] === num ||
      board[3 * Math.floor(row / 3) + Math.floor(x / 3)][
        3 * Math.floor(col / 3) + (x % 3)
      ] === num
    ) {
      return false;
    }
  }
  return true;
}

function fillBoard(board: Puzzle): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (let num of nums) {
          if (isSafe(board, row, col, num)) {
            board[row][col] = num;
            if (fillBoard(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function generateFullBoard(): Puzzle {
  const board: Puzzle = Array.from({ length: 9 }, () => Array(9).fill(0));
  fillBoard(board);
  return board;
}

function solveSudoku(board: Puzzle): Puzzle[] {
  const solutions: Puzzle[] = [];
  solve(board, solutions, 2);
  return solutions;
}

function solve(board: Puzzle, solutions: Puzzle[], maxSolutions: number): void {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isSafe(board, row, col, num)) {
            board[row][col] = num;
            solve(board, solutions, maxSolutions);
            if (solutions.length >= maxSolutions) return;
            board[row][col] = 0;
          }
        }
        return;
      }
    }
  }
  solutions.push(JSON.parse(JSON.stringify(board)));
}

function generatePuzzle(
  level: "easy" | "medium" | "hard" = "easy"
): PuzzleResult {
  const fullBoard = generateFullBoard();
  const puzzle: Puzzle = JSON.parse(JSON.stringify(fullBoard));
  let attempts = level === "hard" ? 60 : level === "medium" ? 45 : 30;

  while (attempts > 0) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);

    if (puzzle[row][col] !== 0) {
      const backup = puzzle[row][col];
      puzzle[row][col] = 0;
      const solutions = solveSudoku(JSON.parse(JSON.stringify(puzzle)));
      if (solutions.length !== 1) {
        puzzle[row][col] = backup;
        attempts--;
      }
    }
  }

  return { puzzle, solution: fullBoard };
}

export { generatePuzzle };
