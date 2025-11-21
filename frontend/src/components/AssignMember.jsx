// src/components/AssignMember.jsx
import React, { useState, useEffect } from "react";
import { getAllUsers } from "../api/user";
import { createInvitation } from "../api/invite";
import { showSuccess, showError } from "../utils/toastUtils";

export default function AssignMember({ projectId, onMemberAdded, onClose }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await getAllUsers();
      // Handle ApiResponse format - data might be nested under response.data.data
      const usersData = response?.data?.data || response?.data || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users");
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async () => {
    if (!selectedUser) return;
    
    setAssigning(true);
    setError("");
    
    try {
      await createInvitation(projectId, selectedUser);
      showSuccess("Invitation sent successfully!");
      if (onMemberAdded) {
        onMemberAdded();
      }
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      const errorMessage = error.response?.data?.message || "Failed to send invitation";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <i className="fas fa-envelope me-2"></i>
          Send Project Invitation
        </h6>
        {onClose && (
          <button type="button" className="btn-close" onClick={onClose}></button>
        )}
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <div className="mb-3">
          <label htmlFor="userSelect" className="form-label">Select User</label>
          <select
            id="userSelect"
            className="form-select"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            disabled={assigning}
          >
            <option value="">Choose a user...</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.username || user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>
        
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            disabled={!selectedUser || assigning}
            onClick={handleSendInvitation}
          >
            {assigning ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Sending...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane me-2"></i>
                Send Invitation
              </>
            )}
          </button>
          {onClose && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={assigning}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
