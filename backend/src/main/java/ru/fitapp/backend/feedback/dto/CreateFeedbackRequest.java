package ru.fitapp.backend.feedback.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import ru.fitapp.backend.feedback.model.FeedbackType;

public class CreateFeedbackRequest {

    @NotNull(message = "Выберите тип обращения")
    private FeedbackType type;

    @NotBlank(message = "Напишите, что хотите предложить или что случилось")
    @Size(max = 4000, message = "Не больше 4000 символов")
    private String text;

    @Pattern(regexp = "WEB|ANDROID|IOS", message = "Неизвестная платформа")
    private String platform;

    @Size(max = 200)
    private String screen;

    public FeedbackType getType() {
        return type;
    }

    public CreateFeedbackRequest setType(FeedbackType type) {
        this.type = type;
        return this;
    }

    public String getText() {
        return text;
    }

    public CreateFeedbackRequest setText(String text) {
        this.text = text;
        return this;
    }

    public String getPlatform() {
        return platform;
    }

    public CreateFeedbackRequest setPlatform(String platform) {
        this.platform = platform;
        return this;
    }

    public String getScreen() {
        return screen;
    }

    public CreateFeedbackRequest setScreen(String screen) {
        this.screen = screen;
        return this;
    }
}
