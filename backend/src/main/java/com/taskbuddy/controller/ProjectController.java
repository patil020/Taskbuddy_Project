package com.taskbuddy.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import lombok.AllArgsConstructor;
import com.taskbuddy.service.ProjectService;
import com.taskbuddy.dto.ProjectDto;
import com.taskbuddy.dto.ApiResponse;
import com.taskbuddy.enums.ProjectStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import com.taskbuddy.entity.User;

@RestController
@RequestMapping("/api/projects")
@AllArgsConstructor
@Validated
public class ProjectController {

    private final ProjectService projectService;
    

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<?>> createProject(
        @Valid @RequestBody ProjectDto projectDto,
        @AuthenticationPrincipal User currentUser) {

        ApiResponse<?> response = projectService.createProject(projectDto, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

   
    @PatchMapping("/{id}/status")
    @PreAuthorize("@auth.canAccessProject(#id, principal.id)")
    public ResponseEntity<ApiResponse<?>> updateStatus(
        @PathVariable @Positive(message = "Project ID must be positive") Long id,
        @RequestParam @NotNull(message = "Status is required") ProjectStatus status,
        @AuthenticationPrincipal User currentUser) {
        ApiResponse<?> response = projectService.updateProjectStatus(id, status, currentUser.getId());
        return ResponseEntity.ok(response);
    }

   
    @PutMapping("/{id}")
    @PreAuthorize("@auth.canAccessProject(#id, principal.id)")
    public ResponseEntity<ApiResponse<?>> updateProject(
        @PathVariable @Positive(message = "Project ID must be positive") Long id,
        @Valid @RequestBody ProjectDto projectDto,
        @AuthenticationPrincipal User currentUser) {

        ApiResponse<?> response = projectService.updateProject(id, projectDto, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    
    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllProjects() {
        ApiResponse<?> response = projectService.getAllProjects();
        return ResponseEntity.ok(response);
    }

    
    @GetMapping("/{id}")
    @PreAuthorize("@auth.canAccessProject(#id, principal.id)")
    public ResponseEntity<ApiResponse<?>> getProjectById(
        @PathVariable @Positive(message = "Project ID must be positive") Long id,
        @AuthenticationPrincipal User currentUser) {
        ApiResponse<?> response = projectService.getProjectById(id);
        return ResponseEntity.ok(response);
    }

   
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<?>> getProjectsByUserId(
        @PathVariable @Positive(message = "User ID must be positive") Long userId) {

        ApiResponse<?> response = projectService.getProjectsByUserId(userId);
        return ResponseEntity.ok(response);
    }

    
    @PostMapping("/{projectId}/members")
    @PreAuthorize("@auth.canAccessProject(#projectId, principal.id)")
    public ResponseEntity<ApiResponse<?>> assignMember(
        @PathVariable @Positive(message = "Project ID must be positive") Long projectId,
        @RequestParam @Positive(message = "User ID must be positive") Long userId,
        @AuthenticationPrincipal User currentUser) {

        ApiResponse<?> response =
            projectService.assignMemberToProject(projectId, userId, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    
    @DeleteMapping("/{projectId}/members/{userId}")
    @PreAuthorize("@auth.canAccessProject(#projectId, principal.id)")
    public ResponseEntity<Void> removeMember(
        @PathVariable @Positive(message = "Project ID must be positive") Long projectId,
        @PathVariable @Positive(message = "User ID must be positive") Long userId,
        @AuthenticationPrincipal User currentUser) {

        projectService.removeMemberFromProject(projectId, userId, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
}
