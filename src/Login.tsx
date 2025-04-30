import { useState, Dispatch, SetStateAction } from "react";
import axios from "axios";
import "./App.css";

interface LoginProps {
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
  setUserId: Dispatch<SetStateAction<string>>;
  setUsername: Dispatch<SetStateAction<string>>;
  setShowRegister: Dispatch<SetStateAction<boolean>>;
}

function Login({
  setIsLoggedIn,
  setUserId,
  setUsername,
  setShowRegister,
}: LoginProps) {
  const [username, setLocalUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Vui lòng nhập tên đăng nhập và mật khẩu");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const response = await axios.post<{
        access_token: string;
        user_id: string;
        username: string;
      }>("http://localhost:8000/login", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      localStorage.setItem("token", response.data.access_token);
      setUserId(response.data.user_id);
      setUsername(response.data.username);
      setIsLoggedIn(true);
      setError("");
      setPassword("");
    } catch (error: any) {
      setError(error.response?.data?.detail || "Đăng nhập thất bại");
    }
  };

  return (
    <div className="container">
      <h1 className="title">Đăng Nhập Tài Khoản</h1>
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
          <button onClick={handleLogin} className="button login">
            Đăng Nhập
          </button>
          <button
            onClick={() => setShowRegister(true)}
            className="button login"
          >
            Đăng Ký
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
