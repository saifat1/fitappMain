package ru.fitapp.backend.dutyslot.controller;

import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import ru.fitapp.backend.dutyslot.dto.CreateTrainerDutySlotRequest;
import ru.fitapp.backend.dutyslot.dto.TrainerDutySlotResponse;
import ru.fitapp.backend.dutyslot.service.TrainerDutySlotService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/trainer/duty-slots")
public class TrainerDutySlotController {

    private final TrainerDutySlotService trainerDutySlotService;

    public TrainerDutySlotController(TrainerDutySlotService trainerDutySlotService) {
        this.trainerDutySlotService = trainerDutySlotService;
    }

    @GetMapping
    public List<TrainerDutySlotResponse> getMyDutySlots(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to
    ) {
        return trainerDutySlotService.getMyDutySlots(from, to);
    }

    @PostMapping
    public TrainerDutySlotResponse createMyDutySlot(
            @Valid @RequestBody CreateTrainerDutySlotRequest request
    ) {
        return trainerDutySlotService.createMyDutySlot(request);
    }

    @DeleteMapping("/{id}")
    public void deleteMyDutySlot(@PathVariable Long id) {
        trainerDutySlotService.deleteMyDutySlot(id);
    }
}