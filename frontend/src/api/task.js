import api from "../lib/axios";

export function getTasksByProject(projectId) {
  return api.get(`/tasks/project/${projectId}`)
    .then(response => {
      if (response.data.data) {
        return { ...response, data: response.data.data };
      }
      return response;
    });
}

export function getAllTasks() {
  return api.get("/tasks")
    .then(response => {
      if (response.data.data) {
        return { ...response, data: response.data.data };
      }
      return response;
    });
}

export function createTask(data) {
  return api.post("/tasks", data);
}

export function getTask(id) {
  return api.get(`/tasks/${id}`)
    .then(response => {
      if (response.data.data) {
        return { ...response, data: response.data.data };
      }
      return response;
    });
}

export function updateTask(id, data) {
  return api.put(`/tasks/${id}`, data);
}

export function updateTaskStatus(id, status) {
  return api.put(`/tasks/${id}/status?status=${status}`);
}

export function reassignTask(id, newAssigneeId) {
  return api.put(`/tasks/${id}/reassign?newAssigneeId=${newAssigneeId}`);
}

export function deleteTask(id) {
  return api.delete(`/tasks/${id}`);
}
