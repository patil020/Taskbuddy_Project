package com.taskbuddy.controller;

import com.taskbuddy.dto.ApiResponse;
import com.taskbuddy.service.ProjectMemberService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.taskbuddy.entity.User;
import java.util.List;
import com.taskbuddy.dto.ProjectMemberDto;

@RestController
@RequestMapping("/api/project-members")
@AllArgsConstructor
public class ProjectMemberController {
    
    private final ProjectMemberService projectMemberService;

    @GetMapping("/project/{projectId}/role")
    @PreAuthorize("@auth.canAccessProject(#projectId, principal.id)")
    public ResponseEntity<ApiResponse<String>> getUserRoleInProject(@PathVariable Long projectId, @AuthenticationPrincipal User currentUser) {
        ApiResponse<String> response = projectMemberService.getUserRoleInProject(projectId, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    // New endpoint: Get all members for a project
    @GetMapping("/project/{projectId}")
    @PreAuthorize("@auth.canAccessProject(#projectId, principal.id)")
    public ResponseEntity<ApiResponse<List<ProjectMemberDto>>> getMembersForProject(@PathVariable Long projectId) {
        var members = projectMemberService.getMembersForProject(projectId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Members fetched", members));
    }
}