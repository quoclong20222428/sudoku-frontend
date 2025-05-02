import { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import Board from "./Board";
import { generatePuzzle } from "./sudokuGenerator";
import Login from "./Login";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword"; // Import ForgotPassword
import "./App.css";

interface Game {
  id: number;
  user_id: string;
  board: number[][];
  initial_puzzle: number[][];
  solution: number[][];
  time_played: number;
  level: "easy" | "medium" | "hard";
  is_hidden: boolean;
}

interface Hint {
  row: number;
  col: number;
  value: number;
  explanation: string;
  is_incorrect: boolean;
}

function App() {
  const [board, setBoard] = useState<number[][]>([]);
  const [initialPuzzle, setInitialPuzzle] = useState<number[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [editedCells, setEditedCells] = useState<boolean[][]>([]);
  const [level, setLevel] = useState<"easy" | "medium" | "hard">("easy");
  const [timePlayed, setTimePlayed] = useState<number>(0);
  const [userId, setUserId] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [games, setGames] = useState<Game[]>([]);
  const [currentGameId, setCurrentGameId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hint, setHint] = useState<Hint | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [showRegister, setShowRegister] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false); // Thêm state cho ForgotPassword

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:8000/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(
          (response: AxiosResponse<{ user_id: string; username: string; email: string }>) => {
            console.log("Response from /me:", response.data); // Debug
            setUserId(response.data.user_id);
            setUsername(response.data.username || ""); // Fallback nếu username không có
            setEmail(response.data.email);
            setIsLoggedIn(true);
          }
        )
        .catch((error) => {
          console.error("Error fetching /me:", error); // Debug
          localStorage.removeItem("token");
          setIsLoggedIn(false);
          setUserId("");
          setUsername("");
          setEmail("");
        });
    }
  }, []);

  useEffect(() => {
    if (userId && isLoggedIn) {
      axios
        .get<Game[]>(`http://localhost:8000/game/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response: AxiosResponse<Game[]>) => setGames(response.data))
        .catch((error: unknown) =>
          console.error("Lỗi khi lấy danh sách trò chơi:", error)
        );
    }
  }, [userId, isLoggedIn]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setTimePlayed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserId("");
    setUsername("");
    setEmail("");
    setGames([]);
    setBoard([]);
    setEditedCells([]);
    setSolution([]);
    setCurrentGameId(null);
    setTimePlayed(0);
    setIsPlaying(false);
  };

  const handleNewGame = (selectedLevel: "easy" | "medium" | "hard") => {
    const { puzzle, solution: generatedSolution } =
      generatePuzzle(selectedLevel);
    const newEditedCells = puzzle.map((row) => row.map((cell) => cell !== 0));
    setBoard(puzzle);
    setEditedCells(newEditedCells);
    setInitialPuzzle(puzzle);
    setSolution(generatedSolution);
    setTimePlayed(0);
    setCurrentGameId(null);
    setIsPlaying(true);

    const payload = {
      user_id: userId,
      board: puzzle,
      initial_puzzle: puzzle,
      solution: generatedSolution,
      time_played: 0,
      level: selectedLevel,
      is_hidden: true,
    };

    axios
      .post<{ id: number }>("http://localhost:8000/game", payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((response: AxiosResponse<{ id: number }>) => {
        setCurrentGameId(response.data.id);
      })
      .catch((error: unknown) =>
        console.error("Lỗi khi tự động lưu trò chơi:", error)
      );
  };

  const statusSaveGame = (is_hidden: boolean) => {
    const payload = {
      board,
      time_played: timePlayed,
      is_hidden,
    };

    axios
      .put(`http://localhost:8000/game/${currentGameId}`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then(() => {
        axios
          .get<Game[]>(`http://localhost:8000/game/${userId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })
          .then((response: AxiosResponse<Game[]>) => setGames(response.data))
          .catch((error: unknown) =>
            console.error("Lỗi khi lấy danh sách trò chơi:", error)
          );
      })
      .catch((error: unknown) =>
        console.error("Lỗi khi cập nhật trò chơi:", error)
      );
  };

  const handleSaveGame = () => {
    if (!board.length) {
      alert("Không có trò chơi để lưu! Hãy bắt đầu một trò chơi mới trước.");
      return;
    }

    if (!currentGameId) {
      alert("Không tìm thấy trò chơi để lưu. Vui lòng bắt đầu lại.");
      return;
    }

    if (
      !initialPuzzle.length ||
      initialPuzzle.length !== 9 ||
      initialPuzzle[0].length !== 9
    ) {
      alert("Đề bài gốc không hợp lệ. Vui lòng bắt đầu lại trò chơi.");
      return;
    }

    statusSaveGame(false);
  };

  const handleLoadGame = (game: Game) => {
    setBoard(game.board);
    setInitialPuzzle(game.initial_puzzle);
    setSolution(game.solution);
    const newEditedCells = game.initial_puzzle.map((row) =>
      row.map((cell) => cell !== 0)
    );
    setEditedCells(newEditedCells);
    setLevel(game.level);
    setTimePlayed(game.time_played);
    setCurrentGameId(game.id);
    setIsPlaying(true);
  };

  const handleDeleteGame = (gameId: number) => {
    axios
      .delete(`http://localhost:8000/game/${gameId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then(() => {
        setGames(games.filter((game) => game.id !== gameId));
        if (currentGameId === gameId) {
          setBoard([]);
          setEditedCells([]);
          setSolution([]);
          setCurrentGameId(null);
          setTimePlayed(0);
          setIsPlaying(false);
        }
      })
      .catch((error: unknown) => console.error("Lỗi khi xóa trò chơi:", error));
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    if (editedCells[row][col]) {
      return;
    }
    const newBoard = [...board];
    newBoard[row][col] = parseInt(value) || 0;
    setBoard(newBoard);
  };

  const handleGetHint = async () => {
    if (!currentGameId) {
      alert("Hãy bắt đầu một trò chơi trước khi yêu cầu gợi ý!");
      return;
    }

    try {
      const response: AxiosResponse<Hint> = await axios.get(
        `http://localhost:8000/hint/${currentGameId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const { row, col, value, explanation, is_incorrect } = response.data;
      setHint({ row, col, value, explanation, is_incorrect });
    } catch (error: unknown) {
      console.error("Lỗi khi lấy gợi ý:", error);
      alert("Không thể lấy gợi ý. Vui lòng thử lại.");
    }
  };

  const handleApplyHint = () => {
    if (!hint) return;

    const { row, col, value } = hint;
    const newBoard = [...board];
    newBoard[row][col] = value;
    setBoard(newBoard);
    setHint(null);
    handleSaveGame();
  };

  const handleCancelHint = () => {
    setHint(null);
  };

  const handleCheckSolution = () => {
    const isValidGroup = (group: number[]): boolean => {
      const nums = group.filter((num) => num !== 0);
      const uniqueNums = new Set(nums);
      return nums.length === uniqueNums.size;
    };

    for (let i = 0; i < 9; i++) {
      const row = board[i];
      const col = board.map((row) => row[i]);
      if (
        !isValidGroup(row) ||
        row.includes(0) ||
        !isValidGroup(col) ||
        col.includes(0)
      ) {
        alert("Có lỗi trong lời giải.");
        return;
      }
    }

    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const box: number[] = [];
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            box.push(board[boxRow * 3 + i][boxCol * 3 + j]);
          }
        }
        if (!isValidGroup(box) || box.includes(0)) {
          alert("Có lỗi trong lời giải.");
          return;
        }
      }
    }

    alert(
      `Chúc mừng! Lời giải chính xác. Bạn đã giải đố trong ${formatTime(
        timePlayed
      )}.`
    );
  };

  const mapLevel = (level: string): string => {
    switch (level) {
      case "easy":
        return "Dễ";
      case "medium":
        return "Trung Bình";
      case "hard":
        return "Khó";
      default:
        return level;
    }
  };

  const refreshUserData = () => {
    const token = localStorage.getItem("token");
    if (token && isLoggedIn) {
      axios
        .get("http://localhost:8000/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(
          (response: AxiosResponse<{ user_id: string; username: string; email: string }>) => {
            console.log("Refreshed user data from /me:", response.data);
            setUserId(response.data.user_id);
            setUsername(response.data.username || "");
            setEmail(response.data.email);
          }
        )
        .catch((error) => {
          console.error("Error refreshing user data:", error);
          localStorage.removeItem("token");
          setIsLoggedIn(false);
          setUserId("");
          setUsername("");
          setEmail("");
        });
    }
  };

  if (!isLoggedIn) {
    return showRegister ? (
      <Register
        setIsLoggedIn={setIsLoggedIn}
        setUserId={setUserId}
        setEmail={setEmail}
        setUsername={setUsername}
        setShowRegister={setShowRegister}
      />
    ) : showForgotPassword ? (
      <ForgotPassword
        setShowForgotPassword={setShowForgotPassword}
        onPasswordReset={refreshUserData} // Gọi hàm làm mới dữ liệu
      />
    ) : (
      <Login
        setIsLoggedIn={setIsLoggedIn}
        setUserId={setUserId}
        setEmail={setEmail}
        setUsername={setUsername}
        setShowRegister={setShowRegister}
      />
    );
  }

  return (
    <div className="container">
      <h1 className="title">Trò Chơi Sudoku - Xin chào {username || email}!</h1>
      <div className="controls">
        <button onClick={handleLogout} className="button logout">
          Đăng Xuất
        </button>
        <div className="control-group">
          <label className="label">Chọn Cấp Độ:</label>
          <select
            value={level}
            onChange={(e) =>
              setLevel(e.target.value as "easy" | "medium" | "hard")
            }
            className="select"
          >
            <option value="easy">Dễ</option>
            <option value="medium">Trung Bình</option>
            <option value="hard">Khó</option>
          </select>
        </div>
        {isPlaying && (
          <div className="control-group">
            <label className="label">Thời Gian: </label>
            <span className="timer">{formatTime(timePlayed)}</span>
          </div>
        )}
        <div className="button-group">
          <button onClick={() => handleNewGame(level)} className="button">
            Trò Chơi Mới
          </button>
          <button onClick={handleSaveGame} className="button">
            Lưu Trò Chơi
          </button>
          <button
            onClick={handleCheckSolution}
            className="button check-solution"
          >
            Kiểm Tra Lời Giải
          </button>
          <button onClick={handleGetHint} className="button hint">
            Gợi Ý
          </button>
          <button
            onClick={() => setShowForgotPassword(true)}
            className="button forgot-password"
          >
            Quên Mật Khẩu
          </button>
        </div>
        <Board
          board={board}
          editedCells={editedCells}
          onCellChange={handleCellChange}
        />
        {hint && (
          <div className="hint-container">
            <p className="hint-explanation">
              {hint.is_incorrect
                ? `Số hiện tại không đúng so với lời giải. ${hint.explanation}`
                : hint.explanation}
            </p>
            <div className="hint-actions">
              <button onClick={handleApplyHint} className="button hint-apply">
                Áp dụng
              </button>
              <button onClick={handleCancelHint} className="button hint-cancel">
                Hủy
              </button>
            </div>
          </div>
        )}
        <div className="saved-games">
          <h2>Trò Chơi Đã Lưu</h2>
          <ul>
            {games.map((game) => (
              <li key={game.id}>
                <span>
                  Cấp Độ: {mapLevel(game.level)}, Thời Gian:{" "}
                  {formatTime(game.time_played)}
                </span>
                <button className="button" onClick={() => handleLoadGame(game)}>
                  Tiếp tục
                </button>
                <button
                  className="button delete"
                  onClick={() => handleDeleteGame(game.id)}
                >
                  Xóa
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;