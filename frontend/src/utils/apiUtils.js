export const handleApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.status === 401) {
    return 'Authentication failed. Please login again.';
  }
  
  if (error.response?.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  
  if (error.response?.status === 404) {
    return 'Resource not found.';
  }
  
  if (error.response?.status >= 500) {
    return 'Server error. Please try again later.';
  }
  
  return error.message || 'An unexpected error occurred.';
};

export const extractApiData = (response) => {
  if (response?.data?.success && response?.data?.data) {
    return response.data.data;
  }
  return response?.data || null;
};

export const isApiSuccess = (response) => {
  return response?.data?.success === true;
};