import { Dispatch, SetStateAction, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import Verify from "./Verify";
import { api } from "./api";

interface RegisterProps {
  setIsLoggedIn: Dispatch<SetStateAction<boolean>>;
  setUserId: Dispatch<SetStateAction<string>>;
  setEmail: Dispatch<SetStateAction<string>>;
  setUsername: Dispatch<SetStateAction<string>>;
}

function Register({
  setIsLoggedIn,
  setUserId,
  setEmail,
  setUsername,
}: RegisterProps) {
  const [email, setLocalEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setLocalUsername] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showVerification, setShowVerification] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!email || !password || !username) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    try {
      const response = await api.post("/register", {
        email,
        password,
        username,
      });
      localStorage.setItem("token", response.data.access_token);
      setUserId(response.data.user_id);
      setEmail(response.data.email);
      setUsername(response.data.username);
      setError("");
      setShowVerification(true);
      alert("Mã xác minh đã được gửi đến email của bạn.");
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
              verificationEndpoint="/verify-registration"
              onVerifySuccess={() => navigate("/")} // Chuyển về trang chính sau khi xác minh
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
                onClick={() => navigate("/login")}
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
