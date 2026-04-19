package com.duc.notification.dto.response;

import java.time.Instant;

public record NotificationResponse(String payload, Instant createdAt) {
}
