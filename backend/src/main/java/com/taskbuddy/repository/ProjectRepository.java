package com.taskbuddy.repository;

import com.taskbuddy.entity.Project;
import com.taskbuddy.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Project entity
 * Provides database operations for Project management
 */
@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    
    /**
     * Find projects by manager
     * @param manager the project manager
     * @return List of projects managed by the user
     */
    List<Project> findByManager(User manager);
}
