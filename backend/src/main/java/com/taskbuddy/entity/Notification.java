package com.taskbuddy.entity;

import jakarta.persistence.*;
import lombok.*;
import com.taskbuddy.enums.NotificationType;

@Entity
@Table(name = "notifications")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class Notification extends BaseEntity {
    @Column(nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    private NotificationType type; // e.g. ASSIGNMENT, COMMENT, GENERAL

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    // Rename 'read' to 'isRead'
    @Column(name = "is_read", nullable = false)
    private boolean isRead = false; // unread by default
}
