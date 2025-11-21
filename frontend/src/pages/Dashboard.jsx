// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllProjects } from "../api/project";
import { getAllTasks } from "../api/task";
import { getUnreadNotifications } from "../api/notification";
import { toast } from 'react-toastify';

export default function Dashboard() {
  const { user } = useAuth();
  const userId = user?.id ?? user?.userId ?? null;

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    upcomingTasks: 0
  });

  useEffect(() => {
    if (!userId) return;
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Loading dashboard data for user:', userId);
      
      const [projectsRes, tasksRes, notificationsRes] = await Promise.all([
        getAllProjects().catch(err => {
          console.log('Projects API error:', err);
          return { data: [] };
        }),
        getAllTasks().catch(err => {
          console.log('Tasks API error:', err);
          return { data: [] };
        }),
        getUnreadNotifications().catch(err => {
          console.log('Notifications API error:', err);
          return { data: [] };
        })
      ]);

      console.log('API responses:', { projectsRes, tasksRes, notificationsRes });

      const projectData = Array.isArray(projectsRes.data) ? projectsRes.data : [];
      const taskData = Array.isArray(tasksRes.data) ? tasksRes.data : [];
      const notificationData = Array.isArray(notificationsRes.data) ? notificationsRes.data : [];

      console.log('Processed data:', { projectData, taskData, notificationData });

      setProjects(projectData);
      setTasks(taskData);
      setNotifications(notificationData);

      // Calculate upcoming tasks (tasks with deadlines in next 7 days)
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcomingTasks = taskData.filter(task => {
        if (!task.deadline) return false;
        const deadline = new Date(task.deadline);
        return deadline >= now && deadline <= nextWeek;
      }).length;

      const calculatedStats = {
        totalProjects: projectData.length,
        activeProjects: projectData.filter(p => p.status === 'ACTIVE').length,
        totalTasks: taskData.length,
        completedTasks: taskData.filter(t => t.status === 'COMPLETED').length,
        pendingTasks: taskData.filter(t => t.status === 'PENDING').length,
        upcomingTasks
      };

      console.log('Calculated stats:', calculatedStats);
      setStats(calculatedStats);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getUpcomingTasks = () => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return tasks.filter(task => {
      if (!task.deadline) return false;
      const deadline = new Date(task.deadline);
      return deadline >= now && deadline <= nextWeek;
    }).slice(0, 5);
  };



  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4">
      {/* Welcome Header */}
      <div className="row mb-4">
        <div className="col">
          <div className="bg-gradient-primary text-white rounded-3 p-4">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h1 className="h3 mb-2">
                  {getGreeting()}, {user?.username || user?.name}! 👋
                </h1>
                <p className="mb-0 opacity-75">
                  Welcome back to TaskBuddy. Here's what's happening with your projects today.
                </p>
              </div>
              <div className="col-md-4 text-md-end">
                <div className="badge bg-light text-dark fs-6 px-3 py-2">
                  <i className="fas fa-calendar me-2"></i>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
          <div className="card bg-primary text-white h-100">
            <div className="card-body text-center">
              <i className="fas fa-project-diagram fa-2x mb-2"></i>
              <h3 className="fw-bold">{stats.totalProjects}</h3>
              <p className="mb-0 small">Total Projects</p>
            </div>
          </div>
        </div>
        
        <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
          <div className="card bg-success text-white h-100">
            <div className="card-body text-center">
              <i className="fas fa-play-circle fa-2x mb-2"></i>
              <h3 className="fw-bold">{stats.activeProjects}</h3>
              <p className="mb-0 small">Active Projects</p>
            </div>
          </div>
        </div>
        
        <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
          <div className="card bg-info text-white h-100">
            <div className="card-body text-center">
              <i className="fas fa-tasks fa-2x mb-2"></i>
              <h3 className="fw-bold">{stats.totalTasks}</h3>
              <p className="mb-0 small">Total Tasks</p>
            </div>
          </div>
        </div>
        
        <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
          <div className="card bg-warning text-white h-100">
            <div className="card-body text-center">
              <i className="fas fa-clock fa-2x mb-2"></i>
              <h3 className="fw-bold">{stats.pendingTasks}</h3>
              <p className="mb-0 small">Pending Tasks</p>
            </div>
          </div>
        </div>
        
        <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
          <div className="card bg-secondary text-white h-100">
            <div className="card-body text-center">
              <i className="fas fa-check-circle fa-2x mb-2"></i>
              <h3 className="fw-bold">{stats.completedTasks}</h3>
              <p className="mb-0 small">Completed</p>
            </div>
          </div>
        </div>
        
        <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
          <div className="card bg-danger text-white h-100">
            <div className="card-body text-center">
              <i className="fas fa-exclamation-triangle fa-2x mb-2"></i>
              <h3 className="fw-bold">{stats.upcomingTasks}</h3>
              <p className="mb-0 small">Due This Week</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Recent Projects */}
        <div className="col-lg-8 mb-4">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-project-diagram me-2 text-primary"></i>
                Recent Projects
              </h5>
              <Link to="/projects" className="btn btn-outline-primary btn-sm">
                View All
              </Link>
            </div>
            <div className="card-body">
              {projects.length === 0 ? (
                <div className="text-center py-4">
                  <i className="fas fa-folder-open fa-3x text-muted mb-3"></i>
                  <h6 className="text-muted">No projects yet</h6>
                  <p className="text-muted small mb-3">Start by creating your first project to organize your tasks</p>
                  <Link to="/projects/create" className="btn btn-primary">
                    <i className="fas fa-plus me-2"></i>
                    Create Your First Project
                  </Link>
                </div>
              ) : (
                <div className="row">
                  {projects.slice(0, 4).map(project => (
                    <div key={project.id} className="col-md-6 mb-3">
                      <div className="card bg-light">
                        <div className="card-body">
                          <h6 className="card-title">{project.name}</h6>
                          <p className="card-text text-muted small">
                            {project.description?.substring(0, 60)}...
                          </p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className={`badge bg-${project.status === 'ACTIVE' ? 'success' : 'warning'}`}>
                              {project.status}
                            </span>
                            <Link 
                              to={`/projects/${project.id}`} 
                              className="btn btn-outline-primary btn-sm"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Tasks & Notifications */}
        <div className="col-lg-4">
          {/* Upcoming Tasks */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-calendar-alt me-2 text-danger"></i>
                Upcoming Tasks
              </h5>
            </div>
            <div className="card-body">
              {getUpcomingTasks().length === 0 ? (
                <div className="text-center text-muted py-3">
                  <i className="fas fa-calendar-check fa-2x mb-2"></i>
                  <p className="small mb-0">No upcoming deadlines</p>
                  <p className="small mb-0">You're all caught up! 🎉</p>
                </div>
              ) : (
                <div>
                  {getUpcomingTasks().map(task => (
                    <div key={task.id} className="d-flex align-items-start mb-3">
                      <div className="flex-shrink-0">
                        <i className="fas fa-clock text-warning"></i>
                      </div>
                      <div className="flex-grow-1 ms-2">
                        <h6 className="mb-1 small">{task.title}</h6>
                        <small className="text-muted">
                          Due: {new Date(task.deadline).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-bell me-2 text-warning"></i>
                Notifications
              </h5>
              <Link to="/notifications" className="btn btn-outline-warning btn-sm">
                View All
              </Link>
            </div>
            <div className="card-body">
              {notifications.length === 0 ? (
                <div className="text-center text-muted py-3">
                  <i className="fas fa-bell-slash fa-2x mb-2"></i>
                  <p className="small mb-0">No new notifications</p>
                  <p className="small mb-0">Stay tuned for updates!</p>
                </div>
              ) : (
                <div>
                  {notifications.slice(0, 3).map(notification => (
                    <div key={notification.id} className="d-flex align-items-start mb-3">
                      <div className="flex-shrink-0">
                        <i className="fas fa-info-circle text-primary"></i>
                      </div>
                      <div className="flex-grow-1 ms-2">
                        <p className="mb-1 small">{notification.message}</p>
                        <small className="text-muted">
                          {notification.type}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-bolt me-2 text-success"></i>
                Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 col-sm-6 mb-3">
                  <Link to="/projects/create" className="btn btn-outline-success w-100">
                    <i className="fas fa-plus-circle fa-lg mb-2 d-block"></i>
                    Create Project
                  </Link>
                </div>
                <div className="col-md-3 col-sm-6 mb-3">
                  <Link to="/projects" className="btn btn-outline-primary w-100">
                    <i className="fas fa-project-diagram fa-lg mb-2 d-block"></i>
                    Browse Projects
                  </Link>
                </div>
                <div className="col-md-3 col-sm-6 mb-3">
                  <Link to="/invites" className="btn btn-outline-info w-100">
                    <i className="fas fa-envelope fa-lg mb-2 d-block"></i>
                    Check Invites
                  </Link>
                </div>
                <div className="col-md-3 col-sm-6 mb-3">
                  <Link to="/notifications" className="btn btn-outline-warning w-100">
                    <i className="fas fa-bell fa-lg mb-2 d-block"></i>
                    Notifications
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}