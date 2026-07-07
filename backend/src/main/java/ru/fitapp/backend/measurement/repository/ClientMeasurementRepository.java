package ru.fitapp.backend.measurement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.fitapp.backend.measurement.entity.ClientMeasurement;

import java.util.List;
import java.util.Optional;

public interface ClientMeasurementRepository extends JpaRepository<ClientMeasurement, Long> {

    List<ClientMeasurement> findAllByClientIdOrderByMeasuredAtDesc(Long clientId);

    Optional<ClientMeasurement> findByIdAndClientId(Long id, Long clientId);
}
