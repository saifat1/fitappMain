package ru.fitapp.backend.reschedule.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import ru.fitapp.backend.reschedule.dto.CreateRescheduleRequestRequest;
import ru.fitapp.backend.reschedule.dto.ProcessRescheduleRequestRequest;
import ru.fitapp.backend.reschedule.dto.RescheduleRequestResponse;
import ru.fitapp.backend.reschedule.service.RescheduleRequestService;

import java.util.List;

@RestController
@RequestMapping("/api/reschedule-requests")
public class RescheduleRequestController {

    private final RescheduleRequestService service;

    public RescheduleRequestController(RescheduleRequestService service) {
        this.service = service;
    }

    /**
     * Клиент создаёт запрос на перенос
     */
    @PostMapping("/training/{trainingId}")
    public RescheduleRequestResponse createRequest(
            @PathVariable Long trainingId,
            @Valid @RequestBody CreateRescheduleRequestRequest request
    ) {
        return service.createRequest(trainingId, request);
    }

    /**
     * Получить список запросов текущего пользователя
     * trainer → все запросы его клиентов
     * client → свои запросы
     */
    @GetMapping
    public List<RescheduleRequestResponse> getMyRequests() {
        return service.getCurrentUserRequests();
    }

    /**
     * Получить один запрос
     */
    @GetMapping("/{id}")
    public RescheduleRequestResponse getById(@PathVariable Long id) {
        return service.getRequest(id);
    }

    /**
     * Тренер обрабатывает запрос (approve / reject)
     */
    @PostMapping("/{id}/process")
    public RescheduleRequestResponse process(
            @PathVariable Long id,
            @Valid @RequestBody ProcessRescheduleRequestRequest request
    ) {
        return service.processRequest(id, request);
    }

    /**
     * Клиент отменяет свой запрос
     */
    @PostMapping("/{id}/cancel")
    public void cancel(@PathVariable Long id) {
        service.cancelOwnRequest(id);
    }
}