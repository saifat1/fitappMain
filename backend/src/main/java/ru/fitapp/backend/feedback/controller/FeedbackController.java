package ru.fitapp.backend.feedback.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import ru.fitapp.backend.feedback.dto.CreateFeedbackRequest;
import ru.fitapp.backend.feedback.dto.FeedbackResponse;
import ru.fitapp.backend.feedback.dto.UpdateFeedbackStatusRequest;
import ru.fitapp.backend.feedback.model.FeedbackStatus;
import ru.fitapp.backend.feedback.service.FeedbackService;

import java.util.List;

/** FIT-73: ideas and problem reports. Any signed-in user sends and sees their own; the admin sees all. */
@RestController
@RequestMapping("/api")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping("/feedback")
    @ResponseStatus(HttpStatus.CREATED)
    public FeedbackResponse create(@Valid @RequestBody CreateFeedbackRequest request) {
        return feedbackService.create(request);
    }

    @GetMapping("/feedback/mine")
    public List<FeedbackResponse> getMine() {
        return feedbackService.getMine();
    }

    @GetMapping("/admin/feedback")
    public List<FeedbackResponse> getAll(@RequestParam(required = false) FeedbackStatus status) {
        return feedbackService.getAllForAdmin(status);
    }

    @PatchMapping("/admin/feedback/{id}")
    public FeedbackResponse updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateFeedbackStatusRequest request) {
        return feedbackService.updateStatus(id, request.getStatus());
    }
}
