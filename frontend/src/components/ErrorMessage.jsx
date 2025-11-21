import React from "react";

export default function ErrorMessage({ error, onClose }) {
  if (!error) return null;

  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error.response?.data?.message) return error.response.data.message;
    if (error.message) return error.message;
    return 'An unexpected error occurred';
  };

  const getErrorType = (error) => {
    if (error.response?.status === 403) return 'permission';
    if (error.response?.status === 404) return 'notfound';
    if (error.response?.status >= 500) return 'server';
    return 'general';
  };

  const errorType = getErrorType(error);
  const message = getErrorMessage(error);

  const getAlertClass = () => {
    switch (errorType) {
      case 'permission': return 'alert-warning';
      case 'notfound': return 'alert-info';
      case 'server': return 'alert-danger';
      default: return 'alert-danger';
    }
  };

  const getIcon = () => {
    switch (errorType) {
      case 'permission': return 'fa-shield-alt';
      case 'notfound': return 'fa-search';
      case 'server': return 'fa-server';
      default: return 'fa-exclamation-triangle';
    }
  };

  return (
    <div className={`alert ${getAlertClass()} alert-dismissible fade show`} role="alert">
      <i className={`fas ${getIcon()} me-2`}></i>
      <strong>
        {errorType === 'permission' && 'Permission Denied: '}
        {errorType === 'notfound' && 'Not Found: '}
        {errorType === 'server' && 'Server Error: '}
      </strong>
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
}