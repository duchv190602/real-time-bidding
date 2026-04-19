package com.duc.notification.entity;

import java.time.Instant;

public record NotificationMessage(String payload, Instant createdAt) {
    public NotificationMessage(String payload) {
        this(payload, Instant.now());
    }
}
