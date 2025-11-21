package com.taskbuddy.repository;

import com.taskbuddy.entity.Task;
import com.taskbuddy.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByAssignedUserId(Long userId);
    List<Task> findByProjectId(Long projectId);
    List<Task> findByProject(Project project);
}
