package ru.fitapp.backend.legal;

import java.util.List;

public class ConsentStatusResponse {

    private boolean requiresConsent;
    private List<String> requiredConsents;

    public boolean isRequiresConsent() {
        return requiresConsent;
    }

    public ConsentStatusResponse setRequiresConsent(boolean requiresConsent) {
        this.requiresConsent = requiresConsent;
        return this;
    }

    public List<String> getRequiredConsents() {
        return requiredConsents;
    }

    public ConsentStatusResponse setRequiredConsents(List<String> requiredConsents) {
        this.requiredConsents = requiredConsents;
        return this;
    }
}