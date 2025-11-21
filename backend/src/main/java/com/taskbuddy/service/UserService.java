package com.taskbuddy.service;

import com.taskbuddy.dto.UserDto;
import com.taskbuddy.dto.RegisterRequestDTO;
import com.taskbuddy.dto.PasswordChangeRequestDto;
import com.taskbuddy.dto.ApiResponse;
import com.taskbuddy.entity.User;
import com.taskbuddy.enums.UserRole;
import java.util.List;

/**
 * Service interface for User management operations
 * Defines the contract for user-related business logic
 */
public interface UserService {
    
    /**
     * Register a new user with MEMBER role by default
     * @param registerRequest the registration data
     * @return ApiResponse containing operation result
     */
    ApiResponse<UserDto> registerUser(RegisterRequestDTO registerRequest);
    
    /**
     * Get all users (Manager only)
     * @return ApiResponse containing list of users
     */
    ApiResponse<List<UserDto>> getAllUsers();
    
    /**
     * Get user by ID
     * @param id the user ID
     * @return ApiResponse containing user data
     */
    ApiResponse<UserDto> getUserById(Long id);
    
    /**
     * Update existing user
     * @param id the user ID
     * @param userDto the updated user data
     * @return ApiResponse containing updated user data
     */
    ApiResponse<UserDto> updateUser(Long id, UserDto userDto);
    
    /**
     * Update user (overloaded for profile updates)
     * @param userDto the updated user data with ID
     * @return ApiResponse containing updated user data
     */
    ApiResponse<UserDto> updateUser(UserDto userDto);
    
    /**
     * Delete user by ID
     * @param id the user ID
     * @return ApiResponse containing operation result
     */
    ApiResponse<String> deleteUser(Long id);
    
    /**
     * Change user role (Manager only)
     * @param id the user ID
     * @param role the new role
     * @return ApiResponse containing updated user data
     */
    ApiResponse<UserDto> changeUserRole(Long id, UserRole role);
    
    /**
     * Get users by role (Manager only)
     * @param role the role to filter by
     * @return ApiResponse containing list of users with specified role
     */
    ApiResponse<List<UserDto>> getUsersByRole(UserRole role);
    
    /**
     * Search users by name or username (Manager only)
     * @param query the search query
     * @return ApiResponse containing matching users
     */
    ApiResponse<List<UserDto>> searchUsers(String query);
    
    /**
     * Find user by username (for authentication)
     * @param username the username
     * @return UserDto if found
     */
    UserDto findByUsername(String username);
    
    /**
     * Find user entity by username (for authentication)
     * @param username the username
     * @return User entity if found
     */
    User findUserByUsername(String username);
    
    /**
     * Find user entity by email
     * @param email the email
     * @return User entity if found
     */
    User findByEmail(String email);
    
    /**
     * Check if username exists
     * @param username the username to check
     * @return true if exists
     */
    boolean existsByUsername(String username);
    
    /**
     * Check if email exists
     * @param email the email to check
     * @return true if exists
     */
    boolean existsByEmail(String email);
    
    /**
     * Get project members
     * @param projectId the project ID
     * @return ApiResponse containing list of project members
     */
    ApiResponse<List<UserDto>> getProjectMembers(Long projectId);
    
    /**
     * Change user password
     * @param userId the user ID
     * @param passwordChangeRequest the password change request
     * @return ApiResponse containing operation result
     */
    ApiResponse<String> changePassword(Long userId, PasswordChangeRequestDto passwordChangeRequest);
    
    /**
     * Get user's role in a specific project
     * @param projectId the project ID
     * @param userId the user ID
     * @return ApiResponse containing user's role in the project
     */
    ApiResponse<String> getUserRoleInProject(Long projectId, Long userId);
}
