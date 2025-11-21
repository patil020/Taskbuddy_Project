package com.taskbuddy.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class ProjectDto {
    private Long id;
    
    @NotBlank(message = "Project name is required")
    @Size(min = 3, max = 100, message = "Project name must be between 3 and 100 characters")
    private String name;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
    
    private Long managerId; // Remove validation since it's set by controller
    
    // Additional fields for frontend display
    private String managerName;
    private String status;
    private String role; // User's role in this project
    private String createdAt;
    private String updatedAt;
    private int taskCount;
    private int memberCount;
    
}
