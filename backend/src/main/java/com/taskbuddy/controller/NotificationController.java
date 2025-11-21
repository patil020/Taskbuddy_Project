package com.taskbuddy.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import lombok.AllArgsConstructor;
import com.taskbuddy.entity.User;
import com.taskbuddy.service.NotificationService;
import com.taskbuddy.dto.NotificationDto;
import com.taskbuddy.dto.ApiResponse;
import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("/api/notifications")
@AllArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    // Send notification (can be called from other services)
    @PostMapping
    public ResponseEntity<?> send(@Valid @RequestBody NotificationDto notificationDto) {
        ApiResponse<?> response = notificationService.createNotification(notificationDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get unread notifications for a user
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<?> getUnread(@PathVariable @Positive(message = "User ID must be positive") Long userId) {
        List<NotificationDto> notifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    // Get unread notifications for current user
    @GetMapping("/unread")
    public ResponseEntity<?> getCurrentUserUnread() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        
        List<NotificationDto> notifications = notificationService.getUnreadNotifications(currentUser.getId());
        return ResponseEntity.ok(notifications);
    }

    // Mark a notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable @Positive(message = "Notification ID must be positive") Long id) {
        ApiResponse<?> response = notificationService.markAsRead(id);
        return ResponseEntity.ok(response);
    }
}
