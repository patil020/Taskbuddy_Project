// src/pages/ProjectAssignments.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProject } from "../api/project";
import { getProjectMembers, assignMemberToProject, removeMemberFromProject } from "../api/member";
import { getAllUsers } from "../api/user";
import { useAuth } from "../context/AuthContext";
import UserSelector from "../components/UserSelector";

export default function ProjectAssignments() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState({});
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [message, setMessage] = useState("");
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    loadData();
  }, [id, user]);

  const loadData = async () => {
    try {
      const [projectRes, membersRes, usersRes] = await Promise.all([
        getProject(id),
        getProjectMembers(id),
        getAllUsers()
      ]);

      const projectData = projectRes?.data?.data || {};
      const membersData = membersRes?.data?.data || [];
      const usersData = usersRes?.data?.data || [];
      
      setProject(projectData);
      setMembers(Array.isArray(membersData) ? membersData : []);
      setAllUsers(Array.isArray(usersData) ? usersData : []);
      
      // Check if current user is the project manager
      const currentUserId = user?.id || user?.userId;
      setIsManager(projectData.managerId === currentUserId || 
                  membersData.some(m => m.userId === currentUserId && m.role === 'MANAGER'));
      
    } catch (error) {
      console.error("Error loading data:", error);
      setMessage("Error loading project data");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignMember = async () => {
    if (!selectedUserId || !isManager) return;

    setAssigning(true);
    setMessage("");

    try {
      await assignMemberToProject(id, selectedUserId);
      setMessage("Member assigned successfully!");
      setSelectedUserId("");
      await loadData(); // Reload data
    } catch (error) {
      console.error("Error assigning member:", error);
      setMessage("Failed to assign member: " + (error.response?.data?.message || error.message));
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!isManager) return;
    
    if (!window.confirm("Are you sure you want to remove this member?")) return;

    try {
      await removeMemberFromProject(id, userId);
      setMessage("Member removed successfully!");
      await loadData(); // Reload data
    } catch (error) {
      console.error("Error removing member:", error);
      setMessage("Failed to remove member: " + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading project assignments...</p>
        </div>
      </div>
    );
  }

  const assignedUserIds = members.map(m => m.userId);
  const availableUsers = allUsers.filter(u => !assignedUserIds.includes(u.id || u.userId));

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
          <li className="breadcrumb-item active" aria-current="page">Assignments</li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3>
            <i className="fas fa-users me-2 text-primary"></i>
            Project Assignments
          </h3>
          <p className="text-muted mb-0">Manage team members for "{project.name}"</p>
        </div>
        <Link to={`/projects/${id}`} className="btn btn-outline-secondary">
          <i className="fas fa-arrow-left me-2"></i>
          Back to Project
        </Link>
      </div>

      {/* Messages */}
      {message && (
        <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage("")}></button>
        </div>
      )}

      <div className="row">
        {/* Assign New Member */}
        {isManager && availableUsers.length > 0 && (
          <div className="col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">
                  <i className="fas fa-user-plus me-2"></i>
                  Assign New Member
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Select User to Assign</label>
                  <UserSelector
                    selectedUserId={selectedUserId}
                    onUserSelect={setSelectedUserId}
                    excludeUsers={assignedUserIds}
                    placeholder="Choose a user to assign..."
                    showEmail={true}
                  />
                  <small className="form-text text-muted">
                    Users already assigned to this project are not shown
                  </small>
                </div>
                <button
                  className="btn btn-success"
                  onClick={handleAssignMember}
                  disabled={!selectedUserId || assigning}
                >
                  {assigning ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Assigning...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-check me-2"></i>
                      Assign Member
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Current Members */}
        <div className={`${isManager && availableUsers.length > 0 ? 'col-md-6' : 'col-12'} mb-4`}>
          <div className="card h-100">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-users me-2"></i>
                Current Members ({members.length})
              </h5>
            </div>
            <div className="card-body">
              {members.length === 0 ? (
                <div className="text-center text-muted">
                  <i className="fas fa-users fa-3x mb-3"></i>
                  <p>No members assigned to this project yet.</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {members.map(member => (
                    <div key={member.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{member.userName}</h6>
                        <p className="mb-1 text-muted small">{member.userEmail}</p>
                        <span className={`badge ${member.role === 'MANAGER' ? 'bg-warning' : 'bg-info'}`}>
                          {member.role}
                        </span>
                      </div>
                      {isManager && member.role !== 'MANAGER' && (
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleRemoveMember(member.userId)}
                          title="Remove member"
                        >
                          <i className="fas fa-user-minus"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card text-center bg-light">
            <div className="card-body">
              <h5 className="card-title text-primary">{members.length}</h5>
              <p className="card-text">Total Members</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center bg-light">
            <div className="card-body">
              <h5 className="card-title text-warning">
                {members.filter(m => m.role === 'MANAGER').length}
              </h5>
              <p className="card-text">Managers</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center bg-light">
            <div className="card-body">
              <h5 className="card-title text-info">
                {members.filter(m => m.role === 'MEMBER').length}
              </h5>
              <p className="card-text">Regular Members</p>
            </div>
          </div>
        </div>
      </div>

      {!isManager && (
        <div className="alert alert-info mt-4">
          <i className="fas fa-info-circle me-2"></i>
          <strong>Note:</strong> Only project managers can assign or remove members.
        </div>
      )}
    </div>
  );
}
