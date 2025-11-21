import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/auth";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: searchParams.get('email') || "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (form.newPassword !== form.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (form.newPassword.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword({
        email: form.email,
        otp: form.otp,
        newPassword: form.newPassword
      });

      if (response.data?.success) {
        setMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
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
                  <i className="fas fa-lock fa-3x text-primary mb-3"></i>
                  <h2 className="fw-bold text-dark">Reset Password</h2>
                  <p className="text-muted">Enter OTP and new password</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-envelope me-2 text-primary"></i>
                      Email Address
                    </label>
                    <input 
                      className="form-control" 
                      type="email"
                      name="email"
                      value={form.email} 
                      onChange={handleChange}
                      placeholder="Enter your email" 
                      required 
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-key me-2 text-primary"></i>
                      OTP Code
                    </label>
                    <input 
                      className="form-control form-control-lg text-center" 
                      type="text"
                      name="otp"
                      value={form.otp} 
                      onChange={handleChange}
                      placeholder="Enter 6-digit OTP" 
                      maxLength="6"
                      required 
                    />
                    <small className="text-muted">Check your email for the OTP code</small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-lock me-2 text-primary"></i>
                      New Password
                    </label>
                    <input 
                      className="form-control" 
                      type="password"
                      name="newPassword"
                      value={form.newPassword} 
                      onChange={handleChange}
                      placeholder="Enter new password" 
                      required 
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-lock me-2 text-primary"></i>
                      Confirm Password
                    </label>
                    <input 
                      className="form-control" 
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword} 
                      onChange={handleChange}
                      placeholder="Confirm new password" 
                      required 
                    />
                  </div>
                  
                  <div className="d-grid">
                    <button 
                      className="btn btn-primary btn-lg" 
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Resetting...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check me-2"></i>
                          Reset Password
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {message && (
                  <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'} mt-3`}>
                    <i className={`fas ${message.includes('successfully') ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                    {message}
                  </div>
                )}

                <div className="text-center mt-4">
                  <Link to="/forgot-password" className="text-primary text-decoration-none me-3">
                    <i className="fas fa-arrow-left me-2"></i>
                    Back
                  </Link>
                  <Link to="/login" className="text-primary text-decoration-none">
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}