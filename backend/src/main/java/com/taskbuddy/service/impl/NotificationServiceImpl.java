package com.taskbuddy.service.impl;

import com.taskbuddy.dto.ApiResponse;
import com.taskbuddy.dto.NotificationDto;
import com.taskbuddy.entity.Notification;
import com.taskbuddy.entity.User;
import com.taskbuddy.enums.NotificationType;
import com.taskbuddy.exception.ResourceNotFoundException;
import com.taskbuddy.repository.NotificationRepository;
import com.taskbuddy.repository.UserRepository;
import com.taskbuddy.service.NotificationService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Concrete implementation of the {@link NotificationService} interface.
 *
 * <p>This implementation handles persistence of notifications and provides
 * convenience methods for common notification scenarios such as task
 * assignments, status changes and invitation handling. All methods run
 * within a transactional context to ensure consistency.</p>
 */
@Service
@Transactional
@AllArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    // WebSocket handler to broadcast notifications in real time
    private final com.taskbuddy.websocket.NotificationWebSocketHandler notificationWebSocketHandler;

    /**
     * {@inheritDoc}
     */
    @Override
    public ApiResponse<?> createNotification(NotificationDto dto) {
        User recipient = userRepository.findById(dto.getRecipientId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found!"));

        Notification notification = new Notification();
        notification.setMessage(dto.getMessage());
        notification.setType(dto.getType());
        notification.setRecipient(recipient);
        notification.setRead(false);

        notificationRepository.save(notification);
        return new ApiResponse("Notification sent!");
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<NotificationDto> getUnreadNotifications(Long recipientId) {
        List<Notification> notifications =
                notificationRepository.findByRecipientIdAndIsReadFalse(recipientId);

        return notifications.stream()
                .map(n -> modelMapper.map(n, NotificationDto.class))
                .collect(Collectors.toList());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public ApiResponse<?> markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found!"));

        notification.setRead(true);
        notificationRepository.save(notification);

        return new ApiResponse("Notification marked as read!");
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void notifyTaskAssigned(Long userId, String taskName, String projectName) {
        createNotificationInternal(
                userId,
                "You have been assigned to task '" + taskName + "' in project '" + projectName + "'",
                NotificationType.TASK_ASSIGNED
        );
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void notifyProjectInvitation(Long userId, String projectName, String inviterName) {
        createNotificationInternal(
                userId,
                inviterName + " invited you to join project '" + projectName + "'",
                NotificationType.PROJECT_INVITATION
        );
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void notifyTaskStatusChanged(Long userId, String taskName, String newStatus) {
        createNotificationInternal(
                userId,
                "Task '" + taskName + "' status changed to " + newStatus,
                NotificationType.TASK_STATUS_CHANGED
        );
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void notifyProjectStatusChanged(Long userId, String projectName, String newStatus) {
        createNotificationInternal(
                userId,
                "Project '" + projectName + "' status changed to " + newStatus,
                NotificationType.PROJECT_STATUS_CHANGED
        );
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void notifyNewComment(Long userId, String entityName, String commenterName) {
        createNotificationInternal(
                userId,
                commenterName + " commented on '" + entityName + "'",
                NotificationType.NEW_COMMENT
        );
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void notifyInvitationAccepted(Long ownerId, String userName, String projectName) {
        createNotificationInternal(
                ownerId,
                userName + " accepted your invitation to join project '" + projectName + "'",
                NotificationType.INVITATION_ACCEPTED
        );
    }

    /**
     * Helper method to create a notification based on simple parameters.  This
     * method will silently skip notification creation if the recipient cannot be
     * found.
     *
     * @param userId  the ID of the recipient
     * @param message the notification message
     * @param type    the type of notification
     */
    private void createNotificationInternal(Long userId, String message, NotificationType type) {
        try {
            User recipient = userRepository.findById(userId).orElse(null);

            if (recipient != null) {
                Notification notification = new Notification();
                notification.setMessage(message);
                notification.setType(type);
                notification.setRecipient(recipient);
                notification.setRead(false);

                // Persist the notification
                notificationRepository.save(notification);

                // Map to DTO for websocket delivery
                NotificationDto dto = modelMapper.map(notification, NotificationDto.class);
                // Ensure recipientId is set as it does not map automatically
                dto.setRecipientId(recipient.getId());

                // Send via WebSocket to all active sessions for the recipient
                try {
                    notificationWebSocketHandler.sendNotification(recipient.getId(), dto);
                } catch (Exception e) {
                    log.warn("Failed to broadcast notification via WebSocket for user {}: {}", recipient.getId(), e.getMessage());
                }
            } else {
                log.warn("Recipient not found for userId: {}", userId);
            }
        } catch (Exception e) {
            log.error("Failed to create notification for userId {}: {}", userId, e.getMessage(), e);
        }
    }
}