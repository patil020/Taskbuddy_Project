import api from "../lib/axios";

export function getInvitesForUser(userId) {
  if (!userId) {
    return api.get("/project-invitations/pending");
  }
  return api.get(`/project-invitations/user/${userId}/pending`);
}

export function respondToInvite(inviteId, status) {
  return api.put(`/project-invitations/${inviteId}/respond?status=${status}`);
}

export function createInvitation(projectId, invitedUserId) {
  return api.post(`/project-invitations?projectId=${projectId}&invitedUserId=${invitedUserId}`);
}
