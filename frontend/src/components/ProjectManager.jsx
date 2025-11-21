// src/components/ProjectManager.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAllProjects, createProject, updateProject, updateProjectStatus } from '../api/project';
import { useAuth } from '../context/AuthContext';

export default function ProjectManager() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    managerId: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await getAllProjects();
      setProjects(response.data || []);
    } catch (error) {
      toast.error('Failed to load projects');
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const projectData = {
        ...formData,
        managerId: user.id
      };

      if (editingProject) {
        await updateProject(editingProject.id, projectData, user.id);
        toast.success('Project updated successfully!');
      } else {
        await createProject(projectData);
        toast.success('Project created successfully!');
      }

      setShowCreateModal(false);
      setEditingProject(null);
      setFormData({ name: '', description: '', managerId: '' });
      loadProjects();
    } catch (error) {
      toast.error(editingProject ? 'Failed to update project' : 'Failed to create project');
      console.error('Error saving project:', error);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      managerId: project.managerId
    });
    setShowCreateModal(true);
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      await updateProjectStatus(projectId, newStatus);
      toast.success(`Project status updated to ${newStatus}`);
      loadProjects();
    } catch (error) {
      toast.error('Failed to update project status');
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'warning',
      'ACCEPTED': 'info',
      'ACTIVE': 'success',
      'IN_PROGRESS': 'primary',
      'COMPLETED': 'success',
      'ON_HOLD': 'secondary',
      'CANCELLED': 'danger',
      'REJECTED': 'danger'
    };
    return colors[status] || 'secondary';
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingProject(null);
    setFormData({ name: '', description: '', managerId: '' });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">
              <i className="fas fa-project-diagram me-2 text-primary"></i>
              Project Management
            </h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              <i className="fas fa-plus me-2"></i>
              Create Project
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="row">
        {projects.length === 0 ? (
          <div className="col-12">
            <div className="text-center py-5">
              <i className="fas fa-folder-open fa-4x text-muted mb-3"></i>
              <h4 className="text-muted">No projects found</h4>
              <p className="text-muted">Create your first project to get started!</p>
            </div>
          </div>
        ) : (
          projects.map(project => (
            <div key={project.id} className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100 shadow-sm hover-shadow">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold">{project.name}</h6>
                  <span className={`badge bg-${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                <div className="card-body">
                  <p className="card-text text-muted">{project.description}</p>
                  <div className="mb-2">
                    <small className="text-muted">
                      <i className="fas fa-user me-1"></i>
                      Manager: {project.managerName}
                    </small>
                  </div>
                  {project.createdAt && (
                    <div className="mb-3">
                      <small className="text-muted">
                        <i className="fas fa-calendar me-1"></i>
                        Created: {new Date(project.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  )}
                </div>
                <div className="card-footer bg-transparent">
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-primary btn-sm flex-fill"
                      onClick={() => handleEdit(project)}
                    >
                      <i className="fas fa-edit me-1"></i>
                      Edit
                    </button>
                    <div className="dropdown">
                      <button
                        className="btn btn-outline-secondary btn-sm dropdown-toggle"
                        type="button"
                        data-bs-toggle="dropdown"
                      >
                        Status
                      </button>
                      <ul className="dropdown-menu">
                        {['PENDING', 'ACCEPTED', 'ACTIVE', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'].map(status => (
                          <li key={status}>
                            <button
                              className="dropdown-item"
                              onClick={() => handleStatusChange(project.id, status)}
                            >
                              {status}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-backdrop fade show" onClick={closeModal}></div>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-project-diagram me-2"></i>
                  {editingProject ? 'Edit Project' : 'Create New Project'}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-tag me-2 text-primary"></i>
                      Project Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter project name"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-align-left me-2 text-primary"></i>
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Enter project description"
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-save me-2"></i>
                    {editingProject ? 'Update Project' : 'Create Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
