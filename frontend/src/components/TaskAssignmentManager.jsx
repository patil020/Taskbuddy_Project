// src/components/TaskAssignmentManager.jsx
import React, { useEffect, useState } from "react";
import { showError } from "../utils/toastUtils";
import { getProjectMembers } from "../api/user";
import MemberCard from "./MemberCard";

export default function TaskAssignmentManager({ projectId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const membersRes = await getProjectMembers(projectId);
      setMembers(membersRes.data?.data || membersRes.data || []);
    } catch (err) {
      console.error("Project Members API error:", err);
      setMembers([]); // fallback to empty array
      showError('Failed to load project members. Please try again later.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  if (loading) return <div>Loading members...</div>;

  return (
    <div>
      <h5>Project Members</h5>
      <div className="row">
        {members.length === 0 ? (
          <div className="col-12 text-center py-4">
            <p className="text-muted">No members found for this project.</p>
          </div>
        ) : (
          members.map(member => (
            <div className="col-md-4 mb-3" key={member.id || member.userId}>
              <MemberCard member={member} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}