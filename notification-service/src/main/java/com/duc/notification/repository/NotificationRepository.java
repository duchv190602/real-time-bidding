package com.duc.notification.repository;

import com.duc.notification.entity.NotificationMessage;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class NotificationRepository {
    private final List<NotificationMessage> storage = new ArrayList<>();

    public void save(NotificationMessage message) {
        storage.add(0, message);
    }

    public List<NotificationMessage> findLatest() {
        return storage.stream().limit(20).toList();
    }
}
