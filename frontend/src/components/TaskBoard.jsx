// src/components/TaskBoard.jsx
import React from "react";
import TaskCard from "./TaskCard";

export default function TaskBoard({ tasks, projectId, onStatusChange, onAssign, onDelete, projectMembers }) {
  const tasksByStatus = {
    PENDING: tasks.filter(task => !task.status || task.status === 'PENDING'),
    IN_PROGRESS: tasks.filter(task => task.status === 'IN_PROGRESS'),
    COMPLETED: tasks.filter(task => task.status === 'COMPLETED' || task.status === 'ACCEPTED'),
    REJECTED: tasks.filter(task => task.status === 'REJECTED')
  };

  const columns = [
    { 
      key: 'PENDING', 
      title: 'To Do', 
      icon: 'fas fa-clock',
      bgClass: 'bg-light',
      count: tasksByStatus.PENDING.length 
    },
    { 
      key: 'IN_PROGRESS', 
      title: 'In Progress', 
      icon: 'fas fa-spinner',
      bgClass: 'bg-info bg-opacity-10',
      count: tasksByStatus.IN_PROGRESS.length 
    },
    { 
      key: 'COMPLETED', 
      title: 'Completed', 
      icon: 'fas fa-check-circle',
      bgClass: 'bg-success bg-opacity-10',
      count: tasksByStatus.COMPLETED.length 
    },
    { 
      key: 'REJECTED', 
      title: 'Rejected', 
      icon: 'fas fa-times-circle',
      bgClass: 'bg-danger bg-opacity-10',
      count: tasksByStatus.REJECTED.length 
    }
  ];

  return (
    <div className="row g-3">
      {columns.map(column => (
        <div key={column.key} className="col-md-3">
          <div className={`card h-100 ${column.bgClass}`}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <i className={`${column.icon} me-2`}></i>
                {column.title}
              </h6>
              <span className="badge bg-secondary">{column.count}</span>
            </div>
            <div className="card-body" style={{maxHeight: '70vh', overflowY: 'auto'}}>
              {tasksByStatus[column.key].length === 0 ? (
                <div className="text-center text-muted py-4">
                  <i className={`${column.icon} fa-2x mb-2 opacity-50`}></i>
                  <p className="small">No tasks in {column.title.toLowerCase()}</p>
                </div>
              ) : (
                tasksByStatus[column.key].map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    projectId={projectId}
                    onStatusChange={onStatusChange}
                    onAssign={onAssign}
                    onDelete={onDelete}
                    projectMembers={projectMembers}
                    showActions={true}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
