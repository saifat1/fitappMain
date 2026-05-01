package ru.fitapp.backend.trainer.profile.controller;

import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.fitapp.backend.training.model.TrainingStatus;
import ru.fitapp.backend.trainer.profile.dto.ChangeTrainerPasswordRequest;
import ru.fitapp.backend.trainer.profile.dto.TrainerProfileResponse;
import ru.fitapp.backend.trainer.profile.dto.TrainerReportsResponse;
import ru.fitapp.backend.trainer.profile.dto.UpdateTrainerProfileRequest;
import ru.fitapp.backend.trainer.profile.service.TrainerProfileService;
import ru.fitapp.backend.trainer.profile.service.TrainerReportService;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/trainer/profile")
public class TrainerProfileController {

    private final TrainerProfileService trainerProfileService;
    private final TrainerReportService trainerReportService;

    public TrainerProfileController(
            TrainerProfileService trainerProfileService,
            TrainerReportService trainerReportService
    ) {
        this.trainerProfileService = trainerProfileService;
        this.trainerReportService = trainerReportService;
    }

    @GetMapping
    public TrainerProfileResponse getCurrentProfile() {
        return trainerProfileService.getCurrentProfile();
    }

    @PutMapping
    public TrainerProfileResponse updateCurrentProfile(
            @Valid @RequestBody UpdateTrainerProfileRequest request
    ) {
        return trainerProfileService.updateCurrentProfile(request);
    }

    @PostMapping("/change-password")
    public void changeCurrentPassword(
            @Valid @RequestBody ChangeTrainerPasswordRequest request
    ) {
        trainerProfileService.changeCurrentPassword(request);
    }

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public TrainerProfileResponse uploadCurrentAvatar(@RequestParam("file") MultipartFile file) {
        return trainerProfileService.uploadCurrentAvatar(file);
    }

    @DeleteMapping("/avatar")
    public TrainerProfileResponse deleteCurrentAvatar() {
        return trainerProfileService.deleteCurrentAvatar();
    }

    @GetMapping("/reports")
    public TrainerReportsResponse getReports(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to,

            @RequestParam(required = false)
            Long clientId,

            @RequestParam(required = false)
            TrainingStatus status
    ) {
        return trainerReportService.getReports(from, to, clientId, status);
    }
}