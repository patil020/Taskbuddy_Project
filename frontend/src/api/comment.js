import api from "../lib/axios";

export function getProjectComments(projectId) {
  return api.get(`/comments/project/${projectId}`);
}

export function addProjectComment(projectId, comment) {
  return api.post(`/comments/project/${projectId}`, {
    message: comment,
    projectId: projectId
  });
}

export function getTaskComments(taskId) {
  return api.get(`/comments/task/${taskId}`);
}

export function addTaskComment(taskId, comment) {
  return api.post(`/comments/task/${taskId}`, {
    message: comment,
    taskId: taskId
  });
}

export function updateComment(commentId, content) {
  return api.put(`/comments/${commentId}`, {
    message: content
  });
}

export function deleteComment(commentId) {
  return api.delete(`/comments/${commentId}`);
}

export function getAllComments() {
  return api.get("/comments");
}
