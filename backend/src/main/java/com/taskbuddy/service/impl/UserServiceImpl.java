package com.taskbuddy.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.taskbuddy.repository.UserRepository;
import com.taskbuddy.repository.ProjectMemberRepository;
import com.taskbuddy.entity.User;
import com.taskbuddy.dto.UserDto;
import com.taskbuddy.dto.RegisterRequestDTO;
import com.taskbuddy.dto.PasswordChangeRequestDto;
import com.taskbuddy.dto.ApiResponse;
import com.taskbuddy.service.UserService;
import com.taskbuddy.enums.UserRole;
import com.taskbuddy.exception.ResourceNotFoundException;
import com.taskbuddy.exception.InvalidInputException;
import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of UserService interface
 * Contains business logic for user management operations
 */
@Service
@Transactional
@AllArgsConstructor
public class UserServiceImpl implements UserService {
    
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public ApiResponse<UserDto> registerUser(@Valid RegisterRequestDTO registerRequest) {
        // Check if username already exists
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new InvalidInputException("Username already exists!");
        }
        
        // Check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new InvalidInputException("Email already registered!");
        }
        
        // Create new user entity
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(UserRole.USER); // All new users get USER role
        
        User savedUser = userRepository.save(user);
        UserDto savedUserDto = modelMapper.map(savedUser, UserDto.class);
        
        return new ApiResponse<>(true, "User registered successfully!", savedUserDto);
    }

    @Override
    public ApiResponse<List<UserDto>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserDto> userDtos = users.stream()
                .map(user -> modelMapper.map(user, UserDto.class))
                .collect(Collectors.toList());
        
        return new ApiResponse<>(true, "Users retrieved successfully!", userDtos);
    }

    @Override
    public ApiResponse<UserDto> getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        
        UserDto userDto = modelMapper.map(user, UserDto.class);
        return new ApiResponse<>(true, "User retrieved successfully!", userDto);
    }

    @Override
    public ApiResponse<UserDto> updateUser(Long id, UserDto userDto) {
        User existingUser = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        
        // Check if username is being changed and if it already exists
        if (!existingUser.getUsername().equals(userDto.getUsername()) && 
            userRepository.existsByUsername(userDto.getUsername())) {
            throw new InvalidInputException("Username already exists!");
        }
        
        // Check if email is being changed and if it already exists
        if (!existingUser.getEmail().equals(userDto.getEmail()) && 
            userRepository.existsByEmail(userDto.getEmail())) {
            throw new InvalidInputException("Email already registered!");
        }
        
        // Update user fields
        existingUser.setUsername(userDto.getUsername());
        existingUser.setEmail(userDto.getEmail());
        existingUser.setRole(userDto.getRole());
        
        User updatedUser = userRepository.save(existingUser);
        UserDto updatedUserDto = modelMapper.map(updatedUser, UserDto.class);
        
        return new ApiResponse<>(true, "User updated successfully!", updatedUserDto);
    }

    @Override
    public ApiResponse<String> deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        
        userRepository.delete(user);
        return new ApiResponse<>(true, "User deleted successfully!", "User with ID " + id + " has been deleted");
    }

    @Override
    public UserDto findByUsername(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        
        return modelMapper.map(user, UserDto.class);
    }

    @Override
    public ApiResponse<UserDto> updateUser(UserDto userDto) {
        if (userDto.getId() == null) {
            throw new InvalidInputException("User ID is required for update!");
        }
        return updateUser(userDto.getId(), userDto);
    }

    @Override
    public ApiResponse<UserDto> changeUserRole(Long id, UserRole role) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        
        user.setRole(role);
        User updatedUser = userRepository.save(user);
        UserDto updatedUserDto = modelMapper.map(updatedUser, UserDto.class);
        
        return new ApiResponse<>(true, "User role updated successfully!", updatedUserDto);
    }

    @Override
    public ApiResponse<List<UserDto>> getUsersByRole(UserRole role) {
        List<User> users = userRepository.findAll().stream()
                .filter(user -> user.getRole().equals(role))
                .collect(Collectors.toList());
        List<UserDto> userDtos = users.stream()
                .map(user -> modelMapper.map(user, UserDto.class))
                .collect(Collectors.toList());
        
        return new ApiResponse<>(true, "Users retrieved successfully!", userDtos);
    }

    @Override
    public ApiResponse<List<UserDto>> searchUsers(String query) {
        List<User> users = userRepository.findAll().stream()
                .filter(user -> user.getUsername().toLowerCase().contains(query.toLowerCase()))
                .collect(Collectors.toList());
        List<UserDto> userDtos = users.stream()
                .map(user -> modelMapper.map(user, UserDto.class))
                .collect(Collectors.toList());
        
        return new ApiResponse<>(true, "Search completed successfully!", userDtos);
    }

    @Override
    public User findUserByUsername(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
    }

    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    @Override
    public ApiResponse<List<UserDto>> getProjectMembers(Long projectId) {
        // Get all project members from ProjectMember table
        List<User> members = userRepository.findAll().stream()
            .filter(user -> {
                // Check if user is a member of this project
                return projectMemberRepository.findByProjectId(projectId).stream()
                    .anyMatch(pm -> pm.getUser().getId().equals(user.getId()));
            })
            .collect(Collectors.toList());
            
        List<UserDto> memberDtos = members.stream()
            .map(user -> modelMapper.map(user, UserDto.class))
            .collect(Collectors.toList());
            
        return new ApiResponse<>(true, "Project members retrieved successfully!", memberDtos);
    }
    
    @Override
    public ApiResponse<String> changePassword(Long userId, PasswordChangeRequestDto passwordChangeRequest) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        
        // Verify current password
        if (!passwordEncoder.matches(passwordChangeRequest.getCurrentPassword(), user.getPassword())) {
            throw new InvalidInputException("Current password is incorrect!");
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(passwordChangeRequest.getNewPassword()));
        userRepository.save(user);
        
        return new ApiResponse<>(true, "Password changed successfully!", "Password has been updated");
    }
    
    @Override
    public ApiResponse<String> getUserRoleInProject(Long projectId, Long userId) {
        return projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
            .map(member -> new ApiResponse<>(true, "Role retrieved successfully!", member.getRole().name()))
            .orElse(new ApiResponse<>(false, "User is not a member of this project", null));
    }
}
