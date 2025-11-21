// src/pages/MemberList.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProjectMembers } from "../api/member";
import { createInvitation } from "../api/invite";
import MemberCard from "../components/MemberCard";

export default function MemberList() {
  const { projectId } = useParams();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ userId: '', email: '' });
  const [inviteMessage, setInviteMessage] = useState('');

  useEffect(() => {
    if (projectId) {
      getProjectMembers(projectId)
        .then(res => {
          setMembers(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error loading members:", err);
          setLoading(false);
        });
    }
  }, [projectId]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteForm.userId) {
      setInviteMessage('Please enter a user ID');
      return;
    }

    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = currentUser.id || currentUser.userId || 1;
      
      // Create invitation using the corrected API call
      const response = await createInvitation(projectId, inviteForm.userId, userId);
      
      setInviteMessage('Invitation sent successfully!');
      setInviteForm({ userId: '', email: '' });
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteMessage('');
      }, 2000);
    } catch (error) {
      console.error('Error sending invitation:', error);
      setInviteMessage('Failed to send invitation: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return <div className="container mt-4"><h4>Loading members...</h4></div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Project Members</h3>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowInviteModal(true)}>
          <i className="fas fa-user-plus me-2"></i>Invite Member
        </button>
      </div>
      
      {members.length === 0 ? (
        <div className="text-center">
          <p>No members found for this project.</p>
        </div>
      ) : (
        <div>
          {members.map(member => <MemberCard key={member.id} member={member} />)}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Invite Member to Project</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowInviteModal(false)}>
                </button>
              </div>
              <form onSubmit={handleInvite}>
                <div className="modal-body">
                  {inviteMessage && (
                    <div className={`alert ${inviteMessage.includes('success') ? 'alert-success' : 'alert-danger'}`}>
                      {inviteMessage}
                    </div>
                  )}
                  <div className="mb-3">
                    <label htmlFor="userId" className="form-label">User ID</label>
                    <input
                      type="number"
                      className="form-control"
                      id="userId"
                      value={inviteForm.userId}
                      onChange={(e) => setInviteForm({...inviteForm, userId: e.target.value})}
                      placeholder="Enter user ID to invite"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email (optional)</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                      placeholder="User email for reference"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowInviteModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Send Invitation
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
