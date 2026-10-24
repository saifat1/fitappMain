package ru.fitapp.backend.reminder.controller;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.user.repository.UserRepository;

/** FIT-75: the «Напоминать о тренировках» switch in the trainer's and the client's profile. */
@RestController
@RequestMapping("/api/me/reminders")
public class ReminderSettingsController {

    public record ReminderSettings(boolean enabled) {
    }

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;

    public ReminderSettingsController(CurrentUserService currentUserService, UserRepository userRepository) {
        this.currentUserService = currentUserService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ReminderSettings get() {
        return new ReminderSettings(currentUserService.getCurrentUser().isTrainingReminders());
    }

    @PutMapping
    @Transactional
    public ReminderSettings update(@RequestBody ReminderSettings request) {
        AppUser user = currentUserService.getCurrentUser();
        user.setTrainingReminders(request.enabled());
        userRepository.save(user);
        return new ReminderSettings(user.isTrainingReminders());
    }
}
