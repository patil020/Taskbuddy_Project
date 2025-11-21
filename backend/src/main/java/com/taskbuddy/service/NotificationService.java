package com.taskbuddy.service;

import com.taskbuddy.dto.ApiResponse;
import com.taskbuddy.dto.NotificationDto;
import java.util.List;

/**
 * Service interface for managing notifications within the application.
 * <p>
 * Implementations of this interface should handle creation of generic notifications,
 * retrieval of unread notifications, marking notifications as read, and sending
 * specific event-based notifications (e.g. task assigned, project invitation).
 * </p>
 */
public interface NotificationService {

    /**
     * Create a generic notification for a user.
     *
     * @param dto the notification details
     * @return an ApiResponse indicating success or failure
     */
    ApiResponse<?> createNotification(NotificationDto dto);

    /**
     * Retrieve all unread notifications for a given user.
     *
     * @param recipientId the ID of the user
     * @return a list of unread notifications
     */
    List<NotificationDto> getUnreadNotifications(Long recipientId);

    /**
     * Mark a notification as read.
     *
     * @param notificationId the ID of the notification
     * @return an ApiResponse indicating the result
     */
    ApiResponse<?> markAsRead(Long notificationId);

    /**
     * Notify a user that they have been assigned to a task.
     *
     * @param userId      the ID of the user being notified
     * @param taskName    the name of the task
     * @param projectName the name of the project
     */
    void notifyTaskAssigned(Long userId, String taskName, String projectName);

    /**
     * Notify a user that they have been invited to a project.
     *
     * @param userId      the ID of the invited user
     * @param projectName the name of the project
     * @param inviterName the username of the person inviting
     */
    void notifyProjectInvitation(Long userId, String projectName, String inviterName);

    /**
     * Notify a user that the status of a task they are involved with has changed.
     *
     * @param userId    the ID of the user being notified
     * @param taskName  the name of the task
     * @param newStatus the new status of the task
     */
    void notifyTaskStatusChanged(Long userId, String taskName, String newStatus);

    /**
     * Notify a user that the status of a project has changed.
     *
     * @param userId      the ID of the user being notified
     * @param projectName the name of the project
     * @param newStatus   the new status of the project
     */
    void notifyProjectStatusChanged(Long userId, String projectName, String newStatus);

    /**
     * Notify a user that a new comment has been added to a task or project they are involved with.
     *
     * @param userId       the ID of the user being notified
     * @param entityName   the name of the entity (task or project)
     * @param commenterName the name of the user who made the comment
     */
    void notifyNewComment(Long userId, String entityName, String commenterName);

    /**
     * Notify the owner of a project that a user has accepted their invitation.
     *
     * @param ownerId     the ID of the project owner
     * @param userName    the username of the user who accepted
     * @param projectName the name of the project
     */
    void notifyInvitationAccepted(Long ownerId, String userName, String projectName);
}