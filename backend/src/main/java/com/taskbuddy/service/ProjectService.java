package com.taskbuddy.service;

import com.taskbuddy.dto.ApiResponse;
import com.taskbuddy.dto.ProjectDto;
import com.taskbuddy.enums.ProjectStatus;

import java.util.List;

/**
 * Service interface for Project management operations
 * Defines the contract for project-related business logic
 */
public interface ProjectService {
    
    /**
     * Create a new project
     * @param dto the project data
     * @param requestingUserId the ID of the user creating the project (becomes manager)
     * @return ApiResponse containing operation result
     */
    ApiResponse<String> createProject(ProjectDto dto, Long requestingUserId);
    
    /**
     * Get all projects
     * @return ApiResponse containing list of projects
     */
    ApiResponse<List<ProjectDto>> getAllProjects();
    
    /**
     * Get project by ID
     * @param projectId the project ID
     * @return ApiResponse containing project data
     */
    ApiResponse<ProjectDto> getProjectById(Long projectId);
    
    /**
     * Get projects managed by a specific user
     * @param managerId the manager's user ID
     * @return ApiResponse containing list of projects
     */
    ApiResponse<List<ProjectDto>> getProjectsByManager(Long managerId);
    
    /**
     * Get projects where user is a member
     * @param userId the user ID
     * @return ApiResponse containing list of projects
     */
    ApiResponse<List<ProjectDto>> getProjectsByMember(Long userId);
    
    /**
     * Update project details (Manager only)
     * @param projectId the project ID
     * @param dto the updated project data
     * @param requestingUserId the ID of the user updating the project
     * @return ApiResponse containing operation result
     */
    ApiResponse<String> updateProject(Long projectId, ProjectDto dto, Long requestingUserId);
    
    /**
     * Delete project (Manager only)
     * @param projectId the project ID
     * @param requestingUserId the ID of the user deleting the project
     * @return ApiResponse containing operation result
     */
    ApiResponse<String> deleteProject(Long projectId, Long requestingUserId);
    
    /**
     * Add member to project (Manager only)
     * @param projectId the project ID
     * @param userId the user ID to add
     * @param requestingUserId the ID of the user adding the member
     * @return ApiResponse containing operation result
     */
    ApiResponse<String> addMemberToProject(Long projectId, Long userId, Long requestingUserId);
    
    /**
     * Remove member from project (Manager only)
     * @param projectId the project ID
     * @param userId the user ID to remove
     * @param requestingUserId the ID of the user removing the member
     * @return ApiResponse containing operation result
     */
    ApiResponse<String> removeMemberFromProject(Long projectId, Long userId, Long requestingUserId);
    
    /**
     * Update project status (Manager only)
     * @param projectId the project ID
     * @param status the new project status
     * @param requestingUserId the ID of the user updating the status
     * @return ApiResponse containing operation result
     */
    ApiResponse<String> updateProjectStatus(Long projectId, ProjectStatus status, Long requestingUserId);
    
    /**
     * Get projects associated with a user (both as manager and member)
     * @param userId the user ID
     * @return ApiResponse containing list of projects
     */
    ApiResponse<List<ProjectDto>> getProjectsByUserId(Long userId);
    
    /**
     * Assign member to project (Manager only)
     * @param projectId the project ID
     * @param userId the user ID to assign
     * @param requestingUserId the ID of the user assigning the member
     * @return ApiResponse containing operation result
     */
    ApiResponse<String> assignMemberToProject(Long projectId, Long userId, Long requestingUserId);
}
