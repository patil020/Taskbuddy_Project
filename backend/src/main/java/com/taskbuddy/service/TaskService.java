package com.taskbuddy.service;

import com.taskbuddy.dto.ApiResponse;
import com.taskbuddy.dto.TaskDto;
import com.taskbuddy.enums.TaskStatus;

import java.util.List;

/**
 * Service interface for Task management operations
 * Defines the contract for task-related business logic
 */
public interface TaskService {
    
    /**
     * Create a new task (Manager only)
     * @param taskDto the task data
     * @param requestingUserId the ID of the user creating the task
     * @return ApiResponse containing operation result
     */
    ApiResponse<String> createTask(TaskDto taskDto, Long requestingUserId);
    
    /**
     * Get all tasks
     * @return ApiResponse containing list of tasks
     */
    ApiResponse<List<TaskDto>> getAllTasks();
    
    /**
     * Get task by ID
     * @param taskId the task ID
     * @return ApiResponse containing task data
     */
    ApiResponse<TaskDto> getTaskById(Long taskId);
    
    /**
     * Get tasks by project ID
     * @param projectId the project ID
     * @return ApiResponse containing list of tasks
     */
    ApiResponse<List<TaskDto>> getTasksByProjectId(Long projectId);
    
    /**
     * Update task details
     * @param taskId the task ID
     * @param taskDto the updated task data
     * @param requestingUserId the ID of the user updating the task
     * @return ApiResponse containing operation result
     */
    ApiResponse<String> updateTask(Long taskId, TaskDto taskDto, Long requestingUserId);
    
    /**
     * Update task status (Assignee only)
     * @param taskId the task ID
     * @param status the new status
     * @param requestingUserId the ID of the user updating the status
     * @return ApiResponse containing operation result
     */
    ApiResponse<String> updateTaskStatus(Long taskId, TaskStatus status, Long requestingUserId);
    
    /**
     * Delete task (Manager only)
     * @param taskId the task ID
     * @param requestingUserId the ID of the user deleting the task
     * @return ApiResponse containing operation result
     */
    ApiResponse<String> deleteTask(Long taskId, Long requestingUserId);
    
    /**
     * Reassign task to another user (Manager only)
     * @param taskId the task ID
     * @param newAssigneeId the ID of the new assignee
     * @param requestingUserId the ID of the user making the reassignment
     * @return ApiResponse containing operation result
     */
    ApiResponse<String> reassignTask(Long taskId, Long newAssigneeId, Long requestingUserId);
}
