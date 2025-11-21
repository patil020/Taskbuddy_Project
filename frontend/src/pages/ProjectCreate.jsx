// src/pages/ProjectCreate.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { createProject } from "../api/project";
import { showSuccess, showError } from "../utils/toastUtils";
import Alert from "../components/Alert";

export default function ProjectCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    name: "", 
    description: "",
    dueDate: ""
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!user) {
      setMsg("Please log in to create a project");
      return;
    }

    setLoading(true);
    try {
      const projectData = {
        name: form.name,
        description: form.description,
        managerId: user.id,
        ...(form.dueDate && { dueDate: form.dueDate })
      };

      await createProject(projectData);
      showSuccess("Project created successfully!");
      setForm({ name: "", description: "", dueDate: "" });
      
      setTimeout(() => {
        navigate("/projects");
      }, 1500);
    } catch (err) {
      console.error("Error creating project:", err);
      const errorMessage = "Failed to create project: " + (err.response?.data?.message || err.message || "Unknown error");
      setMsg(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container">
        <div className="alert alert-warning text-center">
          <h4>Authentication Required</h4>
          <p>Please log in to create a project.</p>
          <button className="btn btn-primary" onClick={() => navigate("/login")}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1><i className="fas fa-plus-circle me-2"></i>Create New Project</h1>
        <p>Start a new project and invite your team members</p>
      </div>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header bg-transparent">
                <h5 className="mb-0">
                  <i className="fas fa-project-diagram me-2 text-primary"></i>
                  Project Details
                </h5>
              </div>
              
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-tag me-2"></i>
                      Project Name *
                    </label>
                    <input 
                      type="text" 
                      className="form-control form-control-lg" 
                      name="name" 
                      value={form.name} 
                      onChange={handleChange} 
                      placeholder="Enter a descriptive project name" 
                      required 
                      disabled={loading}
                    />
                    <small className="form-text text-muted">
                      Choose a clear, descriptive name for your project
                    </small>
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-align-left me-2"></i>
                      Description
                    </label>
                    <textarea 
                      className="form-control" 
                      name="description" 
                      value={form.description} 
                      onChange={handleChange} 
                      placeholder="Describe the project goals, objectives, and key deliverables..." 
                      rows="4"
                      disabled={loading}
                    />
                    <small className="form-text text-muted">
                      Provide details about the project scope and objectives
                    </small>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-calendar-alt me-2"></i>
                      Due Date (Optional)
                    </label>
                    <input 
                      type="date" 
                      className="form-control" 
                      name="dueDate" 
                      value={form.dueDate} 
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      disabled={loading}
                    />
                    <small className="form-text text-muted">
                      Set a target completion date for this project
                    </small>
                  </div>

                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary me-md-2" 
                      onClick={() => navigate("/projects")}
                      disabled={loading}
                    >
                      <i className="fas fa-arrow-left me-1"></i>
                      Cancel
                    </button>
                    <button 
                      className="btn btn-success" 
                      type="submit"
                      disabled={loading || !form.name.trim()}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Creating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check me-1"></i>
                          Create Project
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {msg && (
                  <Alert 
                    type={msg.includes('success') ? 'success' : 'error'} 
                    message={msg} 
                    onClose={() => setMsg("")} 
                    className="mt-4" 
                  />
                )}
              </div>
            </div>

            <div className="card mt-4">
              <div className="card-body text-center bg-light">
                <h6 className="text-muted mb-2">
                  <i className="fas fa-lightbulb me-2"></i>
                  Next Steps
                </h6>
                <small className="text-muted">
                  After creating your project, you'll be able to add team members, create tasks, and track progress.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
