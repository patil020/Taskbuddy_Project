// src/pages/ProjectEdit.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { updateProject, getProject } from "../api/project";
import { useAuth } from "../context/AuthContext";

export default function ProjectEdit() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", description: "" });
  const [originalForm, setOriginalForm] = useState({ name: "", description: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    getProject(id)
      .then(res => {
        const projectData = res.data;
        setForm(projectData);
        setOriginalForm(projectData);
        setLoading(false);
      })
      .catch(err => {
        setMsg("Failed to load project: " + (err.response?.data?.message || "Error"));
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    // Check if form has changes compared to original
    const formChanged = form.name !== originalForm.name || form.description !== originalForm.description;
    setHasChanges(formChanged);
  }, [form, originalForm]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await updateProject(id, form, user.id);
      setMsg("Project updated successfully!");
      setTimeout(() => navigate(`/projects/${id}`), 2000);
    } catch (err) {
      setMsg("Failed: " + (err.response?.data?.message || "Error"));
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to cancel?")) {
        setMsg("Changes cancelled. Redirecting...");
        setTimeout(() => navigate(`/projects/${id}`), 1000);
      }
    } else {
      setMsg("Cancelled. Redirecting...");
      setTimeout(() => navigate(`/projects/${id}`), 1000);
    }
  };

  if (loading) return <div className="container mt-4"><h4>Loading...</h4></div>;

  return (
    <div className="container mt-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/projects" className="text-decoration-none">Projects</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to={`/projects/${id}`} className="text-decoration-none">
              {form.name || 'Project Details'}
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">Edit</li>
        </ol>
      </nav>
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Edit Project</h3>
        <Link to={`/projects/${id}`} className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left"></i> Back to Project
        </Link>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Project Name</label>
          <input 
            type="text" 
            className="form-control" 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            placeholder="Enter project name" 
            required 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea 
            className="form-control" 
            name="description" 
            value={form.description} 
            onChange={handleChange} 
            placeholder="Enter project description" 
            rows="3"
          />
        </div>
        <button className="btn btn-primary me-2" type="submit" disabled={!hasChanges}>
          Update Project
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleCancel}>
          Cancel
        </button>
      </form>
      {msg && (
        <div className={`alert mt-3 ${msg.includes('Failed') ? 'alert-danger' : 'alert-success'}`}>
          {msg}
        </div>
      )}
      {hasChanges && (
        <div className="alert alert-warning mt-3">
          <small>⚠️ You have unsaved changes</small>
        </div>
      )}
    </div>
  );
}
