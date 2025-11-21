package com.taskbuddy.websocket;

import com.taskbuddy.security.JwtService;
import com.taskbuddy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * Handshake interceptor that authenticates WebSocket connections using
 * JWT tokens passed either as a query parameter (token) or in the
 * Authorization header. When a valid token is found, the user's ID
 * is stored in the session attributes for use by the
 * {@link NotificationWebSocketHandler}.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final UserDetailsService userDetailsService; // <-- NEW

    @Override
    public boolean beforeHandshake(ServerHttpRequest request,
                                   ServerHttpResponse response,
                                   WebSocketHandler wsHandler,
                                   Map<String, Object> attributes) {
        // 1) Try query param ?token=...
        String token = extractTokenFromQuery(request.getURI());
        if (token != null && authenticateToken(token, attributes)) {
            return true;
        }

        // 2) Fallback: Authorization header
        token = extractTokenFromAuthorizationHeader(request);
        if (token != null && authenticateToken(token, attributes)) {
            return true;
        }

        // 3) Optional: Sec-WebSocket-Protocol header (some clients pass token here)
        token = extractTokenFromSubprotocolHeader(request);
        if (token != null && authenticateToken(token, attributes)) {
            return true;
        }

        // No valid token
        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request,
                               ServerHttpResponse response,
                               WebSocketHandler wsHandler,
                               Exception exception) {
        // No-op
    }

    /**
     * Validate JWT and store userId in attributes.
     */
    private boolean authenticateToken(String token, Map<String, Object> attributes) {
        try {
            token = sanitizeToken(token);
            String usernameOrEmail = jwtService.extractUsername(token);
            if (usernameOrEmail == null || usernameOrEmail.isBlank()) return false;

            // Load user and validate token against UserDetails (API expects 2 args)
            UserDetails userDetails = userDetailsService.loadUserByUsername(usernameOrEmail);
            if (!jwtService.isTokenValid(token, userDetails)) {
                return false;
            }

            // Try both email and username
            var userOpt = userRepository.findByEmail(usernameOrEmail)
                    .or(() -> userRepository.findByUsername(usernameOrEmail));
            if (userOpt.isPresent()) {
                attributes.put("userId", userOpt.get().getId());
                return true;
            }
        } catch (Exception e) {
            log.warn("WebSocket token authentication failed: {}", e.getMessage());
        }
        return false;
    }

    private String sanitizeToken(String token) {
        if (token == null) return null;
        token = URLDecoder.decode(token, StandardCharsets.UTF_8);
        // Strip optional Bearer prefix
        if (token.startsWith("Bearer%20")) {
            token = token.substring("Bearer%20".length());
        } else if (token.startsWith("Bearer ")) {
            token = token.substring("Bearer ".length());
        }
        // Trim quotes and whitespace
        if (token.startsWith("\"") && token.endsWith("\"") && token.length() > 1) {
            token = token.substring(1, token.length() - 1);
        }
        return token.trim();
    }

    private String extractTokenFromQuery(URI uri) {
        String query = uri.getQuery();
        if (query == null) return null;
        for (String param : query.split("&")) {
            if (param.startsWith("token=")) {
                return param.substring("token=".length());
            }
        }
        return null;
    }

    private String extractTokenFromAuthorizationHeader(ServerHttpRequest request) {
        List<String> authHeaders = request.getHeaders().get("Authorization");
        if (authHeaders == null) return null;
        for (String header : authHeaders) {
            if (header != null && header.startsWith("Bearer ")) {
                return header.substring("Bearer ".length());
            }
        }
        return null;
    }

    private String extractTokenFromSubprotocolHeader(ServerHttpRequest request) {
        List<String> sub = request.getHeaders().get("Sec-WebSocket-Protocol");
        if (sub == null) return null;
        for (String val : sub) {
            if (val == null) continue;
            // common forms: "Bearer <jwt>" or just "<jwt>"
            String t = val;
            if (t.startsWith("Bearer ")) t = t.substring(7);
            if (!t.isBlank()) return t;
        }
        return null;
    }
}
