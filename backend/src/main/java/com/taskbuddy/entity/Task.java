package com.taskbuddy.entity;

import jakarta.persistence.*;
import lombok.*;
import com.taskbuddy.enums.TaskStatus;
import com.taskbuddy.enums.TaskPriority;
import java.util.List;
import java.util.ArrayList;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "tasks")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"assignedUser", "project", "comments"})
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
public class Task extends BaseEntity {

    @EqualsAndHashCode.Include
    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private TaskStatus status = TaskStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskPriority priority = TaskPriority.MEDIUM;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_user_id")
    private User assignedUser;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Comment> comments = new ArrayList<>();

    // Helper methods
    public void addComment(Comment comment) {
        comments.add(comment);
        comment.setTask(this);
    }

    public void removeComment(Comment comment) {
        comments.remove(comment);
        comment.setTask(null);
    }

    // Business helpers (kept)
    public boolean isAssigned() {
        return assignedUser != null;
    }
    public boolean isCreatedByManager(User user) {
        return project.getManager().getId().equals(user.getId());
    }
    public boolean isAssignedToUser(User user) {
        return assignedUser != null && assignedUser.getId().equals(user.getId());
    }
}
