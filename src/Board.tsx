import Cell from "./Cell";

interface BoardProps {
  board: number[][];
  editedCells: boolean[][];
  onCellChange: (row: number, col: number, value: string) => void;
}

const Board: React.FC<BoardProps> = ({ board, editedCells, onCellChange }) => {
  return (
    <div className="board">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            row={rowIndex}
            col={colIndex}
            value={cell}
            isEditable={editedCells?.[rowIndex]?.[colIndex] ?? false}
            onChange={(e) => onCellChange(rowIndex, colIndex, e.target.value)}
          />
        ))
      )}
    </div>
  );
};

export default Board;