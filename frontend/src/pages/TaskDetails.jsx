// src/pages/TaskDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getTask, updateTaskStatus, reassignTask, deleteTask } from "../api/task";
import { getProject } from "../api/project";
import { useAuth } from "../context/AuthContext";
import CommentSection from "../components/CommentSection";
import { getStatusBadgeClass, getPriorityBadgeClass, formatDate } from "../utils/badgeUtils";

export default function TaskDetails() {
  const { id, projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState({});
  const [project, setProject] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getTask(id).catch(() => ({ data: {} })),
      getProject(projectId).catch(() => ({ data: {} }))
    ]).then(([taskRes, projectRes]) => {
      setTask(taskRes.data || {});
      setProject(projectRes.data || {});
      setLoading(false);
    }).catch(err => {
      console.error("Error loading task details:", err);
      setError("Failed to load task details. Please try again.");
      setLoading(false);
    });
  }, [id, projectId]);

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTaskStatus(id, newStatus);
      setTask({ ...task, status: newStatus });
    } catch (error) {
      console.error("Error updating task status:", error);
      alert("Failed to update task status.");
    }
  };


  if (loading) return (
    <div className="container mt-4">
      <div className="d-flex justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading task...</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mt-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/projects" className="text-decoration-none">Projects</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to={`/projects/${projectId}`} className="text-decoration-none">
              {project.name || 'Project'}
            </Link>
          </li>
          <li className="breadcrumb-item">
            <Link to={`/projects/${projectId}/tasks`} className="text-decoration-none">
              Tasks
            </Link>
          </li>
          <li className="breadcrumb-item active">Task Details</li>
        </ol>
      </nav>

      {/* Task Header */}
      <div className="card mb-4">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">
              <i className="fas fa-tasks me-2 text-primary"></i>
              {task.title || "Task Details"}
            </h4>
            <div>
              <Link 
                to={`/projects/${projectId}/tasks/${id}/edit`} 
                className="btn btn-outline-warning btn-sm me-2">
                <i className="fas fa-edit me-1"></i>Edit
              </Link>
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={() => navigate(`/projects/${projectId}/tasks`)}>
                <i className="fas fa-arrow-left me-1"></i>Back to Tasks
              </button>
            </div>
          </div>
        </div>
        
        <div className="card-body">
          <div className="row">
            <div className="col-md-8">
              <h5 className="card-title">{task.title}</h5>
              <p className="card-text text-muted mb-3">
                {task.description || "No description provided."}
              </p>
              
              <div className="mb-3">
                <span className={`badge bg-${getStatusBadgeClass(task.status)} me-2`}>
                  <i className="fas fa-info-circle me-1"></i>
                  {task.status || 'PENDING'}
                </span>
                <span className={`badge bg-${getPriorityBadgeClass(task.priority)} me-2`}>
                  <i className="fas fa-flag me-1"></i>
                  {task.priority || 'MEDIUM'} Priority
                </span>
                {task.assignedUserName && (
                  <span className="badge bg-primary">
                    <i className="fas fa-user me-1"></i>
                    {task.assignedUserName}
                  </span>
                )}
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card bg-light">
                <div className="card-body">
                  <h6 className="card-title">
                    <i className="fas fa-info-circle me-2"></i>
                    Task Information
                  </h6>
                  
                  <p className="mb-2">
                    <strong>Due Date:</strong><br />
                    <small className="text-muted">
                      <i className="fas fa-calendar me-1"></i>
                      {formatDate(task.dueDate)}
                    </small>
                  </p>
                  
                  <p className="mb-2">
                    <strong>Created:</strong><br />
                    <small className="text-muted">
                      <i className="fas fa-clock me-1"></i>
                      {formatDate(task.createdAt)}
                    </small>
                  </p>
                  
                  {task.updatedAt && (
                    <p className="mb-0">
                      <strong>Last Updated:</strong><br />
                      <small className="text-muted">
                        <i className="fas fa-edit me-1"></i>
                        {formatDate(task.updatedAt)}
                      </small>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Actions */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="fas fa-cogs me-2"></i>
            Task Actions
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6>Change Status:</h6>
              <div className="btn-group" role="group">
                {task.status !== 'PENDING' && (
                  <button 
                    className="btn btn-outline-warning btn-sm"
                    onClick={() => handleStatusChange('PENDING')}>
                    <i className="fas fa-clock me-1"></i>Pending
                  </button>
                )}
                {task.status !== 'IN_PROGRESS' && (
                  <button 
                    className="btn btn-outline-info btn-sm"
                    onClick={() => handleStatusChange('IN_PROGRESS')}>
                    <i className="fas fa-play me-1"></i>Start
                  </button>
                )}
                {task.status !== 'COMPLETED' && (
                  <button 
                    className="btn btn-outline-success btn-sm"
                    onClick={() => handleStatusChange('COMPLETED')}>
                    <i className="fas fa-check me-1"></i>Complete
                  </button>
                )}
              </div>
            </div>
            
            <div className="col-md-6">
              <h6>Quick Actions:</h6>
              <div className="btn-group" role="group">
                <Link 
                  to={`/projects/${projectId}/tasks/${id}/edit`}
                  className="btn btn-outline-primary btn-sm">
                  <i className="fas fa-edit me-1"></i>Edit Task
                </Link>
                <button 
                  className="btn btn-outline-danger btn-sm"
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to delete this task?')) {
                      try {
                        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                        const userId = currentUser.id || currentUser.userId || 1;
                        
                        await deleteTask(taskId, userId);
                        alert('Task deleted successfully!');
                        navigate(`/projects/${projectId}`);
                      } catch (error) {
                        console.error("Error deleting task:", error);
                        alert("Failed to delete task: " + (error.response?.data?.message || error.message));
                      }
                    }
                  }}>
                  <i className="fas fa-trash me-1"></i>Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Comments Section */}
      <CommentSection 
        type="task" 
        entityId={id} 
        projectId={projectId}
      />
    </div>
  );
}
