import { useState, Dispatch, SetStateAction } from "react";
import axios from "axios";
import "./App.css";

interface RegisterProps {
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
  setUserId: Dispatch<SetStateAction<string>>;
  setUsername: Dispatch<SetStateAction<string>>;
  setShowRegister: Dispatch<SetStateAction<boolean>>;
}

function Register({
  setIsLoggedIn,
  setUserId,
  setUsername,
  setShowRegister,
}: RegisterProps) {
  const [username, setLocalUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleRegister = async () => {
    if (!username || !password) {
      setError("Vui lòng nhập tên đăng nhập và mật khẩu");
      return;
    }
    try {
      const response = await axios.post<{
        access_token: string;
        user_id: string;
        username: string;
      }>("http://localhost:8000/register", { username, password });
      localStorage.setItem("token", response.data.access_token);
      setUserId(response.data.user_id);
      setUsername(response.data.username);
      setIsLoggedIn(true);
      setError("");
      setPassword("");
    } catch (error: any) {
      setError(error.response?.data?.detail || "Đăng ký thất bại");
    }
  };

  return (
    <div className="container">
      <h1 className="title">Đăng Ký Tài Khoản</h1>
      <div className="input-container">
        <div className="control-group login">
          <label className="label">Tên đăng nhập:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setLocalUsername(e.target.value)}
            className="input-login"
          />
        </div>
        <div className="control-group login">
          <label className="label">Mật khẩu:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-login"
          />
        </div>
        {error && <p className="error">{error}</p>}
        <div className="button-group">
          <button onClick={handleRegister} className="button login">
            Đăng Ký
          </button>
          <button
            onClick={() => setShowRegister(false)}
            className="button login"
          >
            Quay lại Đăng Nhập
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
