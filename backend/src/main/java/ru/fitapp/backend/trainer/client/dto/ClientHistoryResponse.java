package ru.fitapp.backend.trainer.client.dto;

import java.util.ArrayList;
import java.util.List;

public class ClientHistoryResponse {

    private ClientHistoryClientResponse client;
    private List<ClientHistoryTrainingResponse> trainings = new ArrayList<>();

    public ClientHistoryClientResponse getClient() {
        return client;
    }

    public ClientHistoryResponse setClient(ClientHistoryClientResponse client) {
        this.client = client;
        return this;
    }

    public List<ClientHistoryTrainingResponse> getTrainings() {
        return trainings;
    }

    public ClientHistoryResponse setTrainings(List<ClientHistoryTrainingResponse> trainings) {
        this.trainings = trainings;
        return this;
    }
}