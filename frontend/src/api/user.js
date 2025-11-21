import api from "../lib/axios";

export function getAllUsers() {
  return api.get("/users");
}

export function getUserById(id) {
  return api.get(`/users/${id}`);
}

export function searchUsers(query) {
  return api.get(`/users/search?query=${query}`);
}

export function getProjectMembers(projectId) {
  return api.get(`/users/project/${projectId}`);
}

export function getMyRoleInProject(projectId) {
  return api.get(`/users/project/${projectId}/my-role`);
}

export function updateUser(id, userData) {
  return api.put(`/users/${id}`, userData);
}

export function changePassword(passwordData) {
  return api.put("/users/change-password", passwordData);
}