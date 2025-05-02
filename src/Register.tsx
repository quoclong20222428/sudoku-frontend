import { useState, Dispatch, SetStateAction } from "react";
import axios from "axios";
import Verify from "./Verify";
import "./App.css";

interface RegisterProps {
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
  setUserId: Dispatch<SetStateAction<string>>;
  setEmail: Dispatch<SetStateAction<string>>;
  setUsername: Dispatch<SetStateAction<string>>;
  setShowRegister: Dispatch<SetStateAction<boolean>>;
}

function Register({
  setIsLoggedIn,
  setUserId,
  setEmail,
  setUsername,
  setShowRegister,
}: RegisterProps) {
  const [email, setLocalEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setLocalUsername] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showVerification, setShowVerification] = useState<boolean>(false);

  const handleRegister = async () => {
    if (!email || !password || !username) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    try {
      const response = await axios.post<{
        access_token: string;
        user_id: string;
        email: string;
        username: string;
      }>("http://localhost:8000/register", { email, password, username });
      localStorage.setItem("token", response.data.access_token);
      setUserId(response.data.user_id);
      setEmail(response.data.email);
      setUsername(response.data.username);
      setError("");
      setShowVerification(true);
      alert(
        "Mã xác minh đã được gửi đến email của bạn. Vui lòng kiểm tra email để lấy mã."
      );
    } catch (error: any) {
      setError(error.response?.data?.detail || "Đăng ký thất bại");
    }
  };

  return (
    <div className="container">
      {showVerification ? (
        <>
          <h1 className="title">Xác Minh Tài Khoản</h1>
          <div className="input-container">
            <Verify
              email={email}
              setIsLoggedIn={setIsLoggedIn}
              setShowRegister={setShowRegister}
              verificationEndpoint="http://localhost:8000/verify-registration"
            />
          </div>
        </>
      ) : (
        <>
          <h1 className="title">Đăng Ký Tài Khoản</h1>
          <div className="input-container">
            <div className="control-group login">
              <label className="label">Tên của bạn</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setLocalUsername(e.target.value)}
                className="input-login"
              />
            </div>
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
        </>
      )}
    </div>
  );
}

export default Register;