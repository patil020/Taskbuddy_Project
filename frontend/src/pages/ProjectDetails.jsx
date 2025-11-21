// src/pages/ProjectDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { showSuccess, showError, showWarning } from "../utils/toastUtils";
import { getProject } from "../api/project";
import { getMyRoleInProject } from "../api/user";
import { getProjectMembers } from "../api/member";
import { getTasksByProject, updateTaskStatus, reassignTask, deleteTask } from "../api/task";
import MemberCard from "../components/MemberCard";
import TaskCard from "../components/TaskCard";
import CommentSection from "../components/CommentSection";
import AssignMember from "../components/AssignMember";

import ProjectStatusManager from "../components/ProjectStatusManager";
import { useAuth } from "../context/AuthContext";


export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState({});
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignMember, setShowAssignMember] = useState(false);

  const [isManager, setIsManager] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [roleChecked, setRoleChecked] = useState(false);

  const loadProjectData = () => {
    setLoading(true);
    Promise.all([
      getProject(id).catch(err => {
        console.error("Failed to load project:", err);
        return { data: { id, name: "Project", description: "Failed to load project details" } };
      }),
      getProjectMembers(id).then(res => res.data?.data || res.data || []).catch(err => {
        console.error("Failed to load members:", err);
        return [];
      }),
      getTasksByProject(id).catch(err => {
        console.error("Failed to load tasks:", err);
        return { data: [] };
      })
    ]).then(([projectRes, membersData, tasksRes]) => {
      const projectData = projectRes.data || {};
      const tasksData = Array.isArray(tasksRes.data) ? tasksRes.data : [];
      
      setProject(projectData);
      setMembers(Array.isArray(membersData) ? membersData : []);
      setTasks(tasksData);
      
      // Get current user's role in this project
      if (user?.id) {
        getMyRoleInProject(id)
          .then(roleRes => {
            const role = roleRes.data?.data;
            setUserRole(role);
            setIsManager(role === 'MANAGER');
            setRoleChecked(true);
          })
          .catch(err => {
            console.error('Failed to get user role:', err);
            setUserRole(null);
            setIsManager(false);
            setRoleChecked(true);
          });
      } else {
        setRoleChecked(true);
      }
      setLoading(false);
    }).catch(err => {
      console.error("Error loading project details:", err);
      showError('Failed to load project details: ' + (err.response?.data?.message || err.message));
      setProject({});
      setMembers([]);
      setTasks([]);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      showSuccess('Task status updated successfully!');
    } catch (error) {
      console.error("Error updating task status:", error);
      showError('Failed to update task status: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleTaskAssign = async (taskId, assigneeId) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = currentUser.id || currentUser.userId || 1;
      
      await reassignTask(taskId, assigneeId, userId);
      
      // Find the assignee name
      const assignee = members.find(member => 
        (member.user?.id || member.userId) == assigneeId
      );
      const assigneeName = assignee ? (assignee.user?.name || assignee.userName) : '';
      
      setTasks(tasks.map(task => 
        task.id === taskId ? { 
          ...task, 
          assignedUserId: assigneeId || null,
          assignedUserName: assigneeName || null
        } : task
      ));
      
      showSuccess(assigneeId ? 'Task assigned successfully!' : 'Task unassigned successfully!');
    } catch (error) {
      console.error("Error assigning task:", error);
      showError('Failed to assign task: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleTaskDelete = async (taskId) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = currentUser.id || currentUser.userId || 1;
      
      await deleteTask(taskId, userId);
      
      // Remove task from the list
      setTasks(tasks.filter(task => task.id !== taskId));
      showSuccess('Task deleted successfully!');
    } catch (error) {
      console.error("Error deleting task:", error);
      showError('Failed to delete task: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleStatusUpdate = (newStatus) => {
    setProject(prev => ({ ...prev, status: newStatus }));
    showSuccess('Project status updated successfully!');
  };


  // Show error toast only after role check is complete and user is not a member
  useEffect(() => {
    if (!loading && roleChecked && !userRole) {
      showError("You are not a member of this project.");
    }
    // eslint-disable-next-line
  }, [userRole, loading, roleChecked]);

  if (loading || !roleChecked) return <div className="container mt-4"><h4>Loading...</h4></div>;
  if (roleChecked && !userRole) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">You are not a member of this project.</div>
        <Link to="/projects" className="btn btn-primary mt-3">Back to Projects</Link>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Project Details</h3>
        <div>
          <Link to={`/projects/${id}/assignments`} className="btn btn-info me-2">
            <i className="fas fa-users me-1"></i>
            Manage Members
          </Link>
          <Link to={`/projects/${id}/tasks/assignments`} className="btn btn-success me-2">
            <i className="fas fa-tasks me-1"></i>
            Manage Task Assignments
          </Link>
          <Link to={`/projects/${id}/edit`} className="btn btn-warning">
            <i className="fas fa-edit me-1"></i>
            Edit Project
          </Link>
        </div>
      </div>
      
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h5 className="card-title">{project.name || 'Untitled Project'}</h5>
              <p className="card-text">{project.description || 'No description available'}</p>
            </div>
            <div className="text-end">
              <ProjectStatusManager
                projectId={id}
                currentStatus={project.status}
                onStatusUpdate={handleStatusUpdate}
                disabled={!isManager}
              />
              {project.managerId && (
                <div className="mt-2">
                  <small className="text-muted">
                    Manager: {project.managerName || 'Unknown'}
                  </small>
                </div>
              )}
              {userRole && (
                <div className="mt-2">
                  <span className={`badge ${userRole === 'MANAGER' ? 'bg-primary' : 'bg-secondary'}`}>
                    You are {userRole === 'MANAGER' ? 'Manager' : 'Member'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Members ({members.length})</h5>
            <div>
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => setShowAssignMember(true)}
              >
                <i className="fas fa-envelope me-1"></i>
                Invite Member
              </button>
            </div>
          </div>
          
          {showAssignMember && (
            <div className="mb-3">
              <AssignMember 
                projectId={id}
                onMemberAdded={() => {
                  setShowAssignMember(false);
                  loadProjectData();
                }}
                onClose={() => setShowAssignMember(false)}
              />
            </div>
          )}
          

          
          <div>
            {members.length === 0 ? (
              <div className="text-center py-4 border rounded bg-light">
                <i className="fas fa-users fa-2x text-muted mb-2"></i>
                <p className="text-muted mb-2">No members found for this project.</p>
              </div>
            ) : (
              members.map(mem => <MemberCard key={mem.id || mem.userId} member={mem} />)
            )}
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>
              <i className="fas fa-tasks me-2 text-primary"></i>
              Recent Tasks ({tasks.length})
            </h5>
            <div>
              <Link to={`/projects/${id}/tasks/assignments`} className="btn btn-sm btn-info me-2">
                <i className="fas fa-user-cog me-1"></i>Manage Task Assignments
              </Link>
              <Link to={`/projects/${id}/tasks`} className="btn btn-sm btn-outline-primary me-2">
                <i className="fas fa-eye me-1"></i>View All
              </Link>
            </div>
          </div>
          
          {tasks.length === 0 ? (
            <div className="text-center py-4 border rounded bg-light">
              <i className="fas fa-tasks fa-2x text-muted mb-2"></i>
              <p className="text-muted mb-2">No tasks created yet</p>
            </div>
          ) : (
            <div>
              {tasks.slice(0, 3).map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  projectId={id} 
                  onStatusChange={handleStatusChange}
                  onAssign={handleTaskAssign}
                  onDelete={handleTaskDelete}
                  projectMembers={members}
                  showActions={true} 
                />
              ))}
              {tasks.length > 3 && (
                <div className="text-center mt-2">
                  <Link to={`/projects/${id}/tasks`} className="btn btn-outline-primary btn-sm">
                    View {tasks.length - 3} more tasks
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Project Comments Section */}
      <CommentSection 
        type="project" 
        entityId={id} 
        projectId={id}
      />
    </div>
  );
}
