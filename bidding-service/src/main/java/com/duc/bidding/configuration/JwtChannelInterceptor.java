package com.duc.bidding.configuration;

import com.nimbusds.jwt.SignedJWT;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.text.ParseException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Validates JWT on STOMP CONNECT frame.
 *
 * Strategy:
 * - If Authorization header is present → validate token → set principal
 * - If Authorization header is absent → allow as anonymous (read-only subscriber)
 *
 * This allows unauthenticated viewers to receive real-time updates.
 * Actual bid placement is secured at the HTTP layer (@PreAuthorize).
 */
@Component
@Slf4j
public class JwtChannelInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) return message;

        // Only check auth on CONNECT — subsequent frames inherit the session principal
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                // No token → allow as anonymous subscriber (read-only)
                log.info("WebSocket CONNECT accepted as anonymous (no token provided)");
                return message;
            }

            String token = authHeader.substring(7);

            try {
                SignedJWT jwt = SignedJWT.parse(token);

                // Expiry check
                java.util.Date expiry = jwt.getJWTClaimsSet().getExpirationTime();
                if (expiry == null || expiry.before(new java.util.Date())) {
                    log.warn("WebSocket CONNECT rejected: JWT token expired");
                    throw new IllegalArgumentException("JWT token expired");
                }

                String subject = jwt.getJWTClaimsSet().getSubject();

                // Extract roles from "scope" claim
                Object scopeClaim = jwt.getJWTClaimsSet().getClaim("scope");
                List<SimpleGrantedAuthority> authorities;
                if (scopeClaim instanceof String scope) {
                    authorities = List.of(scope.split(" ")).stream()
                            .filter(s -> !s.isBlank())
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList());
                } else {
                    authorities = List.of();
                }

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(subject, null, authorities);

                accessor.setUser(auth);
                log.info("WebSocket CONNECT authenticated: userId={}", subject);

            } catch (ParseException e) {
                log.warn("WebSocket CONNECT rejected: invalid JWT - {}", e.getMessage());
                throw new IllegalArgumentException("Invalid JWT token");
            }
        }

        return message;
    }
}
