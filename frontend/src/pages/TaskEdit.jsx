// src/pages/TaskEdit.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getTask, updateTask, reassignTask } from "../api/task";
// Use member API to fetch project members rather than user API
import { getProjectMembers } from "../api/member";
import { useAuth } from "../context/AuthContext";


export default function TaskEdit() {
  const [notAllowed, setNotAllowed] = useState(false);
  const { user } = useAuth();
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [projectMembers, setProjectMembers] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
    assignedUserId: ""
  });
  const [originalForm, setOriginalForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
    assignedUserId: ""
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (taskId && projectId) {
      Promise.all([
        getTask(taskId),
        getProjectMembers(projectId)
      ]).then(([taskResponse, membersResponse]) => {
        const taskData = taskResponse.data?.data || taskResponse.data || {};
        const membersData = membersResponse.data?.data || membersResponse.data || [];
        setTask(taskData);
        setProjectMembers(membersData);
        const formData = {
          title: taskData.title || "",
          description: taskData.description || "",
          priority: taskData.priority || "MEDIUM",
          dueDate: taskData.dueDate || "",
          assignedUserId: taskData.assignedUserId || ""
        };
        setForm(formData);
        setOriginalForm(formData);
        setLoading(false);
        // Check permission after loading task and user
        if (user && taskData.assignedUserId && user.id !== taskData.assignedUserId) {
          setNotAllowed(true);
          setTimeout(() => navigate(`/projects/${projectId}/tasks`), 2500);
        }
      })
      .catch(err => {
        console.error("Error loading data:", err);
        setMsg("Error loading task or project member details");
        setLoading(false);
      });
    }
  }, [taskId, projectId, user, navigate, projectId]);

  useEffect(() => {
    // Check if form has changes compared to original
    const formChanged = 
      form.title !== originalForm.title || 
      form.description !== originalForm.description ||
      form.priority !== originalForm.priority ||
      form.dueDate !== originalForm.dueDate ||
      form.assignedUserId !== originalForm.assignedUserId;
    setHasChanges(formChanged);
  }, [form, originalForm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update basic task info, always send assignedUserId and projectId
      await updateTask(taskId, {
        title: form.title,
        description: form.description,
        priority: form.priority,
        dueDate: form.dueDate,
        assignedUserId: form.assignedUserId || task.assignedUserId,
        projectId: projectId
      });

      // If assignee changed, reassign the task
      if (form.assignedUserId && form.assignedUserId !== task.assignedUserId) {
        // Reassign the task to the selected user. Backend uses the authenticated user
        // from the JWT, so we only pass the task ID and new assignee ID.
        await reassignTask(taskId, form.assignedUserId);
      }

      setMsg("Task updated successfully!");
      setTimeout(() => {
        navigate(`/projects/${projectId}/tasks`);
      }, 1500);
    } catch (error) {
      console.error("Error updating task:", error);
      setMsg("Error updating task. Please try again.");
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to cancel?")) {
        setMsg("Changes cancelled. Redirecting...");
        setTimeout(() => navigate(`/projects/${projectId}/tasks`), 1000);
      }
    } else {
      setMsg("Cancelled. Redirecting...");
      setTimeout(() => navigate(`/projects/${projectId}/tasks`), 1000);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  if (notAllowed) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
          <i className="fas fa-exclamation-triangle me-2"></i>
          You are not allowed to edit this task. Redirecting to task list...
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/projects" className="text-decoration-none">Projects</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to={`/projects/${projectId}`} className="text-decoration-none">Project</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to={`/projects/${projectId}/tasks`} className="text-decoration-none">Tasks</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">Edit Task</li>
            </ol>
          </nav>

          <div className="card shadow">
            <div className="card-header bg-warning text-dark">
              <h4 className="mb-0">
                <i className="fas fa-edit me-2"></i>Edit Task
                {task && task.assignedUserName && (
                  <small className="ms-3 text-muted">
                    Currently assigned to: <strong>{task.assignedUserName}</strong>
                  </small>
                )}
              </h4>
            </div>
            
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Task Title</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="title" 
                    value={form.title} 
                    onChange={handleChange} 
                    placeholder="Enter task title" 
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
                    placeholder="Enter task description" 
                    rows="3"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Priority</label>
                  <select 
                    className="form-control" 
                    name="priority" 
                    value={form.priority} 
                    onChange={handleChange}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Assign To</label>
                  <select 
                    className="form-control" 
                    name="assignedUserId" 
                    value={form.assignedUserId} 
                    onChange={handleChange}
                  >
                    <option value="">Unassigned</option>
                    {projectMembers.map((member, idx) => {
                      const key = member.user?.id || member.userId || idx;
                      return (
                        <option key={key} value={member.user?.id || member.userId}>
                          {member.user?.name || member.userName || `User ${member.userId}`}
                          {member.role && ` (${member.role})`}
                        </option>
                      );
                    })}
                  </select>
                  <small className="form-text text-muted">
                    Select a project member to assign this task to
                  </small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Due Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    name="dueDate" 
                    value={form.dueDate} 
                    onChange={handleChange} 
                  />
                </div>

                {/* Only show status update if current user is assigned user */}
                {user && task && user.id === task.assignedUserId && (
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-control"
                      name="status"
                      value={form.status || task.status || "PENDING"}
                      onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                )}

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button type="button" 
                          className="btn btn-outline-secondary me-md-2" 
                          onClick={handleCancel}>
                    <i className="fas fa-times me-2"></i>Cancel
                  </button>
                  <button className="btn btn-warning text-dark" type="submit" disabled={!hasChanges}>
                    <i className="fas fa-save me-2"></i>Update Task
                  </button>
                </div>
              </form>

              {msg && (
                <div className={`alert ${msg.includes('successfully') || msg.includes('Cancelled') ? 'alert-success' : 'alert-warning'} mt-3`}>
                  <i className={`fas ${msg.includes('successfully') || msg.includes('Cancelled') ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                  {msg}
                </div>
              )}
              
              {hasChanges && (
                <div className="alert alert-warning mt-3">
                  <small>⚠️ You have unsaved changes</small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
