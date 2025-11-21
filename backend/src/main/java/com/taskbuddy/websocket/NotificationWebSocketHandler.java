package com.taskbuddy.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskbuddy.dto.NotificationDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * WebSocket handler that manages client connections and broadcasts
 * notification messages to connected users.  Each connected WebSocket
 * session is associated with a user ID via attributes set by
 * {@link NotificationHandshakeInterceptor}.  When a notification is
 * created, the {@link #sendNotification(Long, NotificationDto)} method
 * is called to push the message to all sessions for the user.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationWebSocketHandler implements WebSocketHandler {

    private final ObjectMapper objectMapper;

    /**
     * Map of userId to a list of active WebSocket sessions.  A user can
     * have multiple sessions open (e.g. different browser tabs or devices).
     */
    private final Map<Long, CopyOnWriteArrayList<WebSocketSession>> userSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // Retrieve the userId set by the handshake interceptor
        Object idAttr = session.getAttributes().get("userId");
        if (idAttr instanceof Long userId) {
            userSessions.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(session);
            log.debug("WebSocket connection established for user {}", userId);
        } else {
            log.warn("WebSocket connection established without a valid userId attribute; closing session");
            session.close(CloseStatus.NOT_ACCEPTABLE);
        }
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        // This application does not expect to receive messages from clients.
        // If needed, client messages could be handled here (e.g. for read receipts).
        log.debug("Received unexpected WebSocket message: {}", message.getPayload());
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.warn("WebSocket transport error: {}", exception.getMessage());
        // Close the session on transport errors
        if (session.isOpen()) {
            session.close(CloseStatus.SERVER_ERROR);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        // Remove the session from the user sessions map
        Object idAttr = session.getAttributes().get("userId");
        if (idAttr instanceof Long userId) {
            List<WebSocketSession> sessions = userSessions.get(userId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    userSessions.remove(userId);
                }
            }
            log.debug("WebSocket connection closed for user {}", userId);
        }
    }

    @Override
    public boolean supportsPartialMessages() {
        return false;
    }

    /**
     * Sends a notification DTO to all active WebSocket sessions for the given
     * user.  If a session fails, it is removed from the list.
     *
     * @param userId the recipient user ID
     * @param dto    the notification DTO to send
     */
    public void sendNotification(Long userId, NotificationDto dto) {
        List<WebSocketSession> sessions = userSessions.get(userId);
        if (sessions == null || sessions.isEmpty()) {
            return;
        }
        for (WebSocketSession session : sessions) {
            try {
                if (session.isOpen()) {
                    String json = objectMapper.writeValueAsString(dto);
                    session.sendMessage(new TextMessage(json));
                }
            } catch (IOException e) {
                log.warn("Failed to send WebSocket notification to user {}: {}", userId, e.getMessage());
                try {
                    session.close(CloseStatus.PROTOCOL_ERROR);
                } catch (IOException ioException) {
                    // ignore further errors
                }
            }
        }
    }
}