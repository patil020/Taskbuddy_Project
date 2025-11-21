package com.taskbuddy.dto;

import lombok.*;
import com.taskbuddy.enums.UserRole;
import jakarta.validation.constraints.*;

/**
 * Data Transfer Object for User entity
 * Used for data transfer between client and server
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    
    private Long id;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @NotNull(message = "Role is required")
    private UserRole role;

    // Password is intentionally excluded from DTO for security reasons
    // Use separate DTOs for password operations if needed
    
    
    public void setRole(String role) {
        this.role = UserRole.valueOf(role);
    }
}
