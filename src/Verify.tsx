import { Dispatch, SetStateAction, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./App.css";

interface VerifyProps {
  email: string;
  setIsLoggedIn?: Dispatch<SetStateAction<boolean>>;
  onVerifySuccess?: (code: string) => void;
  verificationEndpoint?: string;
}

function Verify({
  email,
  setIsLoggedIn,
  onVerifySuccess,
  verificationEndpoint,
}: VerifyProps) {
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleVerify = async () => {
    if (!verificationCode) {
      setError("Vui lòng nhập mã xác minh");
      return;
    }
    if (verificationEndpoint) {
      try {
        await axios.post(verificationEndpoint, {
          email,
          code: verificationCode,
        });
        setError("");
        setVerificationCode("");
        if (setIsLoggedIn) {
          setIsLoggedIn(true);
          navigate("/");
        }
        if (onVerifySuccess) {
          onVerifySuccess(verificationCode);
        }
      } catch (error: any) {
        setError(error.response?.data?.detail || "Xác minh thất bại");
      }
    } else {
      setError("");
      if (onVerifySuccess) {
        onVerifySuccess(verificationCode);
      }
    }
  };

  return (
    <>
      <div className="control-group login">
        <label className="label">Mã Xác Minh</label>
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          className="input-login"
        />
      </div>
      {error && <p className="error">{error}</p>}
      <div className="button-group">
        <button onClick={handleVerify} className="button login">
          Xác Minh
        </button>
        <button onClick={() => navigate(-1)} className="button login">
          Quay Lại
        </button>
      </div>
    </>
  );
}

export default Verify;
