import { useState, Dispatch, SetStateAction } from "react";
import axios from "axios";
import ForgotPassword from "./ForgotPassword";
import "./App.css";

interface LoginProps {
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
  setUserId: Dispatch<SetStateAction<string>>;
  setEmail: Dispatch<SetStateAction<string>>;
  setUsername: Dispatch<SetStateAction<string>>;
  setShowRegister: Dispatch<SetStateAction<boolean>>;
}

function Login({
  setIsLoggedIn,
  setUserId,
  setEmail,
  setUsername,
  setShowRegister,
}: LoginProps) {
  const [email, setLocalEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("username", email); // FastAPI OAuth2 sử dụng "username" cho email
      formData.append("password", password);

      const response = await axios.post<{
        access_token: string;
        user_id: string;
        email: string;
      }>("http://localhost:8000/login", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const token = response.data.access_token;
      localStorage.setItem("token", response.data.access_token);
      setUserId(response.data.user_id);
      setEmail(response.data.email);
      setIsLoggedIn(true);
      setError("");
      setPassword("");

      // Lấy thêm thông tin username
      axios
        .get("http://localhost:8000/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((meResponse) => {
          setUsername(meResponse.data.username || "");
        })
        .catch((err) => {
          console.error("Không thể lấy username:", err);
        });
    } catch (error: any) {
      setError(error.response?.data?.detail || "Đăng nhập thất bại");
    }
  };

  return (
    <div className="container">
      {showForgotPassword ? (
        <ForgotPassword setShowForgotPassword={setShowForgotPassword} />
      ) : (
        <>
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
              onClick={() => setShowForgotPassword(true)}
              className="forgot-password-link"
            >
              Quên mật khẩu?
            </a>
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
              {/* <button
                onClick={() => setShowForgotPassword(true)}
                className="button login"
              >
                Quên Mật Khẩu
              </button> */}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Login;
