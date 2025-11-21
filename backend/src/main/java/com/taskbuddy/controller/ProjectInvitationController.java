package com.taskbuddy.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import lombok.AllArgsConstructor;
import com.taskbuddy.entity.User;
import com.taskbuddy.service.ProjectInvitationService;
import com.taskbuddy.dto.ProjectInvitationDto;
import com.taskbuddy.dto.ApiResponse;
import com.taskbuddy.enums.InvitationStatus;
import java.util.List;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.NotNull;

@RestController
@RequestMapping("/api/project-invitations")
@AllArgsConstructor
public class ProjectInvitationController {
    private final ProjectInvitationService invitationService;

    // Send invitation to user for a project (only manager can invite)
    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("@auth.canAccessProject(#projectId, principal.id)")
    public ResponseEntity<ApiResponse<?>> invite(
            @RequestParam @Positive(message = "Project ID must be positive") Long projectId,
            @RequestParam @Positive(message = "Invited user ID must be positive") Long invitedUserId,
            @AuthenticationPrincipal User currentUser) {
        ApiResponse<?> response = invitationService.inviteUser(projectId, invitedUserId, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get all pending invitations for current user
    @GetMapping("/pending")
    public ResponseEntity<List<ProjectInvitationDto>> getCurrentUserPendingInvitations(@AuthenticationPrincipal User currentUser) {
        List<ProjectInvitationDto> invitations = invitationService.getPendingInvitationsForUser(currentUser.getId());
        return ResponseEntity.ok(invitations);
    }

    // Get all pending invitations for a user
    @GetMapping("/user/{userId}/pending")
    public ResponseEntity<List<ProjectInvitationDto>> getPendingInvitations(@PathVariable @Positive(message = "User ID must be positive") Long userId) {
        List<ProjectInvitationDto> invitations = invitationService.getPendingInvitationsForUser(userId);
        return ResponseEntity.ok(invitations);
    }

    // Accept or Reject invitation
    @PutMapping("/{id}/respond")
    public ResponseEntity<ApiResponse<?>> respond(
            @PathVariable @Positive(message = "Invitation ID must be positive") Long id,
            @RequestParam @NotNull(message = "Status is required") InvitationStatus status) {
        ApiResponse<?> response = invitationService.respondToInvitation(id, status);
        return ResponseEntity.ok(response);
    }

    // Accept invitation (specific endpoint)
    @PostMapping("/projects/{projectId}/invitations/{inviteId}/accept")
    public ResponseEntity<ApiResponse<?>> acceptInvitation(
            @PathVariable @Positive Long projectId,
            @PathVariable @Positive Long inviteId) {
        ApiResponse<?> response = invitationService.respondToInvitation(inviteId, InvitationStatus.ACCEPTED);
        return ResponseEntity.ok(response);
    }
}
