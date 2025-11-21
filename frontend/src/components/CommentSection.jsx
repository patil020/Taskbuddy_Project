// src/components/CommentSection.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import CommentCard from "./CommentCard";
import { getProjectComments, addProjectComment, getTaskComments, addTaskComment, updateComment, deleteComment } from "../api/comment";

export default function CommentSection({ type, entityId, projectId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadComments();
  }, [entityId, type]);

  const loadComments = async () => {
    try {
      setLoading(true);
      let response;
      if (type === 'project') {
        response = await getProjectComments(entityId);
      } else if (type === 'task') {
        response = await getTaskComments(entityId);
      }
      let data = response?.data?.data || response?.data || [];
      if (!Array.isArray(data)) data = [];
      setComments(data);
      setError("");
    } catch (err) {
      console.error("Error loading comments:", err);
      setComments([]);
      setError("Failed to load comments: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      let response;
      
      if (type === 'project') {
        response = await addProjectComment(entityId, newComment.trim());
      } else if (type === 'task') {
        response = await addTaskComment(entityId, newComment.trim());
      }
      
      const newCommentObj = response?.data?.data || {
        id: Date.now(),
        message: newComment.trim(),
        authorName: user.username,
        userId: user.id,
        createdAt: new Date().toISOString()
      };
      
      setComments([newCommentObj, ...comments]);
      setNewComment("");
      setError("");
    } catch (err) {
      console.error("Error adding comment:", err);
      setError("Could not add comment: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId, newContent) => {
    try {
      await updateComment(commentId, newContent);
      setComments(comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, message: newContent, content: newContent }
          : comment
      ));
    } catch (err) {
      console.error("Error updating comment:", err);
      alert("Could not update comment. Please try again.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Could not delete comment. Please try again.");
    }
  };

  const getIcon = () => {
    return type === 'project' ? 'fas fa-project-diagram' : 'fas fa-tasks';
  };

  const getTitle = () => {
    return type === 'project' ? 'Project Discussion' : 'Task Discussion';
  };

  return (
    <div className="card mt-4">
      <div className="card-header">
        <h5 className="mb-0">
          <i className={`${getIcon()} me-2 text-primary`}></i>
          {getTitle()}
          <span className="badge bg-secondary ms-2">{comments.length}</span>
        </h5>
      </div>
      
      <div className="card-body">
        {/* Add Comment Form */}
        <form onSubmit={handleAddComment} className="mb-4">
          <div className="d-flex align-items-start">
            <div className="avatar-circle me-3 flex-shrink-0">
              <i className="fas fa-user"></i>
            </div>
            <div className="flex-grow-1">
              <textarea
                className="form-control mb-2"
                rows="3"
                placeholder={`Add a comment to this ${type}...`}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={submitting}
              />
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  Commenting as {user?.username || 'Anonymous'}
                </small>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={!newComment.trim() || submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1"></span>
                      Posting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane me-1"></i>
                      Post Comment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {error && (
          <div className="alert alert-warning">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* Comments List */}
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading comments...</span>
            </div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-muted py-4">
            <i className="fas fa-comments fa-3x mb-3 opacity-50"></i>
            <h6>No Comments Yet</h6>
            <p className="small">Be the first to start the discussion!</p>
          </div>
        ) : (
          <div className="comments-list">
            {(Array.isArray(comments) ? comments : []).map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                onEdit={handleEditComment}
                onDelete={handleDeleteComment}
                canEdit={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
