package com.taskbuddy.dto;

import lombok.*;
import com.taskbuddy.enums.NotificationType;
import java.time.LocalDateTime;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Long id;
    
    @NotBlank(message = "Notification message is required")
    @Size(min = 1, max = 255, message = "Message must be between 1 and 255 characters")
    private String message;
    
    @NotNull(message = "Notification type is required")
    private NotificationType type;
    
    @NotNull(message = "Recipient ID is required")
    @Positive(message = "Recipient ID must be a positive number")
    private Long recipientId;
    
    private boolean read;
    private LocalDateTime createdAt;
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public NotificationType getType() {
        return type;
    }
    
    public void setType(NotificationType type) {
        this.type = type;
    }
    
    public Long getRecipientId() {
        return recipientId;
    }
    
    public void setRecipientId(Long recipientId) {
        this.recipientId = recipientId;
    }
    
    public boolean isRead() {
        return read;
    }
    
    public void setRead(boolean read) {
        this.read = read;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
