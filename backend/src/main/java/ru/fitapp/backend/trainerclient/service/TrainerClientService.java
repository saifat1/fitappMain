package ru.fitapp.backend.trainerclient.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.trainerclient.entity.TrainerClient;
import ru.fitapp.backend.trainerclient.repository.TrainerClientRepository;
import ru.fitapp.backend.user.entity.AppUser;
import ru.fitapp.backend.user.model.UserRole;
import ru.fitapp.backend.user.model.UserStatus;
import ru.fitapp.backend.user.repository.UserRepository;

import java.util.List;

@Service
@Transactional
public class TrainerClientService {

    private final TrainerClientRepository trainerClientRepository;
    private final UserRepository userRepository;

    public TrainerClientService(TrainerClientRepository trainerClientRepository,
                                UserRepository userRepository) {
        this.trainerClientRepository = trainerClientRepository;
        this.userRepository = userRepository;
    }

    public TrainerClient linkTrainerToClient(AppUser trainer, AppUser client) {
        validateTrainer(trainer);
        validateClient(client);

        boolean exists = trainerClientRepository.existsByTrainerIdAndClientId(
                trainer.getId(),
                client.getId()
        );

        if (exists) {
            return trainerClientRepository.findByTrainerIdAndClientId(trainer.getId(), client.getId())
                    .orElseThrow(() -> new ApiException("INTERNAL_ERROR", "Связь тренера и клиента не найдена"));
        }

        TrainerClient trainerClient = new TrainerClient()
                .setTrainer(trainer)
                .setClient(client);

        return trainerClientRepository.save(trainerClient);
    }

    @Transactional(readOnly = true)
    public List<AppUser> getClientsOfTrainer(Long trainerId) {
        return trainerClientRepository.findAllByTrainerId(trainerId)
                .stream()
                .map(TrainerClient::getClient)
                .toList();
    }

    @Transactional(readOnly = true)
    public AppUser getClientOfTrainer(Long trainerId, Long clientId) {
        TrainerClient link = trainerClientRepository.findByTrainerIdAndClientId(trainerId, clientId)
                .orElseThrow(() -> new ApiException("CLIENT_NOT_FOUND", "Клиент не найден"));

        AppUser client = link.getClient();

        if (client.getRole() != UserRole.CLIENT) {
            throw new ApiException("CLIENT_NOT_FOUND", "Клиент не найден");
        }

        return client;
    }

    public AppUser updateClientOfTrainer(Long trainerId,
                                         Long clientId,
                                         String firstName,
                                         String lastName) {
        AppUser client = getClientOfTrainer(trainerId, clientId);

        if (firstName != null) {
            String normalizedFirstName = firstName.trim();
            client.setFirstName(normalizedFirstName.isEmpty() ? null : normalizedFirstName);
        }

        if (lastName != null) {
            String normalizedLastName = lastName.trim();
            client.setLastName(normalizedLastName.isEmpty() ? null : normalizedLastName);
        }

        return userRepository.save(client);
    }

    public void deactivateClientOfTrainer(Long trainerId, Long clientId) {
        AppUser client = getClientOfTrainer(trainerId, clientId);
        client.setStatus(UserStatus.INACTIVE);
        userRepository.save(client);
    }

    private void validateTrainer(AppUser trainer) {
        if (trainer == null || trainer.getId() == null || trainer.getRole() != UserRole.TRAINER) {
            throw new ApiException("ACCESS_DENIED", "Некорректный тренер");
        }
    }

    private void validateClient(AppUser client) {
        if (client == null || client.getId() == null || client.getRole() != UserRole.CLIENT) {
            throw new ApiException("CLIENT_NOT_FOUND", "Некорректный клиент");
        }
    }
}