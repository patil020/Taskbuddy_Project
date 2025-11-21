// src/components/UserSelector.jsx - Fixed import
import React, { useState, useEffect } from "react";
import { getAllUsers } from "../api/user";

export default function UserSelector({ 
  selectedUserId, 
  onUserSelect, 
  excludeUsers = [], 
  placeholder = "Select a user...",
  disabled = false,
  showEmail = false,
  required = false
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await getAllUsers();
      const allUsers = response.data?.data || response.data || [];
      // Filter out excluded users
      const filteredUsers = allUsers.filter(user => 
        !excludeUsers.includes(user.id || user.userId)
      );
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <select className="form-select" disabled>
        <option>Loading users...</option>
      </select>
    );
  }

  if (error) {
    return (
      <div>
        <select className="form-select" disabled>
          <option>Error loading users</option>
        </select>
        <small className="text-danger">{error}</small>
      </div>
    );
  }

  return (
    <select
      className="form-select"
      value={selectedUserId || ""}
      onChange={(e) => onUserSelect(e.target.value)}
      disabled={disabled}
      required={required}
    >
      <option value="">{placeholder}</option>
      {users.map(user => (
        <option key={user.id || user.userId} value={user.id || user.userId}>
          {user.name || user.userName}
          {showEmail && user.email && ` (${user.email})`}
        </option>
      ))}
    </select>
  );
}
