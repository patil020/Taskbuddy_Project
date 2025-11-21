// src/api/utils.js

/**
 * Extracts data from ApiResponse format
 * Backend returns: { message: "...", data: actual_data }
 * This function extracts the actual_data part
 */
export function extractApiData(response) {
  if (!response) return null;
  
  // If response has data property, check if it's ApiResponse format
  if (response.data) {
    // If response.data has both message and data, it's ApiResponse format
    if (response.data.hasOwnProperty('message') && response.data.hasOwnProperty('data')) {
      return response.data.data;
    }
    // Otherwise, return the data directly
    return response.data;
  }
  
  return response;
}

/**
 * Handles API response with error handling
 */
export function handleApiResponse(response, fallback = null) {
  try {
    const data = extractApiData(response);
    return data !== null && data !== undefined ? data : fallback;
  } catch (error) {
    console.error('Error handling API response:', error);
    return fallback;
  }
}

/**
 * Extracts message from ApiResponse format
 */
export function extractApiMessage(response) {
  if (response?.data?.message) {
    return response.data.message;
  }
  return '';
}

// Alias for backward compatibility
export const extractData = extractApiData;
