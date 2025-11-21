// src/components/ProjectStatusManager.jsx
import React, { useState } from "react";
import { updateProjectStatus } from "../api/project";

export default function ProjectStatusManager({ 
  projectId, 
  currentStatus, 
  onStatusUpdate, 
  disabled = false 
}) {
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus || updating) return;

    setUpdating(true);
    setMessage("");

    try {
      await updateProjectStatus(projectId, newStatus);
      setMessage(`Project status updated to ${newStatus}`);
      if (onStatusUpdate) {
        onStatusUpdate(newStatus);
      }
    } catch (error) {
      console.error("Error updating project status:", error);
      setMessage("Failed to update project status: " + (error.response?.data?.message || error.message));
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ACTIVE': 
      case 'IN_PROGRESS': 
      case 'ACCEPTED': return 'bg-success';
      case 'COMPLETED': return 'bg-primary';
      case 'PENDING': return 'bg-warning';
      case 'ON_HOLD': return 'bg-secondary';
      case 'CANCELLED': 
      case 'REJECTED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getStatusOptions = () => {
    const allStatuses = [
      'PENDING', 
      'ACCEPTED', 
      'ACTIVE', 
      'IN_PROGRESS', 
      'ON_HOLD', 
      'COMPLETED', 
      'CANCELLED', 
      'REJECTED'
    ];
    return allStatuses.filter(status => status !== currentStatus);
  };

  return (
    <div className="project-status-manager">
      <div className="d-flex align-items-center gap-3">
        <div>
          <span className="text-muted small">Status:</span>
          <span className={`badge ${getStatusBadgeClass(currentStatus)} ms-2`}>
            {currentStatus || 'PENDING'}
          </span>
        </div>

        {!disabled && (
          <div className="dropdown">
            <button 
              className="btn btn-outline-secondary btn-sm dropdown-toggle" 
              type="button" 
              data-bs-toggle="dropdown"
              disabled={updating}
            >
              {updating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Updating...
                </>
              ) : (
                <>
                  <i className="fas fa-edit me-2"></i>
                  Change Status
                </>
              )}
            </button>
            <ul className="dropdown-menu">
              {getStatusOptions().map(status => (
                <li key={status}>
                  <button 
                    className="dropdown-item" 
                    onClick={() => handleStatusChange(status)}
                  >
                    <span className={`badge ${getStatusBadgeClass(status)} me-2`}>
                      {status}
                    </span>
                    {status.replace('_', ' ')}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {message && (
        <div className={`alert ${message.includes('Failed') ? 'alert-danger' : 'alert-success'} alert-dismissible fade show mt-2`}>
          <small>{message}</small>
          <button type="button" className="btn-close" onClick={() => setMessage("")}></button>
        </div>
      )}
    </div>
  );
}
