package com.duc.notification.service;

import com.duc.notification.dto.response.NotificationResponse;
import com.duc.notification.entity.NotificationMessage;
import com.duc.notification.mapper.NotificationMapper;
import com.duc.notification.repository.NotificationRepository;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(
            NotificationRepository notificationRepository,
            NotificationMapper notificationMapper,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.notificationRepository = notificationRepository;
        this.notificationMapper = notificationMapper;
        this.messagingTemplate = messagingTemplate;
    }

    public List<NotificationResponse> latest() {
        return notificationRepository.findLatest().stream().map(notificationMapper::toResponse).toList();
    }

    @KafkaListener(topics = "rtb.notifications", groupId = "notification-service")
    public void consume(String payload) {
        NotificationMessage message = new NotificationMessage(payload);
        notificationRepository.save(message);
        messagingTemplate.convertAndSend("/topic/notifications", payload);
    }
}
