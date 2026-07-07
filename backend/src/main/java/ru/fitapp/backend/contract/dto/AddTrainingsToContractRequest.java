package ru.fitapp.backend.contract.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class AddTrainingsToContractRequest {

    @NotNull(message = "Укажите количество тренировок")
    @Min(value = 1, message = "Количество тренировок должно быть не меньше 1")
    private Integer count;

    public Integer getCount() {
        return count;
    }

    public AddTrainingsToContractRequest setCount(Integer count) {
        this.count = count;
        return this;
    }
}
