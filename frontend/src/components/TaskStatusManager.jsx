// src/components/TaskStatusManager.jsx
import React, { useState } from "react";
import { updateTaskStatus } from "../api/task";
import { useAuth } from "../context/AuthContext";

export default function TaskStatusManager({ 
  taskId, 
  currentStatus, 
  onStatusUpdate, 
  disabled = false,
  size = "normal",
  assignedUserId
}) {
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus || updating) return;

    setUpdating(true);
    setMessage("");

    try {
      const userId = user?.id || user?.userId;
      await updateTaskStatus(taskId, newStatus, userId);
      setMessage(`Task status updated to ${newStatus.replace('_', ' ')}`);
      if (onStatusUpdate) {
        onStatusUpdate(taskId, newStatus);
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      setMessage("Failed to update task status: " + (error.response?.data?.message || error.message));
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-success';
      case 'IN_PROGRESS': return 'bg-warning text-dark';
      case 'PENDING': return 'bg-secondary';
      case 'ACCEPTED': return 'bg-primary';
      case 'REJECTED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED': return 'fa-check-circle';
      case 'IN_PROGRESS': return 'fa-clock';
      case 'PENDING': return 'fa-hourglass-half';
      case 'ACCEPTED': return 'fa-thumbs-up';
      case 'REJECTED': return 'fa-thumbs-down';
      default: return 'fa-question-circle';
    }
  };

  const getStatusOptions = () => {
    const allStatuses = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'];
    return allStatuses.filter(status => status !== currentStatus);
  };

  const btnClass = size === "small" ? "btn-sm" : "";
  const badgeClass = size === "small" ? "badge" : "badge fs-6";

  return (
    <div className="task-status-manager">
      <div className="d-flex align-items-center gap-2">
        <span className={`${badgeClass} ${getStatusBadgeClass(currentStatus)}`}>
          <i className={`fas ${getStatusIcon(currentStatus)} me-1`}></i>
          {(currentStatus || 'PENDING').replace('_', ' ')}
        </span>

        {!disabled && user && assignedUserId && user.id === assignedUserId && (
          <div className="dropdown">
            <button 
              className={`btn btn-outline-secondary ${btnClass} dropdown-toggle`}
              type="button" 
              data-bs-toggle="dropdown"
              disabled={updating}
              title="Change task status"
            >
              {updating ? (
                <span className="spinner-border spinner-border-sm" role="status"></span>
              ) : (
                <i className="fas fa-edit"></i>
              )}
            </button>
            <ul className="dropdown-menu">
              <li><h6 className="dropdown-header">Change Status</h6></li>
              {getStatusOptions().map(status => (
                <li key={status}>
                  <button 
                    className="dropdown-item d-flex align-items-center" 
                    onClick={() => handleStatusChange(status)}
                  >
                    <i className={`fas ${getStatusIcon(status)} me-2 text-muted`}></i>
                    <span className={`badge ${getStatusBadgeClass(status)} me-2`}>
                      {status.replace('_', ' ')}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {message && (
        <div className={`alert ${message.includes('Failed') ? 'alert-danger' : 'alert-success'} alert-dismissible fade show mt-2`} style={{fontSize: '0.8rem'}}>
          <small>{message}</small>
          <button type="button" className="btn-close" onClick={() => setMessage("")}></button>
        </div>
      )}
    </div>
  );
}
