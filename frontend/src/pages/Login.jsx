import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { showSuccess, showError } from "../utils/toastUtils";
import Alert from "../components/Alert";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [msg, setMsg] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg("");
    
    try {
      await login(form.username, form.password);
      showSuccess("Login successful! Redirecting...");
      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Invalid credentials";
      setMsg(errorMessage);
      showError(errorMessage);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <i className="fas fa-tasks fa-3x text-primary mb-3"></i>
                  <h2 className="fw-bold text-dark">Welcome to TaskBuddy</h2>
                  <p className="text-muted">Sign in to manage your projects</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-user me-2 text-primary"></i>
                      Username
                    </label>
                    <input 
                      className="form-control form-control-lg" 
                      type="text"
                      name="username" 
                      value={form.username} 
                      onChange={handleChange} 
                      placeholder="Enter your username" 
                      required 
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-lock me-2 text-primary"></i>
                      Password
                    </label>
                    <input 
                      className="form-control form-control-lg" 
                      type="password" 
                      name="password" 
                      value={form.password} 
                      onChange={handleChange} 
                      placeholder="Enter your password" 
                      required 
                    />
                  </div>
                  
                  <div className="d-grid">
                    <button className="btn btn-primary btn-lg" type="submit">
                      <i className="fas fa-sign-in-alt me-2"></i>
                      Sign In
                    </button>
                  </div>
                </form>

                {msg && (
                  <Alert 
                    type="error" 
                    message={msg} 
                    onClose={() => setMsg("")} 
                    className="mt-3" 
                  />
                )}

                <hr className="my-4" />

                <div className="card bg-light">
                  <div className="card-body">
                    <h6 className="card-title text-primary mb-3">
                      <i className="fas fa-info-circle me-2"></i>
                      Getting Started
                    </h6>
                    
                    <p className="small text-muted">
                      Don't have an account? <Link to="/register" className="text-primary">Register here</Link> to create a new account.
                      <br/>
                      Or create test accounts using the registration form.
                    </p>
                  </div>
                </div>

                <div className="text-center mt-4">
                  <p className="text-muted mb-2">
                    <Link to="/forgot-password" className="text-primary text-decoration-none">
                      <i className="fas fa-key me-1"></i>
                      Forgot Password?
                    </Link>
                  </p>
                  <p className="text-muted mb-2">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary text-decoration-none fw-semibold">
                      Sign Up
                    </Link>
                  </p>
                  <small className="text-muted">
                    <i className="fas fa-shield-alt me-1"></i>
                    Your data is secure with TaskBuddy
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
