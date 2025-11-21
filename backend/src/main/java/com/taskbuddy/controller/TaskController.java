package com.taskbuddy.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import lombok.AllArgsConstructor;
import com.taskbuddy.service.TaskService;
import com.taskbuddy.dto.TaskDto;
import com.taskbuddy.dto.ApiResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import com.taskbuddy.entity.User;
import com.taskbuddy.enums.TaskStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.NotNull;
import org.springframework.validation.annotation.Validated;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
@AllArgsConstructor
@Validated
public class TaskController {
    private final TaskService taskService;

    // Create task (project manager OR project member can create based on service check)
    @PostMapping
    public ResponseEntity<ApiResponse<?>> createTask(
            @Valid @RequestBody TaskDto taskDto,
            @AuthenticationPrincipal User currentUser) {
        ApiResponse<?> response = taskService.createTask(taskDto, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Update task status  ACCEPTED/REJECTED/IN_PROGRESS/DONE - only assignee can do this
    @PutMapping("/{id}/status")
    @PreAuthorize("@auth.canAccessProject(@auth.taskProjectId(#id), principal.id)")
    public ResponseEntity<ApiResponse<?>> updateTaskStatus(
            @PathVariable @Positive(message = "Task ID must be positive") Long id,
            @RequestParam @NotNull(message = "Status is required") TaskStatus status,
            @AuthenticationPrincipal User currentUser) {
        ApiResponse<?> response = taskService.updateTaskStatus(id, status, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    // Reassign task (only project manager can do this)
    @PutMapping("/{id}/reassign")
    @PreAuthorize("@auth.canAccessProject(@auth.taskProjectId(#id), principal.id)")
    public ResponseEntity<ApiResponse<?>> reassignTask(
            @PathVariable @Positive(message = "Task ID must be positive") Long id,
            @RequestParam @Positive(message = "New assignee ID must be positive") Long newAssigneeId,
            @AuthenticationPrincipal User currentUser) {
        ApiResponse<?> response = taskService.reassignTask(id, newAssigneeId, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    // GET all tasks
    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllTasks() {
        ApiResponse<?> response = taskService.getAllTasks();
        return ResponseEntity.ok(response);
    }

    // GET task by id (authorization checked)
    @GetMapping("/{id}")
    @PreAuthorize("@auth.canAccessProject(@auth.taskProjectId(#id), principal.id)")
    public ResponseEntity<ApiResponse<?>> getTaskById(
        @PathVariable @Positive(message = "Task ID must be positive") Long id,
        @AuthenticationPrincipal User currentUser) {
        ApiResponse<?> response = taskService.getTaskById(id);
        return ResponseEntity.ok(response);
    }

    // GET tasks by project (authorization checked)
    @GetMapping("/project/{projectId}")
    @PreAuthorize("@auth.canAccessProject(#projectId, principal.id)")
    public ResponseEntity<ApiResponse<?>> getTasksByProjectId(
        @PathVariable @Positive(message = "Project ID must be positive") Long projectId,
        @AuthenticationPrincipal User currentUser) {
        ApiResponse<?> response = taskService.getTasksByProjectId(projectId);
        return ResponseEntity.ok(response);
    }

    // Update task (manager or assignee)
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> updateTask(
        @PathVariable @Positive(message = "Task ID must be positive") Long id,
        @Valid @RequestBody TaskDto taskDto,
        @AuthenticationPrincipal User currentUser) {
        ApiResponse<?> response = taskService.updateTask(id, taskDto, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    // Delete task (manager only)
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteTask(
        @PathVariable @Positive(message = "Task ID must be positive") Long id,
        @AuthenticationPrincipal User currentUser) {
        ApiResponse<?> response = taskService.deleteTask(id, currentUser.getId());
        return ResponseEntity.ok(response); 
    }
}
