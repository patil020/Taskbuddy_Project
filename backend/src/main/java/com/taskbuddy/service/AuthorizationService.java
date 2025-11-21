package com.taskbuddy.service;

import com.taskbuddy.repository.ProjectMemberRepository;
import com.taskbuddy.repository.TaskRepository;
import com.taskbuddy.exception.SecurityException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AuthorizationService {
    
    private final ProjectMemberRepository projectMemberRepository;
    private final TaskRepository taskRepository;

    public void checkProjectAccess(Long projectId, Long userId) {
        boolean isMember = projectMemberRepository.findByProjectIdAndUserId(projectId, userId).isPresent();
        if (!isMember) {
            throw new SecurityException("Access denied. You are not a member of this project.");
        }
    }

    public void checkTaskAccess(Long taskId, Long userId) {
        Long projectId = taskRepository.findById(taskId)
            .map(task -> task.getProject().getId())
            .orElseThrow(() -> new SecurityException("Task not found"));
        checkProjectAccess(projectId, userId);
    }
}