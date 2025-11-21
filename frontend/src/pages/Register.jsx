import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register as registerApi } from "../api/auth";
import { showSuccess, showError } from "../utils/toastUtils";
import Alert from "../components/Alert";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setSuccess("");
    try {
      const response = await registerApi(form);
      if (response.data.success) {
        setSuccess("Registration successful! Please login.");
        showSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        const errorMessage = response.data.message || "Registration failed";
        setMsg(errorMessage);
        showError(errorMessage);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message ||
          "Registration failed. Please check your details.";
      setMsg(errorMessage);
      showError(errorMessage);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <i className="fas fa-user-plus fa-3x text-primary mb-3"></i>
                  <h2 className="fw-bold text-dark">Create Your Account</h2>
                  <p className="text-muted">Sign up to start managing projects</p>
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

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-envelope me-2 text-primary"></i>
                      Email
                    </label>
                    <input
                      className="form-control form-control-lg"
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
                      <i className="fas fa-user-plus me-2"></i>
                      Register
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
                {success && (
                  <Alert 
                    type="success" 
                    message={success} 
                    onClose={() => setSuccess("")} 
                    className="mt-3" 
                  />
                )}

                <hr className="my-4" />

                <div className="card bg-light">
                  <div className="card-body">
                    <h6 className="card-title text-primary mb-3">
                      <i className="fas fa-info-circle me-2"></i>
                      Already have an account?
                    </h6>
                    <p className="small text-muted">
                      <Link to="/login" className="text-primary">
                        Login here
                      </Link>{" "}
                      to access your projects.
                    </p>
                  </div>
                </div>

                <div className="text-center mt-4">
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