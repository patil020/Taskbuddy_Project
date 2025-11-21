// src/components/TaskAssignment.jsx
import React, { useState, useEffect } from "react";
import { getProjectMembers } from "../api/member";
import { reassignTask } from "../api/task";

export default function TaskAssignment({ taskId, currentAssigneeId, projectId, onTaskAssigned, onClose }) {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProjectMembers();
  }, [projectId]);

  const loadProjectMembers = async () => {
    try {
      const response = await getProjectMembers(projectId);
      const membersData = response?.data?.data || response?.data || [];
      setMembers(Array.isArray(membersData) ? membersData : []);
    } catch (error) {
      console.error("Error fetching project members:", error);
      setError("Failed to load project members");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async () => {
    if (!selectedMember) return;
    
    setAssigning(true);
    setError("");
    
    try {
      await reassignTask(taskId, selectedMember);
      if (onTaskAssigned) {
        onTaskAssigned(selectedMember);
      }
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error assigning task:", error);
      setError(error.response?.data?.message || "Failed to assign task");
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
          <i className="fas fa-tasks me-2"></i>
          Assign Task to Member
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
          <label htmlFor="memberSelect" className="form-label">Select Member</label>
          <select
            id="memberSelect"
            className="form-select"
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            disabled={assigning}
          >
            <option value="">Choose a member...</option>
            {members
              .filter(member => member && member.userId)
              .map(member => (
              <option 
                key={member.userId} 
                value={member.userId}
                disabled={member.userId === currentAssigneeId}
              >
                {member.userName}
                {member.role ? ` (${member.role})` : ''}
                {member.userId === currentAssigneeId ? ' - Currently Assigned' : ''}
              </option>
            ))}
          </select>
        </div>
        
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            disabled={!selectedMember || assigning || selectedMember === currentAssigneeId}
            onClick={handleAssignTask}
          >
            {assigning ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Assigning...
              </>
            ) : (
              <>
                <i className="fas fa-user-check me-2"></i>
                Assign Task
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
