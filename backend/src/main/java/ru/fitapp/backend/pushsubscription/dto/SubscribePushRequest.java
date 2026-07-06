package ru.fitapp.backend.pushsubscription.dto;

import jakarta.validation.constraints.NotBlank;

public class SubscribePushRequest {

    @NotBlank
    private String endpoint;

    @NotBlank
    private String p256dhKey;

    @NotBlank
    private String authKey;

    private String userAgent;

    public String getEndpoint() {
        return endpoint;
    }

    public SubscribePushRequest setEndpoint(String endpoint) {
        this.endpoint = endpoint;
        return this;
    }

    public String getP256dhKey() {
        return p256dhKey;
    }

    public SubscribePushRequest setP256dhKey(String p256dhKey) {
        this.p256dhKey = p256dhKey;
        return this;
    }

    public String getAuthKey() {
        return authKey;
    }

    public SubscribePushRequest setAuthKey(String authKey) {
        this.authKey = authKey;
        return this;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public SubscribePushRequest setUserAgent(String userAgent) {
        this.userAgent = userAgent;
        return this;
    }
}
