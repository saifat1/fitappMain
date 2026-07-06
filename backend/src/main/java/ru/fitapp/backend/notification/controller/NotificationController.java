package ru.fitapp.backend.notification.controller;

import org.springframework.web.bind.annotation.*;
import ru.fitapp.backend.notification.dto.NotificationResponse;
import ru.fitapp.backend.notification.dto.UnreadCountResponse;
import ru.fitapp.backend.notification.service.NotificationService;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationResponse> getMyNotifications() {
        return notificationService.getMyNotifications();
    }

    @GetMapping("/unread-count")
    public UnreadCountResponse getUnreadCount() {
        return new UnreadCountResponse(notificationService.getUnreadCount());
    }

    @PostMapping("/{id}/read")
    public NotificationResponse markAsRead(@PathVariable Long id) {
        return notificationService.markAsRead(id);
    }

    @PostMapping("/read-all")
    public void markAllAsRead() {
        notificationService.markAllAsRead();
    }
}
