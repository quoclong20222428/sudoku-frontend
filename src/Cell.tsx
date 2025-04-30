interface CellProps {
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  row: number;
  col: number;
  isEditable: boolean;
}

const Cell: React.FC<CellProps> = ({
  value,
  onChange,
  row,
  col,
  isEditable,
}) => {
  return (
    <input
      type="text"
      className={`cell row-${row} col-${col} ${isEditable ? "edited" : ""}`}
      value={value === 0 ? "" : value}
      onChange={onChange}
      maxLength={1}
      pattern="[1-9]"
      inputMode="numeric"
      disabled={isEditable}
    />
  );
};

export default Cell;
