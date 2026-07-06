package ru.fitapp.backend.pushsubscription.dto;

public class PushPublicKeyResponse {

    private String publicKey;

    public PushPublicKeyResponse() {
    }

    public PushPublicKeyResponse(String publicKey) {
        this.publicKey = publicKey;
    }

    public String getPublicKey() {
        return publicKey;
    }

    public PushPublicKeyResponse setPublicKey(String publicKey) {
        this.publicKey = publicKey;
        return this;
    }
}
