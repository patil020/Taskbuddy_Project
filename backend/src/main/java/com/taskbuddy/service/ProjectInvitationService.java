package com.taskbuddy.service;

import com.taskbuddy.dto.ProjectInvitationDto;
import com.taskbuddy.dto.ApiResponse;
import com.taskbuddy.enums.InvitationStatus;
import java.util.List;

public interface ProjectInvitationService {
    
    ApiResponse<ProjectInvitationDto> inviteUser(Long projectId, Long invitedUserId, Long requestingUserId);
    
    List<ProjectInvitationDto> getPendingInvitationsForUser(Long userId);
    
    ApiResponse<ProjectInvitationDto> respondToInvitation(Long invitationId, InvitationStatus status);
    
    List<ProjectInvitationDto> getInvitationsByProject(Long projectId);
    
    ApiResponse<String> cancelInvitation(Long invitationId, Long requestingUserId);
}
