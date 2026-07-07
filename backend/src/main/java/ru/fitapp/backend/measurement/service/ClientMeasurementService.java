package ru.fitapp.backend.measurement.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.fitapp.backend.common.exception.ApiException;
import ru.fitapp.backend.measurement.dto.ClientMeasurementResponse;
import ru.fitapp.backend.measurement.dto.SaveClientMeasurementRequest;
import ru.fitapp.backend.measurement.entity.ClientMeasurement;
import ru.fitapp.backend.measurement.repository.ClientMeasurementRepository;
import ru.fitapp.backend.user.entity.AppUser;

import java.util.List;

@Service
@Transactional
public class ClientMeasurementService {

    private final ClientMeasurementRepository repository;

    public ClientMeasurementService(ClientMeasurementRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<ClientMeasurementResponse> getForClient(Long clientId) {
        return repository.findAllByClientIdOrderByMeasuredAtDesc(clientId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ClientMeasurementResponse create(AppUser trainer, AppUser client, SaveClientMeasurementRequest request) {
        ClientMeasurement measurement = new ClientMeasurement()
                .setClient(client)
                .setTrainer(trainer);

        applyFields(measurement, request);

        return toResponse(repository.save(measurement));
    }

    public ClientMeasurementResponse update(Long measurementId, Long clientId, SaveClientMeasurementRequest request) {
        ClientMeasurement measurement = repository.findByIdAndClientId(measurementId, clientId)
                .orElseThrow(() -> new ApiException("MEASUREMENT_NOT_FOUND", "Замер не найден"));

        applyFields(measurement, request);

        return toResponse(repository.save(measurement));
    }

    public void delete(Long measurementId, Long clientId) {
        ClientMeasurement measurement = repository.findByIdAndClientId(measurementId, clientId)
                .orElseThrow(() -> new ApiException("MEASUREMENT_NOT_FOUND", "Замер не найден"));
        repository.delete(measurement);
    }

    private void applyFields(ClientMeasurement measurement, SaveClientMeasurementRequest request) {
        measurement
                .setMeasuredAt(request.getMeasuredAt())
                .setWeightKg(request.getWeightKg())
                .setNeckCm(request.getNeckCm())
                .setChestCm(request.getChestCm())
                .setWaistCm(request.getWaistCm())
                .setHipsCm(request.getHipsCm())
                .setBicepsRightCm(request.getBicepsRightCm())
                .setBicepsLeftCm(request.getBicepsLeftCm())
                .setForearmCm(request.getForearmCm())
                .setThighCm(request.getThighCm())
                .setCalfRightCm(request.getCalfRightCm())
                .setCalfLeftCm(request.getCalfLeftCm())
                .setNotes(request.getNotes());
    }

    private ClientMeasurementResponse toResponse(ClientMeasurement m) {
        return new ClientMeasurementResponse()
                .setId(m.getId())
                .setMeasuredAt(m.getMeasuredAt())
                .setWeightKg(m.getWeightKg())
                .setNeckCm(m.getNeckCm())
                .setChestCm(m.getChestCm())
                .setWaistCm(m.getWaistCm())
                .setHipsCm(m.getHipsCm())
                .setBicepsRightCm(m.getBicepsRightCm())
                .setBicepsLeftCm(m.getBicepsLeftCm())
                .setForearmCm(m.getForearmCm())
                .setThighCm(m.getThighCm())
                .setCalfRightCm(m.getCalfRightCm())
                .setCalfLeftCm(m.getCalfLeftCm())
                .setNotes(m.getNotes());
    }
}
