package com.taskbuddy.repository;

import com.taskbuddy.entity.ProjectInvitation;
import com.taskbuddy.enums.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectInvitationRepository extends JpaRepository<ProjectInvitation, Long> {
    List<ProjectInvitation> findByInvitedUserIdAndStatus(Long userId, InvitationStatus status);
}
