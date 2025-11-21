package com.taskbuddy.service;

import com.taskbuddy.dto.ApiResponse;
import com.taskbuddy.dto.CommentDto;
import java.util.List;

/**
 * Service interface for Comment management operations
 * Defines the contract for comment-related business logic
 */
public interface CommentService {
    
    /**
     * Add comment to a project
     * @param projectId the project ID
     * @param dto the comment data
     * @param userId the ID of the user adding the comment
     * @return ApiResponse containing the created comment
     */
    ApiResponse<CommentDto> addProjectComment(Long projectId, CommentDto dto, Long userId);
    
    /**
     * Add comment to a task
     * @param taskId the task ID
     * @param dto the comment data
     * @param userId the ID of the user adding the comment
     * @return ApiResponse containing the created comment
     */
    ApiResponse<CommentDto> addTaskComment(Long taskId, CommentDto dto, Long userId);
    
    /**
     * Get all comments for a task
     * @param taskId the task ID
     * @return ApiResponse containing list of comments
     */
    ApiResponse<List<CommentDto>> getTaskComments(Long taskId);
    
    /**
     * Get all comments for a project
     * @param projectId the project ID
     * @return ApiResponse containing list of comments
     */
    ApiResponse<List<CommentDto>> getProjectComments(Long projectId);
    
    /**
     * Update a comment (owner only)
     * @param commentId the comment ID
     * @param dto the updated comment data
     * @param userId the ID of the user updating the comment
     * @return ApiResponse containing operation result
     */
    ApiResponse<String> updateComment(Long commentId, CommentDto dto, Long userId);
    
    /**
     * Delete a comment (owner only)
     * @param commentId the comment ID
     * @param userId the ID of the user deleting the comment
     * @return ApiResponse containing operation result
     */
    ApiResponse<String> deleteComment(Long commentId, Long userId);
    
    /**
     * Get all comments (admin only)
     * @return ApiResponse containing list of all comments
     */
    ApiResponse<List<CommentDto>> getAllComments();
    
    /**
     * Add comment (legacy method for backward compatibility)
     * @param dto the comment data
     * @return ApiResponse containing operation result
     */
    ApiResponse<String> addComment(CommentDto dto);
    
    /**
     * Get comments for task (legacy method)
     * @param taskId the task ID
     * @return List of comments
     */
    List<CommentDto> getCommentsForTask(Long taskId);
    
    /**
     * Get comments for project (legacy method)
     * @param projectId the project ID
     * @return List of comments
     */
    List<CommentDto> getCommentsForProject(Long projectId);
}
