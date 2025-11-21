package com.taskbuddy.security;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import com.taskbuddy.service.AuthorizationService;
import com.taskbuddy.repository.TaskRepository;

@Component("auth")
@RequiredArgsConstructor
public class AuthSecurity {

    private final AuthorizationService authorizationService;
    private final TaskRepository taskRepository;

    /**
     * Used in @PreAuthorize expressions. Returns true if the user has access to the project.
     */
    public boolean canAccessProject(Long projectId, Long userId) {
        try {
            authorizationService.checkProjectAccess(projectId, userId);
            return true;
        } catch (RuntimeException ex) {
            return false;
        }
    }

    /**
     * Resolve a task's project id; useful for SpEL expressions.
     */
    public Long taskProjectId(Long taskId) {
        return taskRepository.findById(taskId)
            .map(t -> t.getProject().getId())
            .orElse(null);
    }

    /**
     * Direct task access check (wraps AuthorizationService.checkTaskAccess).
     */
    public boolean canAccessTask(Long taskId, Long userId) {
        try {
            authorizationService.checkTaskAccess(taskId, userId);
            return true;
        } catch (RuntimeException ex) {
            return false;
        }
    }
}
