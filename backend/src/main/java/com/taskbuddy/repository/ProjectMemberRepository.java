package com.taskbuddy.repository;

import com.taskbuddy.entity.ProjectMember;
import com.taskbuddy.entity.User;
import com.taskbuddy.entity.Project;
import com.taskbuddy.enums.ProjectRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for ProjectMember entity
 * Provides database operations for ProjectMember management
 */
@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    
    List<ProjectMember> findByProjectId(Long projectId);
    List<ProjectMember> findByUserId(Long userId);
    List<ProjectMember> findByUser(User user);
    List<ProjectMember> findByProject(Project project);
    boolean existsByProjectIdAndUserId(Long projectId, Long userId);
    boolean existsByProjectAndUser(Project project, User user);
    Optional<ProjectMember> findByProjectAndUser(Project project, User user);
    
    /**
     * Delete all members of a project
     * @param project the project
     */
    void deleteByProject(Project project);
    
    @Query("SELECT pm FROM ProjectMember pm WHERE pm.project.id = :projectId AND pm.user.id = :userId")
    Optional<ProjectMember> findByProjectIdAndUserId(@Param("projectId") Long projectId, @Param("userId") Long userId);
    
    @Query("SELECT pm FROM ProjectMember pm WHERE pm.project.id = :projectId AND pm.role = :role")
    List<ProjectMember> findByProjectIdAndRole(@Param("projectId") Long projectId, @Param("role") ProjectRole role);
}
