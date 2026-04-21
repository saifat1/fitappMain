package ru.fitapp.backend.clienttrainer.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.fitapp.backend.clienttrainer.dto.ClientTrainerResponse;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.common.security.CurrentUserService;
import ru.fitapp.backend.trainerclient.entity.TrainerClient;
import ru.fitapp.backend.trainerclient.repository.TrainerClientRepository;
import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.user.model.UserRole;

import java.util.List;

@RestController
@RequestMapping("/api/client/trainers")
public class ClientTrainerController {

    private final TrainerClientRepository trainerClientRepository;
    private final CurrentUserService currentUserService;

    public ClientTrainerController(
            TrainerClientRepository trainerClientRepository,
            CurrentUserService currentUserService
    ) {
        this.trainerClientRepository = trainerClientRepository;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<ClientTrainerResponse> getMyTrainers() {
        AppUser client = currentUserService.getCurrentUser();
        if (client.getRole() != UserRole.CLIENT) {
            throw new ApiException("ACCESS_DENIED", "Доступ разрешён только клиенту");
        }

        return trainerClientRepository.findAllByClientIdWithTrainer(client.getId())
                .stream()
                .map(TrainerClient::getTrainer)
                .map(trainer -> new ClientTrainerResponse()
                        .setTrainerId(trainer.getId())
                        .setTrainerEmail(trainer.getEmail())
                        .setTrainerFirstName(trainer.getFirstName())
                        .setTrainerLastName(trainer.getLastName()))
                .toList();
    }
}
