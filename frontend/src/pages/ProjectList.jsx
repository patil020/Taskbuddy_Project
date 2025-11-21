// src/pages/ProjectList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllProjects } from "../api/project";
import { useAuth } from "../context/AuthContext";
import ProjectCard from "../components/ProjectCard";

export default function ProjectList() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllProjects();
      const projectsData = response?.data || [];
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (err) {
      console.error("Error loading projects:", err);
      setError("Failed to load projects: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    if (filter === "all") return true;
    const status = project.projectStatus || project.status;
    return status?.toLowerCase() === filter.toLowerCase();
  });

  if (!user) {
    return (
      <div className="container">
        <div className="alert alert-warning text-center">
          <h4>Authentication Required</h4>
          <p>Please log in to view your projects.</p>
          <Link to="/login" className="btn btn-primary">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1>
          <i className="fas fa-project-diagram me-2"></i>
          Your Projects
        </h1>
        <p>Manage and track all your projects in one place</p>
      </div>

      <div className="container">
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="d-flex gap-2 flex-wrap">
              <button 
                className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                onClick={() => setFilter('all')}
              >
                All Projects ({projects.length})
              </button>
              <button 
                className={`btn ${filter === 'active' ? 'btn-success' : 'btn-outline-success'} btn-sm`}
                onClick={() => setFilter('active')}
              >
                Active ({projects.filter(p => (p.projectStatus || p.status)?.toLowerCase() === 'active').length})
              </button>
              <button 
                className={`btn ${filter === 'completed' ? 'btn-info' : 'btn-outline-info'} btn-sm`}
                onClick={() => setFilter('completed')}
              >
                Completed ({projects.filter(p => (p.projectStatus || p.status)?.toLowerCase() === 'completed').length})
              </button>
            </div>
          </div>
          <div className="col-md-6 text-md-end">
            <Link to="/projects/create" className="btn btn-success">
              <i className="fas fa-plus me-1"></i>
              Create New Project
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading projects...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
            <button className="btn btn-outline-danger btn-sm ms-2" onClick={loadProjects}>
              <i className="fas fa-redo me-1"></i>
              Retry
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-folder-plus fa-4x mb-3 text-muted"></i>
            <h4>No Projects Found</h4>
            <p className="text-muted mb-4">
              {filter === 'all' 
                ? "You haven't created or joined any projects yet."
                : `No ${filter} projects found.`
              }
            </p>
            <Link to="/projects/create" className="btn btn-primary">
              <i className="fas fa-plus me-1"></i>
              Create Your First Project
            </Link>
          </div>
        ) : (
          <div className="row">
            {filteredProjects.map(project => (
              <ProjectCard 
                key={project.id || project.projectId} 
                project={{
                  id: project.id || project.projectId,
                  name: project.name || project.projectName,
                  description: project.description || project.projectDescription,
                  status: project.status || project.projectStatus,
                  role: project.role,
                  createdAt: project.createdAt,
                  dueDate: project.dueDate,
                  memberCount: project.memberCount,
                  taskCount: project.taskCount
                }}
              />
            ))}
          </div>
        )}

        {filteredProjects.length > 0 && (
          <div className="card mt-4">
            <div className="card-body text-center bg-light">
              <h6 className="text-muted mb-2">
                <i className="fas fa-info-circle me-2"></i>
                Project Management Tips
              </h6>
              <small className="text-muted">
                Keep your projects organized by updating their status regularly. 
                Use the edit feature to modify project details and invite team members.
              </small>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
