package com.taskbuddy.repository;

import com.taskbuddy.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Change 'Read' to 'IsRead'
    List<Notification> findByRecipientIdAndIsReadFalse(Long recipientId);

    List<Notification> findByRecipientId(Long recipientId);
}

