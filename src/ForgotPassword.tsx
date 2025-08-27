import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import Verify from "./Verify";
import { api } from "./api";

interface ForgotPasswordProps {
  onPasswordReset?: () => void;
}

function ForgotPassword({ onPasswordReset }: ForgotPasswordProps) {
  const [resetEmail, setResetEmail] = useState<string>("");
  const [resetCode, setResetCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [step, setStep] = useState<number>(1);
  const navigate = useNavigate();

  const handleSendCode = async () => {
    if (!resetEmail) {
      setError("Vui lòng nhập email");
      return;
    }
    try {
      await api.post("/forgot-password", {
        email: resetEmail,
      });
      setError("");
      setStep(2);
      alert("Mã xác minh đã được gửi đến email của bạn.");
    } catch (error: any) {
      setError(error.response?.data?.detail || "Gửi mã xác minh thất bại");
    }
  };

  const handleVerifySuccess = (code: string) => {
    setResetCode(code);
    setStep(3);
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      setError("Vui lòng nhập mật khẩu mới");
      return;
    }
    try {
      await api.post("/reset-password", {
        email: resetEmail,
        code: resetCode,
        new_password: newPassword,
      });
      setError("");
      setResetEmail("");
      setResetCode("");
      setNewPassword("");
      setStep(1);
      alert("Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập lại.");
      if (onPasswordReset) onPasswordReset();
      navigate("/login");
    } catch (error: any) {
      setError(error.response?.data?.detail || "Đặt lại mật khẩu thất bại");
    }
  };

  return (
    <div className="container">
      <h1 className="title">Quên Mật Khẩu</h1>
      <div className="input-container">
        {step === 1 && (
          <>
            <div className="control-group login">
              <label className="label">Email</label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="input-login"
              />
            </div>
            {error && <p className="error">{error}</p>}
            <div className="button-group">
              <button onClick={handleSendCode} className="button login">
                Gửi Mã Xác Minh
              </button>
              <button
                onClick={() => navigate("/login")}
                className="button login"
              >
                Quay Lại
              </button>
            </div>
          </>
        )}
        {step === 2 && (
          <Verify
            email={resetEmail}
            onVerifySuccess={handleVerifySuccess}
            verificationEndpoint="/verify-code"
          />
        )}
        {step === 3 && (
          <>
            <div className="control-group login">
              <label className="label">Mật Khẩu Mới:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-login"
              />
            </div>
            {error && <p className="error">{error}</p>}
            <div className="button-group">
              <button onClick={handleResetPassword} className="button login">
                Đặt Lại Mật Khẩu
              </button>
              <button
                onClick={() => navigate("/login")}
                className="button login"
              >
                Quay Lại
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
