package com.duc.notification.controller;

import com.duc.common.dto.response.ApiResponse;
import com.duc.notification.dto.response.NotificationResponse;
import com.duc.notification.service.NotificationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ApiResponse<List<NotificationResponse>> latest() {
        return ApiResponse.ok(notificationService.latest());
    }
}
