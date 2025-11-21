package com.taskbuddy.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * WebSocket configuration that registers the notification handler and
 * applies a handshake interceptor to authenticate incoming WebSocket
 * connections.  WebSockets are exposed on the "/api/ws/notifications" path.
 */
@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final NotificationWebSocketHandler notificationWebSocketHandler;
    private final NotificationHandshakeInterceptor notificationHandshakeInterceptor;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // Register the notification handler on a dedicated path and apply
        // the handshake interceptor to extract and validate JWT tokens.
        registry.addHandler(notificationWebSocketHandler, "/api/ws/notifications")
                .addInterceptors(notificationHandshakeInterceptor)
                .setAllowedOrigins(
                        "http://localhost:5173",
                        "http://127.0.0.1:5173",
                        "http://localhost:5174",
                        "http://127.0.0.1:5174"
                );
    }
}