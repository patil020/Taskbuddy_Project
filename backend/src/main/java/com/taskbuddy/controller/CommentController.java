package com.taskbuddy.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import lombok.AllArgsConstructor;
import com.taskbuddy.service.CommentService;
import com.taskbuddy.dto.CommentDto;
import com.taskbuddy.dto.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.taskbuddy.entity.User;

@RestController
@RequestMapping("/api/comments")
@AllArgsConstructor
public class CommentController {
    private final CommentService commentService;

    
    @PostMapping("/project/{projectId}")
    @PreAuthorize("@auth.canAccessProject(#projectId, principal.id)")
    public ResponseEntity<?> addProjectComment(
        @PathVariable @Positive(message = "Project ID must be positive") Long projectId,
        @Valid @RequestBody CommentDto commentDto,
        @AuthenticationPrincipal User currentUser) {
        
        commentDto.setUserId(currentUser.getId());
        commentDto.setProjectId(projectId);
        ApiResponse<?> response = commentService.addProjectComment(projectId, commentDto, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    
    @PostMapping("/task/{taskId}")
    @PreAuthorize("@auth.canAccessTask(#taskId, principal.id)")
    public ResponseEntity<?> addTaskComment(
        @PathVariable @Positive(message = "Task ID must be positive") Long taskId,
        @Valid @RequestBody CommentDto commentDto,
        @AuthenticationPrincipal User currentUser) {
        
        commentDto.setUserId(currentUser.getId());
        commentDto.setTaskId(taskId);
        ApiResponse<?> response = commentService.addTaskComment(taskId, commentDto, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get all comments for a task
    @GetMapping("/task/{taskId}")
    @PreAuthorize("@auth.canAccessTask(#taskId, principal.id)")
    public ResponseEntity<?> getCommentsForTask(
        @PathVariable @Positive(message = "Task ID must be positive") Long taskId,
        @AuthenticationPrincipal User currentUser) {
        
        ApiResponse<?> response = commentService.getTaskComments(taskId);
        return ResponseEntity.ok(response);
    }

    // Get all comments for a project
    @GetMapping("/project/{projectId}")
    @PreAuthorize("@auth.canAccessProject(#projectId, principal.id)")
    public ResponseEntity<?> getCommentsForProject(
        @PathVariable @Positive(message = "Project ID must be positive") Long projectId,
        @AuthenticationPrincipal User currentUser) {
        
        ApiResponse<?> response = commentService.getProjectComments(projectId);
        return ResponseEntity.ok(response);
    }

    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateComment(
        @PathVariable @Positive(message = "Comment ID must be positive") Long id,
        @Valid @RequestBody CommentDto commentDto,
        @org.springframework.security.core.annotation.AuthenticationPrincipal com.taskbuddy.entity.User currentUser) {

        ApiResponse<?> response = commentService.updateComment(id, commentDto, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(
        @PathVariable @Positive(message = "Comment ID must be positive") Long id,
        @org.springframework.security.core.annotation.AuthenticationPrincipal com.taskbuddy.entity.User currentUser) {

        ApiResponse<?> response = commentService.deleteComment(id, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    
    @GetMapping
    public ResponseEntity<?> getAllComments() {
        ApiResponse<?> response = commentService.getAllComments();
        return ResponseEntity.ok(response);
    }
}
