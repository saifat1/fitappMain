package ru.fitapp.backend.measurement.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.measurement.dto.ClientMeasurementResponse;
import ru.fitapp.backend.measurement.service.ClientMeasurementService;
import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.user.model.UserRole;

import java.util.List;

@RestController
@RequestMapping("/api/client/measurements")
public class ClientMeasurementController {

    private final ClientMeasurementService clientMeasurementService;
    private final CurrentUserService currentUserService;

    public ClientMeasurementController(
            ClientMeasurementService clientMeasurementService,
            CurrentUserService currentUserService
    ) {
        this.clientMeasurementService = clientMeasurementService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<ClientMeasurementResponse> getMyMeasurements() {
        AppUser client = currentUserService.getCurrentUser();
        if (client.getRole() != UserRole.CLIENT) {
            throw new ApiException("ACCESS_DENIED", "Доступ разрешён только клиенту");
        }
        return clientMeasurementService.getForClient(client.getId());
    }
}
