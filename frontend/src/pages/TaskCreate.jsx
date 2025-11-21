// src/pages/TaskCreate.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createTask } from "../api/task";
import { getProjectMembers } from "../api/member";
import ErrorMessage from "../components/ErrorMessage";
import { showSuccess, showError } from "../utils/toastUtils";
import Alert from "../components/Alert";

export default function TaskCreate() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    title: "", 
    description: "", 
    priority: "MEDIUM",
    dueDate: "",
    assignedUserId: ""
  });
  const [projectMembers, setProjectMembers] = useState([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load project members for assignment
    if (projectId) {
      getProjectMembers(projectId)
        .then(res => {
          setProjectMembers(res.data?.data || res.data || []);
        })
        .catch(err => {
          console.error("Error loading project members:", err);
          setProjectMembers([]); // fallback to empty array
          // Optionally show a user-friendly error message
          showError('Failed to load project members. Please try again later.');
        });
    }
  }, [projectId]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMsg("");
    
    try {
      const taskData = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        projectId: projectId,
        ...(form.dueDate && { dueDate: form.dueDate }),
        ...(form.assignedUserId && { assignedUserId: parseInt(form.assignedUserId) })
      };

      await createTask(taskData);
      showSuccess("Task created successfully!");
      setTimeout(() => navigate(`/projects/${projectId}`), 1500);
    } catch (error) {
      console.error("Error creating task:", error);
      showError('Failed to create task: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="fas fa-plus-circle me-2"></i>
                Create New Task
              </h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">
                    <i className="fas fa-heading me-2 text-primary"></i>
                    Task Title *
                  </label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="title" 
                    value={form.title} 
                    onChange={handleChange} 
                    placeholder="Enter a descriptive task title" 
                    required 
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">
                    <i className="fas fa-align-left me-2 text-primary"></i>
                    Description
                  </label>
                  <textarea 
                    className="form-control" 
                    name="description" 
                    value={form.description} 
                    onChange={handleChange} 
                    placeholder="Describe what needs to be done..." 
                    rows="4"
                  />
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        <i className="fas fa-flag me-2 text-primary"></i>
                        Priority
                      </label>
                      <select 
                        className="form-select" 
                        name="priority" 
                        value={form.priority} 
                        onChange={handleChange}
                      >
                        <option value="LOW">🟢 Low Priority</option>
                        <option value="MEDIUM">🟡 Medium Priority</option>
                        <option value="HIGH">🔴 High Priority</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        <i className="fas fa-calendar me-2 text-primary"></i>
                        Due Date (Optional)
                      </label>
                      <input 
                        type="date" 
                        className="form-control" 
                        name="dueDate" 
                        value={form.dueDate} 
                        onChange={handleChange} 
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    <i className="fas fa-user me-2 text-primary"></i>
                    Assign To *
                  </label>
                  <select 
                    className="form-select" 
                    name="assignedUserId" 
                    value={form.assignedUserId} 
                    onChange={handleChange}
                    required
                  >
                    {Array.isArray(projectMembers) && projectMembers.map(member => (
                      <option key={member.userId} value={member.userId}>
                        {member.userName} ({member.role})
                      </option>
                    ))}
                  </select>
                  <small className="form-text text-muted">
                    You must assign this task to a project member
                  </small>
                </div>

                {/* Task Preview */}
                {form.title && (
                  <div className="mb-3">
                    <label className="form-label">Preview</label>
                    <div className="card bg-light">
                      <div className="card-body py-2">
                        <h6 className="mb-1">{form.title}</h6>
                        {form.description && (
                          <p className="text-muted small mb-1">{form.description}</p>
                        )}
                        <div>
                          <span className={`badge bg-${form.priority === 'HIGH' ? 'danger' : form.priority === 'MEDIUM' ? 'warning' : 'success'}`}>
                            {form.priority}
                          </span>
                          {form.dueDate && (
                            <span className="badge bg-info ms-2">
                              Due: {new Date(form.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          {form.assignedUserId && Array.isArray(projectMembers) && (
                            <span className="badge bg-secondary ms-2">
                              Assigned to: {projectMembers.find(m => m.userId == form.assignedUserId)?.userName || 'Unknown'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button type="button" 
                          className="btn btn-outline-secondary me-md-2" 
                          onClick={() => navigate(`/projects/${projectId}`)}>
                    <i className="fas fa-times me-2"></i>Cancel
                  </button>
                  <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check me-2"></i>Create Task
                      </>
                    )}
                  </button>
                </div>
              </form>

              <ErrorMessage error={error} onClose={() => setError(null)} />
              
              {msg && (
                <Alert 
                  type="success" 
                  message={msg} 
                  onClose={() => setMsg("")} 
                  className="mt-3" 
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

