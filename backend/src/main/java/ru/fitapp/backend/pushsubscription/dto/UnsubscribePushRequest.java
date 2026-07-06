package ru.fitapp.backend.pushsubscription.dto;

import jakarta.validation.constraints.NotBlank;

public class UnsubscribePushRequest {

    @NotBlank
    private String endpoint;

    public String getEndpoint() {
        return endpoint;
    }

    public UnsubscribePushRequest setEndpoint(String endpoint) {
        this.endpoint = endpoint;
        return this;
    }
}
