// src/components/TaskCard.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import TaskStatusManager from "./TaskStatusManager";
import TaskAssignment from "./TaskAssignment";

export default function TaskCard({ task, projectId, onStatusChange, onAssign, onDelete, projectMembers = [], showActions = true }) {
  const [showTaskAssignment, setShowTaskAssignment] = useState(false);
  
  const getPriorityBadgeClass = (priority) => {
    switch(priority) {
      case 'HIGH': return 'danger';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'success';
      default: return 'secondary';
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the task "${task.title}"?`)) {
      if (onDelete) {
        onDelete(task.id);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="card mb-3 shadow-sm border-start border-4" 
         style={{borderLeftColor: task.priority === 'HIGH' ? '#dc3545' : task.priority === 'MEDIUM' ? '#ffc107' : '#198754'}}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Link 
            to={`/projects/${projectId}/tasks/${task.id}`}
            className="text-decoration-none text-dark">
            <h6 className="card-title mb-0 hover-link">{task.title}</h6>
          </Link>
          {showActions && (
            <div className="dropdown">
              <button className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                      type="button" data-bs-toggle="dropdown">
                <i className="fas fa-ellipsis-v"></i>
              </button>
              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" to={`/projects/${projectId}/tasks/${task.id}`}>
                    <i className="fas fa-eye me-2"></i>View Details
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to={`/projects/${projectId}/tasks/${task.id}/edit`}>
                    <i className="fas fa-edit me-2"></i>Edit
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button 
                    className="dropdown-item" 
                    onClick={() => setShowTaskAssignment(true)}>
                    <i className="fas fa-user-plus me-2"></i>Manage Assignment
                  </button>
                </li>
                <li>
                  <button className="dropdown-item text-danger" onClick={handleDelete}>
                    <i className="fas fa-trash me-2"></i>Delete
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
        
        <p className="card-text text-muted small mb-2">{task.description}</p>
        
        <div className="d-flex flex-wrap gap-2 mb-2">
          <TaskStatusManager 
            taskId={task.id}
            currentStatus={task.status}
            size="sm"
            onStatusUpdate={onStatusChange}
          />
          <span className={`badge bg-${getPriorityBadgeClass(task.priority)}`}>
            <i className="fas fa-flag me-1"></i>{task.priority || 'MEDIUM'}
          </span>
          {task.assignedUserName && (
            <span className="badge bg-primary">
              <i className="fas fa-user me-1"></i>{task.assignedUserName}
            </span>
          )}
          {task.dueDate && (
            <span className="badge bg-info">
              <i className="fas fa-calendar me-1"></i>{formatDate(task.dueDate)}
            </span>
          )}
        </div>

        {/* Task Assignment Modal */}
        {showTaskAssignment && (
          <TaskAssignment
            // Pass only the relevant identifiers to the assignment modal.  The
            // modal expects taskId, the current assignee, and a callback.
            taskId={task.id}
            currentAssigneeId={task.assignedUserId}
            projectId={projectId}
            onTaskAssigned={(assigneeId) => {
              if (onAssign) {
                onAssign(task.id, assigneeId);
              }
            }}
            onClose={() => setShowTaskAssignment(false)}
          />
        )}
        
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            <i className="fas fa-calendar me-1"></i>
            Due: {formatDate(task.dueDate)}
          </small>
        </div>
      </div>
    </div>
  );
}
