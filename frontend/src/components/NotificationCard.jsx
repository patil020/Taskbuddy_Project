// src/components/NotificationCard.jsx
import React from "react";

export default function NotificationCard({ notification, onMarkRead }) {
  return (
    <div className="card mb-2 shadow-sm">
      <div className="card-body d-flex justify-content-between align-items-center">
        <div>
          <strong>{notification.type}:</strong> {notification.message}
        </div>
        {!notification.read && (
          <button className="btn btn-sm btn-success" onClick={() => onMarkRead(notification.id)}>
            Mark as read
          </button>
        )}
      </div>
    </div>
  );
}
