package com.taskbuddy.dto;

import lombok.*;
import com.taskbuddy.enums.TaskStatus;
import com.taskbuddy.enums.TaskPriority;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskDto {
    private Long id;
    
    @NotBlank(message = "Task title is required")
    @Size(min = 3, max = 100, message = "Task title must be between 3 and 100 characters")
    private String title;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    private TaskStatus status;
    
    @NotNull(message = "Task priority is required")
    private TaskPriority priority;
    
    @Positive(message = "Assigned user ID must be a positive number")
    private Long assignedUserId;
    
    @NotNull(message = "Project ID is required")
    @Positive(message = "Project ID must be a positive number")
    private Long projectId;
    
    // Additional fields for frontend display
    private LocalDate dueDate;
    private String assignedUserName;
    private String projectName;
    private String createdAt;
    private String updatedAt;
}
