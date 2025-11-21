// src/components/ProjectCard.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function ProjectCard({ project }) {
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'project-status-active';
      case 'completed': return 'project-status-completed';
      case 'on_hold': return 'project-status-on-hold';
      default: return 'bg-secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date set';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="col-lg-4 col-md-6 mb-4">
      <div className="card h-100">
        <div className="card-header bg-transparent border-0 pb-0">
          <div className="d-flex justify-content-between align-items-start">
            <h5 className="card-title mb-0 fw-bold">{project.name}</h5>
            <span className={`badge ${getStatusClass(project.status)}`}>
              {project.status || 'Active'}
            </span>
          </div>
        </div>
        
        <div className="card-body">
          <p className="card-text text-muted mb-3">
            {project.description || 'No description available'}
          </p>
          
          <div className="mb-3">
            <small className="text-muted d-block">
              <i className="fas fa-calendar-alt me-1"></i>
              Created: {formatDate(project.createdAt)}
            </small>
            {project.dueDate && (
              <small className="text-muted d-block">
                <i className="fas fa-flag me-1"></i>
                Due: {formatDate(project.dueDate)}
              </small>
            )}
          </div>

          <div className="mb-3">
            <div className="d-flex align-items-center">
              <small className="text-muted me-2">
                <i className="fas fa-users me-1"></i>
                Members: {project.memberCount || 0}
              </small>
              <small className="text-muted">
                <i className="fas fa-tasks me-1"></i>
                Tasks: {project.taskCount || 0}
              </small>
            </div>
          </div>
        </div>

        <div className="card-footer bg-transparent border-0 pt-0">
          <div className="d-grid gap-2 d-md-flex">
            <Link 
              to={`/projects/${project.id}`} 
              className="btn btn-outline-primary btn-sm flex-fill"
            >
              <i className="fas fa-eye me-1"></i>
              View Details
            </Link>
            <Link 
              to={`/projects/${project.id}/edit`} 
              className="btn btn-outline-warning btn-sm flex-fill"
            >
              <i className="fas fa-edit me-1"></i>
              Edit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
