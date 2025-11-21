// src/utils/badgeUtils.js
// Utility functions for badge classes and date formatting used across Task components

export function getStatusBadgeClass(status) {
  switch (status) {
    case 'PENDING': return 'warning';
    case 'IN_PROGRESS': return 'info';
    case 'COMPLETED': return 'success';
    case 'ACCEPTED': return 'success';
    case 'REJECTED': return 'danger';
    default: return 'secondary';
  }
}

export function getPriorityBadgeClass(priority) {
  switch (priority) {
    case 'HIGH': return 'danger';
    case 'MEDIUM': return 'warning';
    case 'LOW': return 'success';
    default: return 'secondary';
  }
}

export function formatDate(dateString) {
  if (!dateString) return 'No due date set';
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
