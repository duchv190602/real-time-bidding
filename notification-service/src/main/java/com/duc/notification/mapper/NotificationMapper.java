package com.duc.notification.mapper;

import com.duc.notification.dto.response.NotificationResponse;
import com.duc.notification.entity.NotificationMessage;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {
    public NotificationResponse toResponse(NotificationMessage message) {
        return new NotificationResponse(message.payload(), message.createdAt());
    }
}
