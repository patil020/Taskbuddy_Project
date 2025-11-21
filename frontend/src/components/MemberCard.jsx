// src/components/MemberCard.jsx
import React from "react";

export default function MemberCard({ member }) {
  return (
    <div className="card mb-2">
      <div className="card-body d-flex align-items-center">
  <span className="me-3"><b>{member.userName}</b></span>
        <span className="badge bg-info">{member.role}</span>
      </div>
    </div>
  );
}
