// src/pages/InvitePage.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getInvitesForUser, respondToInvite } from "../api/invite";
import InviteCard from "../components/InviteCard";

export default function InvitePage() {
  const { user } = useAuth();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getInvitesForUser(user.id)
        .then(res => {
          setInvites(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error loading invites:", err);
          setLoading(false);
        });
    }
  }, [user]);

  const handleAction = async (inviteId, action) => {
    try {
      // Convert action to the format expected by backend
      const response = action === "accept" ? "ACCEPTED" : "REJECTED";
      await respondToInvite(inviteId, response);
      setInvites(invites.map(i =>
        i.id === inviteId ? { ...i, status: response } : i
      ));
    } catch (err) {
      console.error("Error responding to invite:", err);
      if (err.response?.status === 404) {
        alert("Invitation not found or already processed.");
      } else {
        alert("Failed to respond to invitation: " + (err.response?.data?.message || err.message));
      }
    }
  };

  if (!user) return <div className="container mt-4"><h5>Login to see invitations.</h5></div>;
  if (loading) return <div className="container mt-4"><h4>Loading invitations...</h4></div>;

  return (
    <div className="container mt-4">
      <h3>Project Invitations</h3>
      {invites.length === 0 ? (
        <div className="text-center">
          <p>No invitations found.</p>
        </div>
      ) : (
        <div>
          {invites.map(inv => (
            <InviteCard key={inv.id} invite={inv} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  );
}
