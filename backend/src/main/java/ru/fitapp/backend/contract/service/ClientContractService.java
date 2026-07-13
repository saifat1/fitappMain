package ru.fitapp.backend.contract.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.contract.dto.AddTrainingsToContractRequest;
import ru.fitapp.backend.contract.dto.ClientContractResponse;
import ru.fitapp.backend.contract.dto.ClientContractSummary;
import ru.fitapp.backend.contract.dto.CreateClientContractRequest;
import ru.fitapp.backend.contract.entity.ClientContract;
import ru.fitapp.backend.contract.repository.ClientContractRepository;
import ru.fitapp.backend.training.model.TrainingStatus;
import ru.fitapp.backend.training.model.TrainingType;
import ru.fitapp.backend.training.repository.TrainingRepository;
import ru.fitapp.backend.user.entity.AppUser;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ClientContractService {

    private final ClientContractRepository clientContractRepository;
    private final TrainingRepository trainingRepository;

    public ClientContractService(ClientContractRepository clientContractRepository, TrainingRepository trainingRepository) {
        this.clientContractRepository = clientContractRepository;
        this.trainingRepository = trainingRepository;
    }

    public ClientContractResponse createContract(AppUser trainer, AppUser client, CreateClientContractRequest request) {
        int total = request.getTotalTrainings();

        ClientContract contract = new ClientContract()
                .setTrainer(trainer)
                .setClient(client)
                .setContractNumber(normalize(request.getContractNumber()))
                .setTotalTrainings(total)
                .setRemainingTrainings(total)
                .setEndDate(request.getEndDate());

        return toResponse(clientContractRepository.save(contract));
    }

    @Transactional(readOnly = true)
    public List<ClientContractResponse> getContracts(Long clientId, Long trainerId) {
        return clientContractRepository
                .findAllByClientIdAndTrainerIdOrderByCreatedAtDesc(clientId, trainerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ClientContractResponse addTrainings(Long contractId, Long clientId, Long trainerId, AddTrainingsToContractRequest request) {
        ClientContract contract = clientContractRepository.findById(contractId)
                .filter(c -> c.getClient().getId().equals(clientId) && c.getTrainer().getId().equals(trainerId))
                .orElseThrow(() -> new ApiException("CONTRACT_NOT_FOUND", "Договор не найден"));

        contract.setTotalTrainings(contract.getTotalTrainings() + request.getCount());
        contract.setRemainingTrainings(contract.getRemainingTrainings() + request.getCount());

        return toResponse(clientContractRepository.save(contract));
    }

    @Transactional(readOnly = true)
    public ClientContractSummary getSummary(Long clientId, Long trainerId) {
        boolean hasContracts = clientContractRepository.existsByClientIdAndTrainerId(clientId, trainerId);
        int totalRemaining = clientContractRepository.sumRemainingTrainings(clientId, trainerId);
        int totalGranted = clientContractRepository.sumTotalTrainings(clientId, trainerId);
        long plannedCount = trainingRepository.countByTrainerIdAndClientIdAndTrainingTypeAndStatusIn(
                trainerId, clientId, TrainingType.PERSONAL, List.of(TrainingStatus.PLANNED)
        );
        return new ClientContractSummary(hasContracts, totalRemaining, totalGranted, (int) plannedCount);
    }

    /**
     * Called when a training is marked completed. Draws one training from the
     * oldest contract that still has room, if any. Returns empty if the
     * client has no contract with remaining balance (no contracts at all, or
     * all of them exhausted) — the training is then simply not linked to any
     * contract, i.e. "проведена не в рамках договора".
     */
    public Optional<ClientContract> consumeOneForCompletedTraining(AppUser client, AppUser trainer) {
        return clientContractRepository
                .findFirstByClientIdAndTrainerIdAndRemainingTrainingsGreaterThanOrderByCreatedAtAsc(
                        client.getId(), trainer.getId(), 0
                )
                .map(contract -> {
                    contract.setRemainingTrainings(contract.getRemainingTrainings() - 1);
                    return clientContractRepository.save(contract);
                });
    }

    /**
     * Called when a completed training is restored back to "planned" (undo).
     * Gives the training back to the contract it was drawn from, if any.
     */
    public void refundOne(ClientContract contract) {
        contract.setRemainingTrainings(contract.getRemainingTrainings() + 1);
        clientContractRepository.save(contract);
    }

    private String normalize(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private ClientContractResponse toResponse(ClientContract contract) {
        return new ClientContractResponse()
                .setId(contract.getId())
                .setContractNumber(contract.getContractNumber())
                .setTotalTrainings(contract.getTotalTrainings())
                .setRemainingTrainings(contract.getRemainingTrainings())
                .setUsedTrainings(contract.getTotalTrainings() - contract.getRemainingTrainings())
                .setEndDate(contract.getEndDate())
                .setCreatedAt(contract.getCreatedAt());
    }
}
