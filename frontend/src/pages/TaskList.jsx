// src/pages/TaskList.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getTasksByProject, updateTaskStatus, reassignTask, deleteTask } from "../api/task";
import { getProject } from "../api/project";
import { getProjectMembers } from "../api/member";
import { handleApiResponse } from "../api/utils";
import TaskCard from "../components/TaskCard";
import TaskBoard from "../components/TaskBoard";

export default function TaskList() {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState({});
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('board'); // 'list' or 'board'
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (projectId) {
      Promise.all([
        getTasksByProject(projectId).catch(() => ({ data: { data: [] } })),
        getProject(projectId).catch(() => ({ data: { data: {} } })),
        getProjectMembers(projectId).catch(() => ({ data: { data: [] } }))
      ]).then(([tasksRes, projectRes, membersRes]) => {
        // Use utility function to handle ApiResponse format
        const tasksData = handleApiResponse(tasksRes, []);
        const projectData = handleApiResponse(projectRes, {});
        const membersData = handleApiResponse(membersRes, []);
        
        setTasks(Array.isArray(tasksData) ? tasksData : []);
        setProject(projectData);
        setProjectMembers(Array.isArray(membersData) ? membersData : []);
        setLoading(false);
      }).catch(err => {
        console.error("Error loading data:", err);
        setTasks([]);
        setProject({});
        setProjectMembers([]);
        setLoading(false);
      });
    }
  }, [projectId]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleTaskAssign = async (taskId, assigneeId) => {
    try {
      // The backend obtains the requesting user from the authentication principal
      // Only the taskId and new assignee are required.
      await reassignTask(taskId, assigneeId);

      // Find the assignee name among the loaded project members.  The
      // projectMembers list comes from the /project-members endpoint and
      // contains userId and userName fields.
      const assignee = projectMembers.find(member => member.userId == assigneeId);
      const assigneeName = assignee ? assignee.userName : '';

      setTasks(tasks.map(task => 
        task.id === taskId
          ? {
              ...task,
              assignedUserId: assigneeId || null,
              assignedUserName: assigneeName || null,
            }
          : task
      ));
    } catch (error) {
      console.error("Error assigning task:", error);
    }
  };

  const handleTaskDelete = async (taskId) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = currentUser.id || currentUser.userId || 1;
      
      await deleteTask(taskId, userId);
      
      // Remove task from the list
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task: " + (error.response?.data?.message || error.message));
    }
  };

  const getFilteredTasks = () => {
    if (filter === 'ALL') return tasks;
    return tasks.filter(task => task.status === filter);
  };

  const getTaskStats = () => {
    const stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'PENDING').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      completed: tasks.filter(t => t.status === 'COMPLETED').length,
      rejected: tasks.filter(t => t.status === 'REJECTED').length
    };
    return stats;
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

  const stats = getTaskStats();
  const filteredTasks = getFilteredTasks();

  return (
    <div className="container-fluid mt-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/projects" className="text-decoration-none">Projects</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to={`/projects/${projectId}`} className="text-decoration-none">
                  {project.name || 'Project'}
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">Tasks</li>
            </ol>
          </nav>
        </div>
        <div className="col-md-4 text-end">
          <Link to={`/projects/${projectId}/tasks/create`} className="btn btn-primary">
            <i className="fas fa-plus me-2"></i>Create New Task
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-gradient" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            <div className="card-body text-white">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{stats.total}</h4>
                  <p className="mb-0">Total Tasks</p>
                </div>
                <i className="fas fa-tasks fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-gradient" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
            <div className="card-body text-white">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{stats.pending}</h4>
                  <p className="mb-0">Pending</p>
                </div>
                <i className="fas fa-clock fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-gradient" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
            <div className="card-body text-white">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{stats.inProgress}</h4>
                  <p className="mb-0">In Progress</p>
                </div>
                <i className="fas fa-spinner fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-gradient" style={{background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>
            <div className="card-body text-white">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="mb-0">{stats.completed}</h4>
                  <p className="mb-0">Completed</p>
                </div>
                <i className="fas fa-check-circle fa-2x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <div className="btn-group" role="group">
                    <button
                      type="button"
                      className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setViewMode('list')}>
                      <i className="fas fa-list me-2"></i>List View
                    </button>
                    <button
                      type="button"
                      className={`btn ${viewMode === 'board' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setViewMode('board')}>
                      <i className="fas fa-columns me-2"></i>Board View
                    </button>
                  </div>
                </div>
                {/* Filter button removed as requested */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Display */}
      {tasks.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-tasks fa-4x text-muted mb-3"></i>
          <h4 className="text-muted">No Tasks Yet</h4>
          <p className="text-muted">Get started by creating your first task for this project</p>
          <Link to={`/projects/${projectId}/tasks/create`} className="btn btn-primary btn-lg">
            <i className="fas fa-plus me-2"></i>Create First Task
          </Link>
        </div>
      ) : (
        <>
          {viewMode === 'board' ? (
            <TaskBoard 
              tasks={filteredTasks} 
              projectId={projectId}
              onStatusChange={handleStatusChange}
              onAssign={handleTaskAssign}
              onDelete={handleTaskDelete}
              projectMembers={projectMembers}
            />
          ) : (
            <div className="row">
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <p className="text-muted mb-0">
                    Showing {filteredTasks.length} of {tasks.length} tasks
                    {filter !== 'ALL' && ` (filtered by: ${filter})`}
                  </p>
                  <div className="dropdown">
                    <button 
                      className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                      type="button" 
                      data-bs-toggle="dropdown">
                      <i className="fas fa-sort me-2"></i>Sort
                    </button>
                    <ul className="dropdown-menu">
                      <li><button className="dropdown-item" onClick={() => {}}>Date Created</button></li>
                      <li><button className="dropdown-item" onClick={() => {}}>Due Date</button></li>
                      <li><button className="dropdown-item" onClick={() => {}}>Priority</button></li>
                      <li><button className="dropdown-item" onClick={() => {}}>Status</button></li>
                    </ul>
                  </div>
                </div>
                {filteredTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    projectId={projectId}
                    onStatusChange={handleStatusChange}
                    onAssign={handleTaskAssign}
                    onDelete={handleTaskDelete}
                    projectMembers={projectMembers}
                    showActions={true}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Floating Action Button for Desktop compatibility only */}
      <Link 
        to={`/projects/${projectId}/tasks/create`}
        className="btn btn-primary rounded-circle position-fixed shadow d-none d-lg-flex"
        style={{
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
        <i className="fas fa-plus fa-lg"></i>
      </Link>
    </div>
  );
}
