import api from "../lib/axios";

export function getAllProjects() {
  return api.get("/projects")
    .then(response => {
      if (response.data.data) {
        return { ...response, data: response.data.data };
      }
      return response;
    })
    .catch(error => {
      console.error("Error fetching projects:", error);
      return { data: [] };
    });
}

export function createProject(data) {
  return api.post("/projects", data);
}

export function getProject(id) {
  return api.get(`/projects/${id}`)
    .then(response => {
      if (response.data.data) {
        return { ...response, data: response.data.data };
      }
      return response;
    })
    .catch(() => {
      return { data: { id, name: "Project", description: "Loading..." } };
    });
}

export function updateProject(id, data) {
  return api.put(`/projects/${id}`, data);
}

export function updateProjectStatus(id, status) {
  return api.patch(`/projects/${id}/status?status=${status}`);
}
