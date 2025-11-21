package com.taskbuddy.dto;

import lombok.*;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDto {
    private Long id;
    
    @NotBlank(message = "Comment message is required")
    @Size(min = 1, max = 500, message = "Comment must be between 1 and 500 characters")
    private String message;
    
    // Alternative field name for content (frontend compatibility)
    private String content;
    
    private Long userId; // Set by controller from authenticated user
    
    @Positive(message = "Task ID must be a positive number")
    private Long taskId;
    
    @Positive(message = "Project ID must be a positive number")
    private Long projectId;
    
    // Additional fields for frontend display
    private String authorName;
    private String createdAt;
    private String updatedAt;
    
}
