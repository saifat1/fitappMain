package ru.fitapp.backend.availability.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class UpdateTrainerAvailabilityRulesRequest {

    @NotNull(message = "rules обязательны")
    @Valid
    private List<TrainerAvailabilityRuleRequest> rules;

    @Valid
    private List<TrainerAvailabilityExceptionRequest> exceptions;

    public List<TrainerAvailabilityRuleRequest> getRules() {
        return rules;
    }

    public UpdateTrainerAvailabilityRulesRequest setRules(List<TrainerAvailabilityRuleRequest> rules) {
        this.rules = rules;
        return this;
    }

    public List<TrainerAvailabilityExceptionRequest> getExceptions() {
        return exceptions;
    }

    public UpdateTrainerAvailabilityRulesRequest setExceptions(List<TrainerAvailabilityExceptionRequest> exceptions) {
        this.exceptions = exceptions;
        return this;
    }
}