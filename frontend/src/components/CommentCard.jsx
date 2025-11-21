// src/components/CommentCard.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function CommentCard({ comment, onEdit, onDelete, canEdit = false }) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.message || comment.content || "");

  const handleEdit = () => {
    onEdit(comment.id, editContent);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      onDelete(comment.id);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const isOwner = user && (user.id === comment.userId || user.id === comment.authorId);

  return (
    <div className="card mb-3 comment-card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="d-flex align-items-center">
            <div className="avatar-circle me-2">
              <i className="fas fa-user"></i>
            </div>
            <div>
              <h6 className="mb-0">{comment.authorName || comment.userName || "Anonymous"}</h6>
              <small className="text-muted">
                <i className="fas fa-clock me-1"></i>
                {formatDate(comment.createdAt || comment.timestamp)}
              </small>
            </div>
          </div>
          
          {(canEdit && isOwner) && (
            <div className="dropdown">
              <button 
                className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                type="button" 
                data-bs-toggle="dropdown">
                <i className="fas fa-ellipsis-v"></i>
              </button>
              <ul className="dropdown-menu">
                <li>
                  <button 
                    className="dropdown-item" 
                    onClick={() => setIsEditing(true)}>
                    <i className="fas fa-edit me-2"></i>Edit
                  </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button 
                    className="dropdown-item text-danger" 
                    onClick={handleDelete}>
                    <i className="fas fa-trash me-2"></i>Delete
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        {isEditing ? (
          <div>
            <textarea 
              className="form-control mb-2"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows="3"
              placeholder="Edit your comment..."
            />
            <div>
              <button 
                className="btn btn-primary btn-sm me-2" 
                onClick={handleEdit}
                disabled={!editContent.trim()}>
                <i className="fas fa-save me-1"></i>Save
              </button>
              <button 
                className="btn btn-outline-secondary btn-sm" 
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.message || comment.content || "");
                }}>
                <i className="fas fa-times me-1"></i>Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="mb-0">{comment.message || comment.content}</p>
        )}
      </div>
    </div>
  );
}
