import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { InputGroup, Form, Button } from "react-bootstrap";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { getDefaultRoute, hydrateAuthSession } from "./auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill both fields");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5500/users/loginUser", {
        email,
        password,
      });

      if (res.data.success) {
        const auth = await hydrateAuthSession(res.data);
        navigate(res.data.redirectTo || getDefaultRoute(auth));
      } else {
        setError(res.data.error || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: "100vh",
        padding: "20px",
        background:
          "linear-gradient(135deg, #eff6ff 0%, #f8fafc 55%, #e2e8f0 100%)",
      }}
    >
      <div
        className="w-100"
        style={{
          maxWidth: "390px",
          borderRadius: "24px",
          background: "rgba(255,255,255,0.98)",
          boxShadow: "0 24px 50px rgba(15, 23, 42, 0.12)",
          padding: "32px 28px",
        }}
      >
        <div className="text-center mb-4">
          <div
            style={{
              width: "56px",
              height: "56px",
              margin: "0 auto 14px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, #0ea5e9 0%, #1e293b 100%)",
              display: "grid",
              placeItems: "center",
              color: "#fff",
              fontSize: "20px",
              fontWeight: 800,
            }}
          >
            A
          </div>
          <h3 style={{ marginBottom: "6px", fontWeight: 800, color: "#0f172a" }}>
            Login
          </h3>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            Sign in to continue
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: "#334155", fontWeight: 600, fontSize: "14px" }}
            >
              Email
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                height: "48px",
                borderRadius: "14px",
                border: "1px solid #dbe4ee",
                boxShadow: "none",
              }}
            />
          </div>

          <div className="mb-3">
            <label
              className="form-label"
              style={{ color: "#334155", fontWeight: 600, fontSize: "14px" }}
            >
              Password
            </label>
            <InputGroup>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  height: "48px",
                  borderRadius: "14px 0 0 14px",
                  border: "1px solid #dbe4ee",
                  boxShadow: "none",
                }}
              />
              <Button
                variant="light"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  borderRadius: "0 14px 14px 0",
                  border: "1px solid #dbe4ee",
                  borderLeft: "none",
                  background: "#f8fafc",
                  color: "#334155",
                  minWidth: "54px",
                }}
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </Button>
            </InputGroup>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <Form.Check type="checkbox" label="Remember me" />
            <a
              href="/forgot-password"
              style={{
                color: "#0ea5e9",
                fontSize: "13px",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Forgot?
            </a>
          </div>

          <button
            type="submit"
            className="btn w-100"
            disabled={loading}
            style={{
              height: "48px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #0ea5e9 0%, #1e293b 100%)",
              color: "#fff",
              fontWeight: 700,
              border: "none",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {error && (
            <div
              className="alert alert-danger text-center mt-3 mb-0"
              style={{ borderRadius: "14px", fontSize: "14px" }}
            >
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
