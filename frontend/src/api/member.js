import api from "../lib/axios";

export function getProjectMembers(projectId) {
  return api.get(`/project-members/project/${projectId}`);
}

export function getUserProjects(userId) {
  return api.get(`/project-members/user/${userId}`);
}

export function assignMemberToProject(projectId, userId) {
  return api.post(`/projects/${projectId}/members?userId=${userId}`);
}

export function removeMemberFromProject(projectId, userId) {
  return api.delete(`/projects/${projectId}/members/${userId}`);
}
