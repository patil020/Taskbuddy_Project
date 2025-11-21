// src/components/InviteCard.jsx
import React from "react";

export default function InviteCard({ invite, onAction }) {
  return (
    <div className="card mb-2 shadow-sm">
      <div className="card-body d-flex justify-content-between align-items-center">
        <span>
          <b>Project:</b> {invite.projectName} <b>Status:</b> {invite.status}
        </span>
        {invite.status === "PENDING" && (
          <div>
            <button
              className="btn btn-sm btn-success me-2"
              onClick={() => onAction(invite.id, "accept")}
            >
              Accept
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => onAction(invite.id, "reject")}
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
