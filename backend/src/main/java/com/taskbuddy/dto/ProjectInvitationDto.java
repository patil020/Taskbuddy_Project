package com.taskbuddy.dto;

import lombok.*;
import com.taskbuddy.enums.InvitationStatus;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectInvitationDto {
    private Long id;
    
    @NotNull(message = "Project ID is required")
    @Positive(message = "Project ID must be a positive number")
    private Long projectId;
    
    @NotNull(message = "Invited user ID is required")
    @Positive(message = "Invited user ID must be a positive number")
    private Long invitedUserId;
    
    private InvitationStatus status;
}
