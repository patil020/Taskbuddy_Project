
package com.taskbuddy.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import com.taskbuddy.repository.ProjectInvitationRepository;
import com.taskbuddy.repository.ProjectRepository;
import com.taskbuddy.repository.UserRepository;
import com.taskbuddy.repository.ProjectMemberRepository;
import com.taskbuddy.entity.ProjectInvitation;
import com.taskbuddy.entity.Project;
import com.taskbuddy.entity.User;
import com.taskbuddy.entity.ProjectMember;
import com.taskbuddy.dto.ProjectInvitationDto;
import com.taskbuddy.dto.ApiResponse;
import com.taskbuddy.service.ProjectInvitationService;
import com.taskbuddy.service.NotificationService;
import com.taskbuddy.enums.InvitationStatus;
import com.taskbuddy.enums.ProjectRole;
import com.taskbuddy.exception.ResourceNotFoundException;
import com.taskbuddy.exception.InvalidInputException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of ProjectInvitationService interface
 * Contains business logic for project invitation management operations
 */
@Service
@Transactional
@AllArgsConstructor
public class ProjectInvitationServiceImpl implements ProjectInvitationService {
    
    private final ProjectInvitationRepository invitationRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ModelMapper modelMapper;
    private final NotificationService notificationService;

    @Override
    public ApiResponse<ProjectInvitationDto> inviteUser(Long projectId, Long invitedUserId, Long requestingUserId) {
        // Verify project exists
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));
        
        // Verify invited user exists
        User invitedUser = userRepository.findById(invitedUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + invitedUserId));
        
        // Verify requesting user exists and is project manager
        User requestingUser = userRepository.findById(requestingUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + requestingUserId));
        
        // Check if requesting user is project manager
        boolean isManager = projectMemberRepository.findByProjectIdAndUserId(projectId, requestingUserId)
            .map(member -> ProjectRole.MANAGER.equals(member.getRole()))
            .orElse(false);
        if (!isManager) {
            throw new InvalidInputException("Only project manager can invite users!");
        }
        
        // Check if user already has a pending invitation
        boolean hasPendingInvitation = invitationRepository.findByInvitedUserIdAndStatus(invitedUserId, InvitationStatus.PENDING)
            .stream().anyMatch(inv -> inv.getProject().getId().equals(projectId));
        if (hasPendingInvitation) {
            throw new InvalidInputException("Invitation already sent and pending!");
        }
        
        // Check if user is already a member
        boolean isAlreadyMember = projectMemberRepository.findByProjectIdAndUserId(projectId, invitedUserId).isPresent();
        if (isAlreadyMember) {
            throw new InvalidInputException("User is already a member of this project!");
        }
        
        // Create invitation
        ProjectInvitation invitation = new ProjectInvitation();
        invitation.setProject(project);
        invitation.setInvitedUser(invitedUser);
        invitation.setInvitedBy(requestingUser);
        invitation.setStatus(InvitationStatus.PENDING);
        
        ProjectInvitation savedInvitation = invitationRepository.save(invitation);
        ProjectInvitationDto savedInvitationDto = modelMapper.map(savedInvitation, ProjectInvitationDto.class);
        
        // Send notification to invited user
        notificationService.notifyProjectInvitation(
            invitedUserId, 
            project.getName(), 
            requestingUser.getUsername()
        );
        
        return new ApiResponse<>(true, "User invited successfully!", savedInvitationDto);
    }

    @Override
    public List<ProjectInvitationDto> getPendingInvitationsForUser(Long userId) {
        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with ID: " + userId);
        }
        
        List<ProjectInvitation> invitations = invitationRepository.findByInvitedUserIdAndStatus(
            userId, InvitationStatus.PENDING);
        
        return invitations.stream()
                .map(invitation -> modelMapper.map(invitation, ProjectInvitationDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public ApiResponse<ProjectInvitationDto> respondToInvitation(Long invitationId, InvitationStatus status) {
        ProjectInvitation invitation = invitationRepository.findById(invitationId)
            .orElseThrow(() -> new ResourceNotFoundException("Invitation not found with ID: " + invitationId));
        
        // Check if invitation is still pending
        if (!InvitationStatus.PENDING.equals(invitation.getStatus())) {
            throw new InvalidInputException("Invitation has already been responded to!");
        }
        
        // Update invitation status
        invitation.setStatus(status);
        ProjectInvitation updatedInvitation = invitationRepository.save(invitation);
        
        // If accepted, add user as project member
        if (InvitationStatus.ACCEPTED.equals(status)) {
            ProjectMember projectMember = new ProjectMember();
            projectMember.setProject(invitation.getProject());
            projectMember.setUser(invitation.getInvitedUser());
            projectMember.setRole(ProjectRole.MEMBER); // Default role for invited users
            projectMemberRepository.save(projectMember);
            
            // Create notification for project owner
            notificationService.notifyInvitationAccepted(
                invitation.getInvitedBy().getId(),
                invitation.getInvitedUser().getUsername(),
                invitation.getProject().getName()
            );
        }
        
        ProjectInvitationDto updatedInvitationDto = modelMapper.map(updatedInvitation, ProjectInvitationDto.class);
        String message = InvitationStatus.ACCEPTED.equals(status) ? 
            "Invitation accepted successfully!" : "Invitation rejected successfully!";
        
        return new ApiResponse<>(true, message, updatedInvitationDto);
    }

    @Override
    public List<ProjectInvitationDto> getInvitationsByProject(Long projectId) {
        // Verify project exists
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project not found with ID: " + projectId);
        }
        
        List<ProjectInvitation> invitations = invitationRepository.findAll().stream()
                .filter(inv -> inv.getProject().getId().equals(projectId))
                .collect(Collectors.toList());
        return invitations.stream()
                .map(invitation -> modelMapper.map(invitation, ProjectInvitationDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public ApiResponse<String> cancelInvitation(Long invitationId, Long requestingUserId) {
        ProjectInvitation invitation = invitationRepository.findById(invitationId)
            .orElseThrow(() -> new ResourceNotFoundException("Invitation not found with ID: " + invitationId));
        
        // Check if requesting user is the one who sent the invitation or project manager
        boolean canCancel = invitation.getInvitedBy().getId().equals(requestingUserId) ||
            projectMemberRepository.findByProjectIdAndUserId(
                invitation.getProject().getId(), requestingUserId)
                .map(member -> ProjectRole.MANAGER.equals(member.getRole()))
                .orElse(false);
        
        if (!canCancel) {
            throw new InvalidInputException("Only the inviter or project manager can cancel invitations!");
        }
        
        // Check if invitation is still pending
        if (!InvitationStatus.PENDING.equals(invitation.getStatus())) {
            throw new InvalidInputException("Can only cancel pending invitations!");
        }
        
        invitationRepository.delete(invitation);
        return new ApiResponse<>(true, "Invitation cancelled successfully!", "Invitation " + invitationId + " has been cancelled");
    }
}

