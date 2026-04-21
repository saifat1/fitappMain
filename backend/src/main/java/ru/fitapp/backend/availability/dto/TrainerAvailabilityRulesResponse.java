package ru.fitapp.backend.availability.dto;

import java.util.List;

public class TrainerAvailabilityRulesResponse {

    private List<TrainerAvailabilityRuleResponse> rules;
    private List<TrainerAvailabilityExceptionResponse> exceptions;

    public List<TrainerAvailabilityRuleResponse> getRules() {
        return rules;
    }

    public TrainerAvailabilityRulesResponse setRules(List<TrainerAvailabilityRuleResponse> rules) {
        this.rules = rules;
        return this;
    }

    public List<TrainerAvailabilityExceptionResponse> getExceptions() {
        return exceptions;
    }

    public TrainerAvailabilityRulesResponse setExceptions(List<TrainerAvailabilityExceptionResponse> exceptions) {
        this.exceptions = exceptions;
        return this;
    }
}