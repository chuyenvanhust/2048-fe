const SIZE = 4;

export function cloneBoard(board) {
  return board.map(row => row.slice());
}

export function compressLine(line) {
  const nonZero = line.filter(v => v !== 0);
  const out = [];
  let score = 0;

  for (let i = 0; i < nonZero.length; ) {
    if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
      const merged = nonZero[i] * 2;
      out.push(merged);
      score += merged;
      i += 2;
    } else {
      out.push(nonZero[i]);
      i++;
    }
  }

  while (out.length < SIZE) out.push(0);
  const moved = !line.every((v, i) => v === out[i]);

  return { line: out, score, moved };
}

function transpose(board) {
  return board[0].map((_, c) => board.map(r => r[c]));
}

function reverseRows(board) {
  return board.map(row => [...row].reverse());
}

export function moveLeft(board) {
  let moved = false;
  let score = 0;
  const newBoard = board.map(row => {
    const res = compressLine(row);
    score += res.score;
    moved ||= res.moved;
    return res.line;
  });
  return { board: newBoard, score, moved };
}

export function moveRight(board) {
  const reversed = reverseRows(board);
  const res = moveLeft(reversed);
  return {
    board: reverseRows(res.board),
    score: res.score,
    moved: res.moved,
  };
}

export function moveUp(board) {
  const t = transpose(board);
  const res = moveLeft(t);
  return {
    board: transpose(res.board),
    score: res.score,
    moved: res.moved,
  };
}

export function moveDown(board) {
  const t = transpose(board);
  const res = moveRight(t);
  return {
    board: transpose(res.board),
    score: res.score,
    moved: res.moved,
  };
}

export function getEmptyCells(board) {
  const cells = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) cells.push([r, c]);
    }
  }
  return cells;
}

export function addRandomTile(board) {
  const empty = getEmptyCells(board);
  if (empty.length === 0) return board;

  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const value = Math.random() < 0.9 ? 2 : 4;

  const newBoard = cloneBoard(board);
  newBoard[r][c] = value;
  return newBoard;
}

export function isGameOver(board) {
  if (getEmptyCells(board).length > 0) return false;
  if (moveLeft(board).moved) return false;
  if (moveRight(board).moved) return false;
  if (moveUp(board).moved) return false;
  return !moveDown(board).moved;
}
