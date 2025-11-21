package com.taskbuddy.entity;

import jakarta.persistence.*;
import lombok.*;
import com.taskbuddy.enums.InvitationStatus;

@Entity
@Table(name = "project_invitations")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class ProjectInvitation extends BaseEntity {
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Project project;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private User invitedUser;

    @Enumerated(EnumType.STRING)
    private InvitationStatus status = InvitationStatus.PENDING;
    
    @ManyToOne(fetch = FetchType.LAZY)
    private User invitedBy;
}
