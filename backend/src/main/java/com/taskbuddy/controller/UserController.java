package com.taskbuddy.controller;

import com.taskbuddy.dto.ApiResponse;
import com.taskbuddy.dto.UserDto;
import com.taskbuddy.dto.PasswordChangeRequestDto;
import com.taskbuddy.entity.User;
import com.taskbuddy.enums.UserRole;
import com.taskbuddy.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
@AllArgsConstructor
public class UserController {
    
    private final UserService userService;

    /**
     * Get all users - Authenticated users can see basic info
     * @return List of all users
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        ApiResponse<List<UserDto>> response = userService.getAllUsers();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER') or #id == authentication.principal.id")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable @Positive(message = "User ID must be positive") Long id) {
        ApiResponse<UserDto> response = userService.getUserById(id);
        return ResponseEntity.ok(response);
    }

    
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@AuthenticationPrincipal User currentUser) {
        ApiResponse<UserDto> response = userService.getUserById(currentUser.getId());
        return ResponseEntity.ok(response);
    }

   
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER') or (#id == authentication.principal.id and #userDto.role == authentication.principal.role)")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable @Positive(message = "User ID must be positive") Long id, 
            @Valid @RequestBody UserDto userDto,
            @AuthenticationPrincipal User currentUser) {
        // Ensure ID consistency
        userDto.setId(id);
        // If not manager, prevent role changes
        if (!currentUser.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_MANAGER"))) {
            userDto.setRole(currentUser.getRole().name());
        }
        ApiResponse<UserDto> response = userService.updateUser(userDto);
        return ResponseEntity.ok(response);
    }

    
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> updateCurrentUser(@Valid @RequestBody UserDto userDto, @AuthenticationPrincipal User currentUser) {
        // Set current user's ID and preserve role
        userDto.setId(currentUser.getId());
    userDto.setRole(currentUser.getRole().name());
        ApiResponse<UserDto> response = userService.updateUser(userDto);
        return ResponseEntity.ok(response);
    }

    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable @Positive(message = "User ID must be positive") Long id, @AuthenticationPrincipal User currentUser) {
        // Prevent self-deletion
        if (currentUser.getId().equals(id)) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Cannot delete your own account!", null));
        }
        ApiResponse<String> response = userService.deleteUser(id);
        return ResponseEntity.ok(response);
    }

   
    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<UserDto>> changeUserRole(
            @PathVariable @Positive(message = "User ID must be positive") Long id, 
            @RequestParam UserRole role,
            @AuthenticationPrincipal User currentUser) {
        // Prevent changing own role
        if (currentUser.getId().equals(id)) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Cannot change your own role!", null));
        }
        ApiResponse<UserDto> response = userService.changeUserRole(id, role);
        return ResponseEntity.ok(response);
    }

    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserDto>>> searchUsers(@RequestParam String query) {
        ApiResponse<List<UserDto>> response = userService.searchUsers(query);
        return ResponseEntity.ok(response);
    }

    
    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<List<UserDto>>> getUsersByRole(@PathVariable UserRole role) {
        ApiResponse<List<UserDto>> response = userService.getUsersByRole(role);
        return ResponseEntity.ok(response);
    }

   
    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<List<UserDto>>> getProjectMembers(
        @PathVariable Long projectId,
        @AuthenticationPrincipal User currentUser) {
        // Check if user is member of this project
        ApiResponse<String> roleCheck = userService.getUserRoleInProject(projectId, currentUser.getId());
        if (!roleCheck.isSuccess()) {
            return ResponseEntity.status(403)
                .body(new ApiResponse<>(false, "Access denied. You are not a member of this project.", null));
        }
        ApiResponse<List<UserDto>> response = userService.getProjectMembers(projectId);
        return ResponseEntity.ok(response);
    }

    
    @GetMapping("/project/{projectId}/my-role")
    public ResponseEntity<ApiResponse<String>> getMyRoleInProject(
        @PathVariable Long projectId,
        @AuthenticationPrincipal User currentUser) {
        ApiResponse<String> response = userService.getUserRoleInProject(projectId, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    
    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(@Valid @RequestBody PasswordChangeRequestDto passwordChangeRequest, @AuthenticationPrincipal User currentUser) {
        ApiResponse<String> response = userService.changePassword(currentUser.getId(), passwordChangeRequest);
        return ResponseEntity.ok(response);
    }
}
