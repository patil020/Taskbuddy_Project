// src/pages/TaskAssignmentManager.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProject } from "../api/project";
import { getProjectMembers } from "../api/member";
import { getTasksByProject, updateTaskStatus, deleteTask } from "../api/task";
import { useAuth } from "../context/AuthContext";
import { getStatusBadgeClass, getPriorityBadgeClass } from "../utils/badgeUtils";

export default function TaskAssignmentManager() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState({});
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  // Removed activeTaskAssignment state for reassign functionality
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      let projectRes, membersRes, tasksRes;
      try {
        projectRes = await getProject(id);
      } catch (err) {
        console.error("Project API error:", err);
        setMessage("Error loading project details: " + (err.response?.data?.message || err.message));
        setLoading(false);
        return;
      }
      try {
        membersRes = await getProjectMembers(id);
      } catch (err) {
        console.error("Project Members API error:", err);
        setMessage("Error loading project members: " + (err.response?.data?.message || err.message));
        setLoading(false);
        return;
      }
      try {
        tasksRes = await getTasksByProject(id);
      } catch (err) {
        console.error("Project Tasks API error:", err);
        setMessage("Error loading project tasks: " + (err.response?.data?.message || err.message));
        setLoading(false);
        return;
      }

      const projectData = projectRes?.data?.data || projectRes?.data || {};
      const membersData = membersRes?.data?.data || membersRes?.data || [];
      const tasksData = tasksRes?.data?.data || tasksRes?.data || [];

      setProject(projectData);
      setMembers(Array.isArray(membersData) ? membersData : []);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (error) {
      console.error("Unknown error loading data:", error);
      setMessage("Unknown error loading project data");
    } finally {
      setLoading(false);
    }
  };

  // Removed handleTaskAssign and all reassign logic

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      // Log the status and taskId before making the request
      console.log("Updating task status", { taskId, newStatus });

      await updateTaskStatus(taskId, newStatus);
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      setMessage("Task status updated successfully!");
    } catch (error) {
      // Log the full error response from Axios
      if (error.response) {
        console.error("Error updating task status:", error.response.data, error.response.status, error.response.headers);
      } else {
        console.error("Error updating task status:", error.message);
      }
      setMessage("Failed to update task status");
    }
  };

  const handleTaskDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = currentUser.id || currentUser.userId || 1;
      
      await deleteTask(taskId, userId);
      setTasks(tasks.filter(task => task.id !== taskId));
      setMessage("Task deleted successfully!");
    } catch (error) {
      console.error("Error deleting task:", error);
      setMessage("Failed to delete task: " + (error.response?.data?.message || error.message));
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== "all" && task.status !== filterStatus) return false;
    if (filterAssignee !== "all") {
      if (filterAssignee === "unassigned" && task.assignedUserId) return false;
      if (filterAssignee !== "unassigned" && task.assignedUserId != filterAssignee) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading task assignments...</p>
        </div>
      </div>
    );
  }


  return (
  <div className="container mt-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/projects" className="text-decoration-none">Projects</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to={`/projects/${id}`} className="text-decoration-none">
              {project.name || 'Project Details'}
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">Task Assignments</li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3>
            <i className="fas fa-tasks me-2 text-primary"></i>
            Task Assignment Manager
          </h3>
          <p className="text-muted mb-0">Assign and manage tasks for "{project.name}"</p>
        </div>
        <div className="d-flex gap-2">
          <Link to={`/projects/${id}/tasks/create`} className="btn btn-primary">
            <i className="fas fa-plus me-1"></i>
            Create Task
          </Link>
          <Link to={`/projects/${id}`} className="btn btn-outline-secondary">
            <i className="fas fa-arrow-left me-2"></i>
            Back to Project
          </Link>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage("")}></button>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <label className="form-label">Filter by Status</label>
              <select 
                className="form-select" 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Filter by Assignee</label>
              <select 
                className="form-select" 
                value={filterAssignee} 
                onChange={(e) => setFilterAssignee(e.target.value)}
              >
                <option value="all">All Assignees</option>
                <option value="unassigned">Unassigned</option>
                {members.map(member => (
                  <option key={member.userId} value={member.userId}>
                    {member.userName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

  {/* Task Assignment Modal removed */}

      {/* Tasks List */}
      <div className="row">
        {filteredTasks.length === 0 ? (
          <div className="col-12">
            <div className="text-center text-muted py-5">
              <i className="fas fa-tasks fa-3x mb-3"></i>
              <h5>No tasks found</h5>
              <p>No tasks match the current filter criteria.</p>
              <p>Use the "Create Task" button above to add a new task.</p>
            </div>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">{task.title}</h6>
                  <div className="dropdown">
                    <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                      <i className="fas fa-ellipsis-v"></i>
                    </button>
                    <ul className="dropdown-menu">
                      {/* Reassign dropdown item removed */}
                      <li>
                        <Link to={`/projects/${id}/tasks/${task.id}/edit`} className="dropdown-item">
                          <i className="fas fa-edit me-2"></i>
                          Edit
                        </Link>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button 
                          className="dropdown-item text-danger" 
                          onClick={() => handleTaskDelete(task.id)}
                        >
                          <i className="fas fa-trash me-2"></i>
                          Delete
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="card-body">
                  <p className="card-text small text-muted">
                    {task.description || "No description"}
                  </p>
                  
                  <div className="mb-2">
                    <span className={`badge bg-${getStatusBadgeClass(task.status)} me-2`}>
                      {task.status || 'PENDING'}
                    </span>
                    <span className={`badge bg-${getPriorityBadgeClass(task.priority)}`}>
                      {task.priority || 'MEDIUM'}
                    </span>
                  </div>

                  {task.assignedUserId ? (
                    <div className="d-flex align-items-center mb-2">
                      <i className="fas fa-user me-2 text-muted"></i>
                      <small>
                        Assigned to: <strong>{task.assignedUserName || 'Unknown'}</strong>
                      </small>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center mb-2">
                      <i className="fas fa-user-slash me-2 text-muted"></i>
                      <small className="text-muted">Unassigned</small>
                    </div>
                  )}

                  {task.dueDate && (
                    <div className="d-flex align-items-center mb-2">
                      <i className="fas fa-calendar me-2 text-muted"></i>
                      <small>Due: {new Date(task.dueDate).toLocaleDateString()}</small>
                    </div>
                  )}
                </div>
                <div className="card-footer">
                  <div className="btn-group w-100" role="group">
                    {user && task.assignedUserId === user.id && (
                      <select 
                        className="form-select form-select-sm"
                        value={task.status || 'PENDING'}
                        onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    )}
                    {/* Assign button removed as reassign functionality is disabled */}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Statistics */}
      <div className="row mt-4">
        <div className="col-md-3">
          <div className="card text-center bg-light">
            <div className="card-body">
              <h5 className="card-title text-primary">{tasks.length}</h5>
              <p className="card-text">Total Tasks</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center bg-light">
            <div className="card-body">
              <h5 className="card-title text-warning">
                {tasks.filter(t => t.status === 'IN_PROGRESS').length}
              </h5>
              <p className="card-text">In Progress</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center bg-light">
            <div className="card-body">
              <h5 className="card-title text-success">
                {tasks.filter(t => t.status === 'COMPLETED').length}
              </h5>
              <p className="card-text">Completed</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center bg-light">
            <div className="card-body">
              <h5 className="card-title text-muted">
                {tasks.filter(t => !t.assignedUserId).length}
              </h5>
              <p className="card-text">Unassigned</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
