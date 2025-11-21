import React from 'react';

const Alert = ({ type = 'info', message, onClose, className = '' }) => {
  if (!message) return null;

  const alertTypes = {
    success: { class: 'alert-success', icon: 'fa-check-circle' },
    error: { class: 'alert-danger', icon: 'fa-exclamation-triangle' },
    warning: { class: 'alert-warning', icon: 'fa-exclamation-triangle' },
    info: { class: 'alert-info', icon: 'fa-info-circle' }
  };

  const alertConfig = alertTypes[type] || alertTypes.info;

  return (
    <div className={`alert ${alertConfig.class} ${className}`} role="alert">
      <i className={`fas ${alertConfig.icon} me-2`}></i>
      {message}
      {onClose && (
        <button 
          type="button" 
          className="btn-close" 
          onClick={onClose}
          aria-label="Close"
        ></button>
      )}
    </div>
  );
};

export default Alert;