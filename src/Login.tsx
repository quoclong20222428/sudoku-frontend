import { useState, Dispatch, SetStateAction } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./App.css";

interface LoginProps {
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
  setUserId: Dispatch<SetStateAction<string>>;
  setEmail: Dispatch<SetStateAction<string>>;
  setUsername: Dispatch<SetStateAction<string>>;
}

function Login({
  setIsLoggedIn,
  setUserId,
  setEmail,
  setUsername,
}: LoginProps) {
  const [email, setLocalEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const response = await axios.post(
        "http://localhost:8000/login",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const token = response.data.access_token;
      localStorage.setItem("token", token);
      setUserId(response.data.user_id);
      setEmail(response.data.email);
      setIsLoggedIn(true);
      setError("");
      setPassword("");

      axios
        .get("http://localhost:8000/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((meResponse) => {
          setUsername(meResponse.data.username || "");
        });
      navigate("/"); // Chuyển đến trang chính sau khi đăng nhập
    } catch (error: any) {
      setError(error.response?.data?.detail || "Đăng nhập thất bại");
    }
  };

  return (
    <div className="container">
      <h1 className="title">Đăng Nhập Tài Khoản</h1>
      <div className="input-container">
        <div className="control-group login">
          <label className="label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setLocalEmail(e.target.value)}
            className="input-login"
          />
        </div>
        <div className="control-group login">
          <label className="label">Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-login"
          />
        </div>
        {error && <p className="error">{error}</p>}
        <a
          onClick={() => navigate("/forgot-password")}
          className="forgot-password-link"
        >
          Quên mật khẩu?
        </a>
        <div className="button-group">
          <button onClick={handleLogin} className="button login">
            Đăng Nhập
          </button>
          <button
            onClick={() => navigate("/register")}
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
