package ru.fitapp.backend.feedback.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.common.mail.MailService;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.feedback.dto.CreateFeedbackRequest;
import ru.fitapp.backend.feedback.dto.FeedbackResponse;
import ru.fitapp.backend.feedback.entity.Feedback;
import ru.fitapp.backend.feedback.model.FeedbackStatus;
import ru.fitapp.backend.feedback.model.FeedbackType;
import ru.fitapp.backend.feedback.repository.FeedbackRepository;
import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.user.model.UserRole;

import java.util.List;

/**
 * «Предложить идею / Сообщить о проблеме» (FIT-73): trainers and clients send ideas and problem reports,
 * see their status; the admin sorts them. Every new one is emailed to FEEDBACK_NOTIFY_EMAIL.
 */
@Service
@Transactional
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final CurrentUserService currentUserService;
    private final MailService mailService;

    @Value("${app.feedback.notify-email:}")
    private String notifyEmail;

    @Value("${app.public-base-url:http://localhost:3000}")
    private String publicBaseUrl;

    public FeedbackService(
            FeedbackRepository feedbackRepository,
            CurrentUserService currentUserService,
            MailService mailService
    ) {
        this.feedbackRepository = feedbackRepository;
        this.currentUserService = currentUserService;
        this.mailService = mailService;
    }

    public FeedbackResponse create(CreateFeedbackRequest request) {
        AppUser user = currentUserService.getCurrentUser();

        Feedback feedback = feedbackRepository.save(new Feedback()
                .setUser(user)
                .setType(request.getType())
                .setText(request.getText().trim())
                .setPlatform(request.getPlatform() != null ? request.getPlatform() : "WEB")
                .setScreen(blankToNull(request.getScreen())));

        notifyTeam(feedback, user);
        return toResponse(feedback, false);
    }

    @Transactional(readOnly = true)
    public List<FeedbackResponse> getMine() {
        AppUser user = currentUserService.getCurrentUser();
        return feedbackRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(feedback -> toResponse(feedback, false))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FeedbackResponse> getAllForAdmin(FeedbackStatus status) {
        currentUserService.getCurrentAdmin();
        List<Feedback> list = status == null
                ? feedbackRepository.findAllWithUser()
                : feedbackRepository.findAllWithUserByStatus(status);
        return list.stream().map(feedback -> toResponse(feedback, true)).toList();
    }

    public FeedbackResponse updateStatus(Long id, FeedbackStatus status) {
        currentUserService.getCurrentAdmin();
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ApiException("FEEDBACK_NOT_FOUND", "Обращение не найдено"));
        feedback.setStatus(status);
        return toResponse(feedbackRepository.save(feedback), true);
    }

    private void notifyTeam(Feedback feedback, AppUser user) {
        if (notifyEmail == null || notifyEmail.isBlank()) {
            return;
        }
        String subject = "FitApp — " + typeLabel(feedback.getType()).toLowerCase() + " от "
                + (user.getRole() == UserRole.TRAINER ? "тренера" : "клиента");
        String body = typeLabel(feedback.getType()) + " №" + feedback.getId() + "\n\n"
                + feedback.getText() + "\n\n"
                + "От: " + displayName(user) + " (" + user.getEmail() + "), "
                + (user.getRole() == UserRole.TRAINER ? "тренер" : "клиент") + "\n"
                + "Где: " + feedback.getPlatform()
                + (feedback.getScreen() != null ? ", экран " + feedback.getScreen() : "") + "\n\n"
                + "Все обращения: " + publicBaseUrl + "/admin/feedback";
        mailService.sendNotification(notifyEmail.trim(), subject, body);
    }

    private FeedbackResponse toResponse(Feedback feedback, boolean withAuthor) {
        AppUser user = withAuthor ? feedback.getUser() : null;
        return new FeedbackResponse(
                feedback.getId(),
                feedback.getType().name(),
                feedback.getText(),
                feedback.getStatus().name(),
                feedback.getPlatform(),
                feedback.getScreen(),
                feedback.getCreatedAt(),
                user != null ? user.getId() : null,
                user != null ? displayName(user) : null,
                user != null ? user.getEmail() : null,
                user != null ? user.getRole().name() : null
        );
    }

    private static String typeLabel(FeedbackType type) {
        return switch (type) {
            case IDEA -> "Идея";
            case BUG -> "Проблема";
            case OTHER -> "Обращение";
        };
    }

    private static String displayName(AppUser user) {
        String name = ((user.getFirstName() != null ? user.getFirstName() : "") + " "
                + (user.getLastName() != null ? user.getLastName() : "")).trim();
        return name.isEmpty() ? user.getEmail() : name;
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
