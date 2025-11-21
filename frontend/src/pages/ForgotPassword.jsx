import React, { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await forgotPassword({ email });
      if (response.data?.success) {
        setSuccess(true);
        setMessage("OTP sent to your email successfully!");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to send OTP");
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
                  <i className="fas fa-key fa-3x text-primary mb-3"></i>
                  <h2 className="fw-bold text-dark">Forgot Password</h2>
                  <p className="text-muted">Enter your email to receive OTP</p>
                </div>

                {!success ? (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="form-label fw-semibold">
                        <i className="fas fa-envelope me-2 text-primary"></i>
                        Email Address
                      </label>
                      <input 
                        className="form-control form-control-lg" 
                        type="email"
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="Enter your email address" 
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
                            Sending OTP...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane me-2"></i>
                            Send OTP
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center">
                    <div className="alert alert-success">
                      <i className="fas fa-check-circle me-2"></i>
                      OTP sent successfully!
                    </div>
                    <p className="text-muted mb-4">
                      Check your email for the 6-digit OTP code.
                    </p>
                    <Link to={`/reset-password?email=${encodeURIComponent(email)}`} className="btn btn-primary">
                      <i className="fas fa-arrow-right me-2"></i>
                      Enter OTP
                    </Link>
                  </div>
                )}

                {message && !success && (
                  <div className="alert alert-danger mt-3">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {message}
                  </div>
                )}

                <div className="text-center mt-4">
                  <Link to="/login" className="text-primary text-decoration-none">
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Login
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